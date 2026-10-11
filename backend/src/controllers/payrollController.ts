import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { PayrollStatus, PaymentMode, SalaryType } from '@prisma/client';
import { parseDateOnly } from '../utils/dateUtils.js';

export const listPayrollPeriods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const periods = await prisma.payrollPeriod.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json({ success: true, periods });
  } catch (error: any) {
    console.error('listPayrollPeriods error:', error);
    res.status(500).json({ success: false, message: 'Failed to list payroll periods' });
  }
};

export const createPayrollPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const { title, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'title, startDate and endDate are required' });
      return;
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        businessId,
        title,
        startDate: parseDateOnly(startDate),
        endDate: parseDateOnly(endDate),
        status: PayrollStatus.DRAFT,
      },
    });

    res.status(201).json({ success: true, period });
  } catch (error: any) {
    console.error('createPayrollPeriod error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payroll period' });
  }
};

export const calculatePayrollPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { periodId } = req.params;

    const period = await prisma.payrollPeriod.findFirst({
      where: { id: periodId, businessId },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Payroll period not found' });
      return;
    }

    if (period.status === PayrollStatus.LOCKED || period.status === PayrollStatus.PAID) {
      res.status(400).json({ success: false, message: 'Locked or Paid payroll period cannot be recalculated' });
      return;
    }

    // 1. Load active employees
    const employees = await prisma.employee.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: {
        salaryStructure: true,
        advances: {
          where: { isSettled: false },
        },
      },
    });

    // 2. Load attendance records for this period
    const attendances = await prisma.attendance.findMany({
      where: {
        businessId,
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    });

    // 3. Load daily piece rate work entries
    const workEntries = await prisma.dailyWorkEntry.findMany({
      where: {
        businessId,
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    });

    // Total days in calendar period
    const startMs = period.startDate.getTime();
    const endMs = period.endDate.getTime();
    const totalDaysInPeriod = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;

    let periodGrossTotal = 0;
    let periodDeductTotal = 0;
    let periodNetTotal = 0;

    // Delete existing unapproved items for clean recalculation
    await prisma.payrollItem.deleteMany({
      where: { payrollPeriodId: periodId },
    });

    const items = [];

    for (const emp of employees) {
      const empAttendance = attendances.filter((a) => a.employeeId === emp.id);
      const empEntries = workEntries.filter((w) => w.employeeId === emp.id);

      const presentDays = empAttendance.filter((a) => a.status === 'PRESENT').length;
      const halfDays = empAttendance.filter((a) => a.status === 'HALF_DAY').length;
      const paidLeaves = empAttendance.filter((a) => a.status === 'PAID_LEAVE').length;
      const weeklyOffs = empAttendance.filter((a) => a.status === 'WEEKLY_OFF').length;
      const holidays = empAttendance.filter((a) => a.status === 'HOLIDAY').length;
      const absentDays = empAttendance.filter((a) => a.status === 'ABSENT').length;

      const overtimeHours = empAttendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
      const totalWorkHours = empAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

      // Payable days calculation
      const payableDays = presentDays + halfDays * 0.5 + paidLeaves + weeklyOffs + holidays;

      let baseEarnings = 0;
      let pieceRatePay = 0;
      let overtimePay = 0;

      const salaryStruct = emp.salaryStructure;
      const otRate = salaryStruct?.overtimeHourlyRate || 100;
      overtimePay = Math.round(overtimeHours * otRate * 100) / 100;

      if (emp.salaryType === SalaryType.MONTHLY) {
        // Daily rate based on month days
        const effectiveTotalDays = totalDaysInPeriod || 30;
        const perDayRate = emp.baseSalary / effectiveTotalDays;
        baseEarnings = Math.round(payableDays * perDayRate * 100) / 100;
      } else if (emp.salaryType === SalaryType.DAILY) {
        baseEarnings = Math.round(payableDays * emp.baseSalary * 100) / 100;
      } else if (emp.salaryType === SalaryType.HOURLY) {
        baseEarnings = Math.round(totalWorkHours * emp.baseSalary * 100) / 100;
      } else if (emp.salaryType === SalaryType.WEEKLY) {
        baseEarnings = Math.round((payableDays / 7) * emp.baseSalary * 100) / 100;
      } else if (emp.salaryType === SalaryType.PIECE_RATE) {
        // Sum total amount from daily work entries
        pieceRatePay = empEntries.reduce((acc, curr) => acc + curr.totalAmount, 0);
        baseEarnings = 0;
      }

      const allowances = (salaryStruct?.hra || 0) + (salaryStruct?.da || 0) + (salaryStruct?.specialAllow || 0);
      const bonuses = salaryStruct?.bonus || 0;
      const arrears = 0;

      const grossSalary = Math.round((baseEarnings + pieceRatePay + overtimePay + allowances + bonuses + arrears) * 100) / 100;

      // Deductions
      const epfDeduction = salaryStruct?.epfDeduction || 0;
      const esiDeduction = salaryStruct?.esiDeduction || 0;
      const taxDeduction = salaryStruct?.profTax || 0;

      // Advance deduction check (up to remaining amount or max 30% of earnings)
      let advanceDeduction = 0;
      const activeAdvance = emp.advances[0];
      if (activeAdvance && activeAdvance.remainingAmount > 0) {
        const potentialRecovery = Math.min(activeAdvance.remainingAmount, grossSalary * 0.25);
        advanceDeduction = Math.round(potentialRecovery * 100) / 100;
      }

      const otherDeductions = salaryStruct?.otherDeductions || 0;
      const totalDeductions = Math.round((epfDeduction + esiDeduction + taxDeduction + advanceDeduction + otherDeductions) * 100) / 100;
      const netPayable = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

      periodGrossTotal += grossSalary;
      periodDeductTotal += totalDeductions;
      periodNetTotal += netPayable;

      const item = await prisma.payrollItem.create({
        data: {
          payrollPeriodId: periodId,
          employeeId: emp.id,
          totalDays: totalDaysInPeriod,
          presentDays,
          halfDays,
          paidLeaves,
          absentDays,
          payableDays,
          overtimeHours,
          overtimePay,
          baseEarnings,
          pieceRatePay,
          allowances,
          bonuses,
          arrears,
          grossSalary,
          epfDeduction,
          esiDeduction,
          taxDeduction,
          advanceDeduction,
          otherDeductions,
          totalDeductions,
          netPayable,
          status: 'PENDING',
        },
      });

      items.push(item);
    }

    // Update period header
    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.REVIEWED,
        totalGross: Math.round(periodGrossTotal * 100) / 100,
        totalDeduct: Math.round(periodDeductTotal * 100) / 100,
        totalNet: Math.round(periodNetTotal * 100) / 100,
      },
    });

    res.json({
      success: true,
      period: updatedPeriod,
      itemsCount: items.length,
      totals: {
        gross: updatedPeriod.totalGross,
        deductions: updatedPeriod.totalDeduct,
        net: updatedPeriod.totalNet,
      },
    });
  } catch (error: any) {
    console.error('calculatePayrollPeriod error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate payroll' });
  }
};

export const getPayrollPeriodDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { periodId } = req.params;

    const period = await prisma.payrollPeriod.findFirst({
      where: { id: periodId, businessId },
      include: {
        items: {
          include: {
            employee: {
              include: {
                department: true,
                shift: true,
              },
            },
            payments: true,
          },
          orderBy: {
            employee: { name: 'asc' },
          },
        },
      },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Payroll period not found' });
      return;
    }

    res.json({ success: true, period });
  } catch (error: any) {
    console.error('getPayrollPeriodDetails error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll period' });
  }
};

export const lockPayrollPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { periodId } = req.params;

    const period = await prisma.payrollPeriod.findFirst({
      where: { id: periodId, businessId },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Payroll period not found' });
      return;
    }

    const locked = await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.LOCKED,
        lockedAt: new Date(),
      },
    });

    res.json({ success: true, period: locked, message: 'Payroll approved and locked successfully' });
  } catch (error: any) {
    console.error('lockPayrollPeriod error:', error);
    res.status(500).json({ success: false, message: 'Failed to lock payroll period' });
  }
};

export const recordSalaryPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { mode, referenceNo, paymentDate, notes, amount } = req.body;

    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { employee: true, payrollPeriod: true, payments: true },
    });

    if (!item) {
      res.status(404).json({ success: false, message: 'Payroll line item not found' });
      return;
    }

    const totalAlreadyPaid = item.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingDue = Math.max(0, parseFloat((item.netPayable - totalAlreadyPaid).toFixed(2)));

    // Prevent payment if already fully paid
    if (item.status === 'PAID' || remainingDue <= 0) {
      res.status(400).json({
        success: false,
        message: 'Salary for this employee in this period has already been fully paid',
      });
      return;
    }

    // Duplicate transaction reference check
    if (referenceNo && referenceNo.trim() !== '') {
      const existingRef = await prisma.paymentRecord.findFirst({
        where: { referenceNo: referenceNo.trim() },
      });
      if (existingRef) {
        res.status(400).json({
          success: false,
          message: `Duplicate payment detected: Reference number ${referenceNo} has already been recorded`,
        });
        return;
      }
    }

    const parsedAmount = amount !== undefined && amount !== null ? parseFloat(amount) : NaN;
    const payAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parseFloat(parsedAmount.toFixed(2)) : remainingDue;

    if (payAmount > remainingDue) {
      res.status(400).json({
        success: false,
        message: `Payment amount ₹${payAmount} exceeds remaining payable amount ₹${remainingDue}`,
      });
      return;
    }

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        payrollItem: { connect: { id: itemId } },
        amount: payAmount,
        mode: (mode as PaymentMode) || PaymentMode.BANK_TRANSFER,
        referenceNo: referenceNo || `TXN-${Date.now()}`,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || null,
      },
    });

    const newTotalPaid = parseFloat((totalAlreadyPaid + payAmount).toFixed(2));
    const isFullyPaid = newTotalPaid >= item.netPayable;
    const newStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID';

    // Update item status
    const updatedItem = await prisma.payrollItem.update({
      where: { id: itemId },
      data: {
        status: newStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode: (mode as PaymentMode) || PaymentMode.BANK_TRANSFER,
        paymentRef: referenceNo || paymentRecord.referenceNo,
      },
    });

    // If advance was deducted and salary is now fully paid, settle the advance balance
    if (isFullyPaid && item.advanceDeduction > 0) {
      const advance = await prisma.advance.findFirst({
        where: { employeeId: item.employeeId, isSettled: false },
      });
      if (advance) {
        const newRepaid = advance.repaidAmount + item.advanceDeduction;
        const newRemaining = Math.max(0, advance.amount - newRepaid);
        await prisma.advance.update({
          where: { id: advance.id },
          data: {
            repaidAmount: newRepaid,
            remainingAmount: newRemaining,
            isSettled: newRemaining === 0,
          },
        });
        await prisma.repayment.create({
          data: {
            advance: { connect: { id: advance.id } },
            amount: item.advanceDeduction,
            source: 'PAYROLL',
            notes: `Auto deduction from payroll period ${item.payrollPeriod.title}`,
          },
        });
      }
    }

    res.json({
      success: true,
      payment: paymentRecord,
      item: updatedItem,
      totalPaid: newTotalPaid,
      remainingDue: Math.max(0, parseFloat((item.netPayable - newTotalPaid).toFixed(2))),
    });
  } catch (error: any) {
    console.error('recordSalaryPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
};

export const unlockPayrollPeriod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { periodId } = req.params;
    const { reason } = req.body;

    // Check role authorization: Only OWNER or ADMIN may unlock
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Authorized correction requires OWNER or ADMIN permissions' });
      return;
    }

    if (!reason || String(reason).trim().length < 5) {
      res.status(400).json({ success: false, message: 'A valid reason (minimum 5 characters) is required for authorized payroll correction' });
      return;
    }

    const period = await prisma.payrollPeriod.findFirst({
      where: { id: periodId, businessId },
      include: {
        items: {
          include: { payments: true },
        },
      },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Payroll period not found' });
      return;
    }

    // Check if any disbursed payments exist
    const hasDisbursedPayments = period.items.some(
      (item) => item.payments.length > 0 || item.status === 'PAID' || item.status === 'PARTIALLY_PAID'
    );
    if (hasDisbursedPayments) {
      res.status(400).json({
        success: false,
        message: 'Cannot unlock payroll with disbursed salary payments. Void or reverse payments before unlocking.',
      });
      return;
    }

    // Log the authorized correction to AuditLog
    await prisma.auditLog.create({
      data: {
        businessId: businessId!,
        userId: req.user.id,
        action: 'UNLOCK_PAYROLL',
        details: `Authorized correction by ${req.user.name} (${req.user.role}): ${reason}`,
      },
    });

    const updated = await prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.REVIEWED,
        lockedAt: null,
      },
    });

    res.json({
      success: true,
      period: updated,
      message: 'Payroll period unlocked for authorized correction',
    });
  } catch (error: any) {
    console.error('unlockPayrollPeriod error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock payroll period' });
  }
};

export const getPayslip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: {
        payrollPeriod: {
          include: { business: true },
        },
        employee: {
          include: {
            department: true,
            shift: true,
            salaryStructure: true,
          },
        },
        payments: true,
      },
    });

    if (!item) {
      res.status(404).json({ success: false, message: 'Payslip not found' });
      return;
    }

    res.json({ success: true, payslip: item });
  } catch (error: any) {
    console.error('getPayslip error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payslip' });
  }
};
