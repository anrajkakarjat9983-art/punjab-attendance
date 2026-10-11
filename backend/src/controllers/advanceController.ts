import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listAdvances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, isSettled } = req.query;

    const whereClause: any = { businessId };
    if (employeeId) whereClause.employeeId = String(employeeId);
    if (isSettled !== undefined) whereClause.isSettled = isSettled === 'true';

    const advances = await prisma.advance.findMany({
      where: whereClause,
      include: {
        employee: {
          include: { department: true },
        },
        repayments: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, advances });
  } catch (error: any) {
    console.error('listAdvances error:', error);
    res.status(500).json({ success: false, message: 'Failed to list advances' });
  }
};

export const createAdvance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, amount, reason, disbursedDate } = req.body;

    if (!employeeId || !amount) {
      res.status(400).json({ success: false, message: 'employeeId and amount are required' });
      return;
    }

    const numAmount = parseFloat(amount);
    const advance = await prisma.advance.create({
      data: {
        businessId: businessId!,
        employeeId,
        amount: numAmount,
        remainingAmount: numAmount,
        repaidAmount: 0,
        reason: reason || null,
        disbursedDate: disbursedDate ? new Date(disbursedDate) : new Date(),
        isSettled: false,
      },
      include: { employee: true },
    });

    // Also record cash out in CashBook if desired
    await prisma.cashBook.create({
      data: {
        businessId: businessId!,
        type: 'CASH_OUT',
        amount: numAmount,
        category: 'Salary Advance',
        description: `Advance issued to ${advance.employee.name} - ${reason || 'Personal'}`,
      },
    });

    res.status(201).json({ success: true, advance });
  } catch (error: any) {
    console.error('createAdvance error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue advance' });
  }
};

export const recordRepayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, source, notes, date } = req.body;

    if (!amount) {
      res.status(400).json({ success: false, message: 'Repayment amount is required' });
      return;
    }

    const advance = await prisma.advance.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!advance) {
      res.status(404).json({ success: false, message: 'Advance record not found' });
      return;
    }

    const repayNum = parseFloat(amount);
    const newRepaid = advance.repaidAmount + repayNum;
    const newRemaining = Math.max(0, advance.amount - newRepaid);

    const repayment = await prisma.repayment.create({
      data: {
        advanceId: id,
        amount: repayNum,
        source: source || 'DIRECT',
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    const updatedAdvance = await prisma.advance.update({
      where: { id },
      data: {
        repaidAmount: newRepaid,
        remainingAmount: newRemaining,
        isSettled: newRemaining === 0,
      },
      include: { repayments: true, employee: true },
    });

    // Also record cash in in CashBook
    await prisma.cashBook.create({
      data: {
        businessId: advance.businessId,
        type: 'CASH_IN',
        amount: repayNum,
        category: 'Advance Repayment',
        description: `Advance repayment from ${advance.employee.name}`,
      },
    });

    res.json({ success: true, advance: updatedAdvance, repayment });
  } catch (error: any) {
    console.error('recordRepayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record repayment' });
  }
};
