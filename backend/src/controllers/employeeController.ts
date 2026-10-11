import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { SalaryType } from '@prisma/client';

export const listEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const { departmentId, salaryType, status, search } = req.query;

    const whereClause: any = {
      businessId,
    };

    if (departmentId && departmentId !== 'ALL') {
      whereClause.departmentId = String(departmentId);
    }
    if (salaryType && salaryType !== 'ALL') {
      whereClause.salaryType = salaryType as SalaryType;
    }
    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { empCode: { contains: q } },
        { phone: { contains: q } },
        { designation: { contains: q } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        branch: true,
        shift: true,
        salaryStructure: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, employees });
  } catch (error: any) {
    console.error('listEmployees error:', error);
    res.status(500).json({ success: false, message: 'Failed to list staff' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({
      where: { id, businessId },
      include: {
        department: true,
        branch: true,
        shift: true,
        salaryStructure: true,
        advances: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        dailyWorkEntries: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { workRateCard: true },
        },
      },
    });

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    res.json({ success: true, employee });
  } catch (error: any) {
    console.error('getEmployeeById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const {
      name,
      empCode,
      phone,
      email,
      designation,
      departmentId,
      branchId,
      shiftId,
      salaryType,
      baseSalary,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      aadhaarNumber,
      address,
      emergencyContact,
      // Salary breakdown fields (supports flat or nested salaryStructure object)
      basicPay,
      hra,
      da,
      specialAllow,
      bonus,
      epfDeduction,
      esiDeduction,
      profTax,
      overtimeHourlyRate,
      salaryStructure,
    } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Staff name is required' });
      return;
    }

    // Auto-generate code if not provided
    let finalEmpCode = empCode;
    if (!finalEmpCode) {
      const count = await prisma.employee.count({ where: { businessId } });
      finalEmpCode = `PB-${101 + count}`;
    }

    const resolvedSalaryType = (salaryType as SalaryType) || SalaryType.MONTHLY;

    const employee = await prisma.employee.create({
      data: {
        businessId,
        empCode: finalEmpCode,
        name,
        phone: phone || null,
        email: email || null,
        designation: designation || 'Staff Member',
        departmentId: departmentId || null,
        branchId: branchId || null,
        shiftId: shiftId || null,
        salaryType: resolvedSalaryType,
        baseSalary: parseFloat(baseSalary || '0'),
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        ifscCode: ifscCode || null,
        panNumber: panNumber || null,
        aadhaarNumber: aadhaarNumber || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
      },
    });

    const structObj = salaryStructure || {};
    const finalBasic = basicPay !== undefined ? basicPay : structObj.basicPay;
    const finalHra = hra !== undefined ? hra : structObj.hra;
    const finalDa = da !== undefined ? da : structObj.da;
    const finalSpecial = specialAllow !== undefined ? specialAllow : structObj.specialAllow;
    const finalBonus = bonus !== undefined ? bonus : structObj.bonus;
    const finalEpf = epfDeduction !== undefined ? epfDeduction : structObj.epfDeduction;
    const finalEsi = esiDeduction !== undefined ? esiDeduction : structObj.esiDeduction;
    const finalProfTax = profTax !== undefined ? profTax : structObj.profTax;
    const finalOtRate = overtimeHourlyRate !== undefined ? overtimeHourlyRate : structObj.overtimeHourlyRate;

    // Only default basic/hra for monthly salaried employees
    const defaultBasic = resolvedSalaryType === SalaryType.MONTHLY ? String(parseFloat(baseSalary || '0') * 0.6) : '0';
    const defaultHra = resolvedSalaryType === SalaryType.MONTHLY ? String(parseFloat(baseSalary || '0') * 0.2) : '0';

    // Create salary structure
    await prisma.salaryStructure.create({
      data: {
        businessId,
        employeeId: employee.id,
        basicPay: parseFloat(finalBasic !== undefined ? String(finalBasic) : defaultBasic),
        hra: parseFloat(finalHra !== undefined ? String(finalHra) : defaultHra),
        da: parseFloat(finalDa !== undefined ? String(finalDa) : '0'),
        specialAllow: parseFloat(finalSpecial !== undefined ? String(finalSpecial) : '0'),
        bonus: parseFloat(finalBonus !== undefined ? String(finalBonus) : '0'),
        epfDeduction: parseFloat(finalEpf !== undefined ? String(finalEpf) : '0'),
        esiDeduction: parseFloat(finalEsi !== undefined ? String(finalEsi) : '0'),
        profTax: parseFloat(finalProfTax !== undefined ? String(finalProfTax) : '0'),
        overtimeHourlyRate: parseFloat(finalOtRate !== undefined ? String(finalOtRate) : '0'),
      },
    });

    const fullEmployee = await prisma.employee.findUnique({
      where: { id: employee.id },
      include: {
        department: true,
        branch: true,
        shift: true,
        salaryStructure: true,
      },
    });

    res.status(201).json({ success: true, employee: fullEmployee });
  } catch (error: any) {
    console.error('createEmployee error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create staff' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const {
      name,
      empCode,
      phone,
      email,
      designation,
      departmentId,
      branchId,
      shiftId,
      status,
      salaryType,
      baseSalary,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      aadhaarNumber,
      address,
      emergencyContact,
      // Salary breakdown
      basicPay,
      hra,
      da,
      specialAllow,
      bonus,
      epfDeduction,
      esiDeduction,
      profTax,
      otherDeductions,
      overtimeHourlyRate,
    } = req.body;

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        empCode: empCode !== undefined ? empCode : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        designation: designation !== undefined ? designation : undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
        branchId: branchId !== undefined ? branchId : undefined,
        shiftId: shiftId !== undefined ? shiftId : undefined,
        status: status !== undefined ? status : undefined,
        salaryType: salaryType !== undefined ? (salaryType as SalaryType) : undefined,
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        accountNumber: accountNumber !== undefined ? accountNumber : undefined,
        ifscCode: ifscCode !== undefined ? ifscCode : undefined,
        panNumber: panNumber !== undefined ? panNumber : undefined,
        aadhaarNumber: aadhaarNumber !== undefined ? aadhaarNumber : undefined,
        address: address !== undefined ? address : undefined,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
      },
    });

    // Update or create salary structure
    if (basicPay !== undefined || hra !== undefined || epfDeduction !== undefined) {
      await prisma.salaryStructure.upsert({
        where: { employeeId: id },
        create: {
          businessId: businessId!,
          employeeId: id,
          basicPay: parseFloat(basicPay || '0'),
          hra: parseFloat(hra || '0'),
          da: parseFloat(da || '0'),
          specialAllow: parseFloat(specialAllow || '0'),
          bonus: parseFloat(bonus || '0'),
          epfDeduction: parseFloat(epfDeduction || '0'),
          esiDeduction: parseFloat(esiDeduction || '0'),
          profTax: parseFloat(profTax || '0'),
          otherDeductions: parseFloat(otherDeductions || '0'),
          overtimeHourlyRate: parseFloat(overtimeHourlyRate || '0'),
        },
        update: {
          basicPay: basicPay !== undefined ? parseFloat(basicPay) : undefined,
          hra: hra !== undefined ? parseFloat(hra) : undefined,
          da: da !== undefined ? parseFloat(da) : undefined,
          specialAllow: specialAllow !== undefined ? parseFloat(specialAllow) : undefined,
          bonus: bonus !== undefined ? parseFloat(bonus) : undefined,
          epfDeduction: epfDeduction !== undefined ? parseFloat(epfDeduction) : undefined,
          esiDeduction: esiDeduction !== undefined ? parseFloat(esiDeduction) : undefined,
          profTax: profTax !== undefined ? parseFloat(profTax) : undefined,
          otherDeductions: otherDeductions !== undefined ? parseFloat(otherDeductions) : undefined,
          overtimeHourlyRate: overtimeHourlyRate !== undefined ? parseFloat(overtimeHourlyRate) : undefined,
        },
      });
    }

    const fullEmployee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        branch: true,
        shift: true,
        salaryStructure: true,
      },
    });

    res.json({ success: true, employee: fullEmployee });
  } catch (error: any) {
    console.error('updateEmployee error:', error);
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Soft delete by marking INACTIVE or hard delete if no payroll locked
    await prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    res.json({ success: true, message: 'Employee marked inactive' });
  } catch (error: any) {
    console.error('deleteEmployee error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
};

export const importEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const { staffList } = req.body;
    if (!Array.isArray(staffList) || staffList.length === 0) {
      res.status(400).json({ success: false, message: 'staffList array is required' });
      return;
    }

    const results = [];
    for (const item of staffList) {
      const code = item.empCode || `PB-${Math.floor(100 + Math.random() * 900)}`;
      const emp = await prisma.employee.create({
        data: {
          businessId,
          name: item.name,
          empCode: code,
          phone: item.phone || null,
          designation: item.designation || 'Staff',
          salaryType: (item.salaryType as SalaryType) || SalaryType.MONTHLY,
          baseSalary: parseFloat(item.baseSalary || '0'),
          status: 'ACTIVE',
        },
      });
      await prisma.salaryStructure.create({
        data: {
          businessId,
          employeeId: emp.id,
          basicPay: parseFloat(item.baseSalary || '0') * 0.6,
          hra: parseFloat(item.baseSalary || '0') * 0.2,
        },
      });
      results.push(emp);
    }

    res.json({ success: true, count: results.length, employees: results });
  } catch (error: any) {
    console.error('importEmployees error:', error);
    res.status(500).json({ success: false, message: 'Failed to import staff' });
  }
};
