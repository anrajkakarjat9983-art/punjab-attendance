import { PrismaClient, Role, AttendanceStatus, SalaryType, LeaveStatus, ApprovalStatus, PayrollStatus, PaymentMode, CashBookType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Punjab Attendance & Payroll database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.repayment.deleteMany();
  await prisma.advance.deleteMany();
  await prisma.dailyWorkEntry.deleteMany();
  await prisma.workRateCard.deleteMany();
  await prisma.payrollItem.deleteMany();
  await prisma.payrollPeriod.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.performanceGoal.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.geoLocation.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.department.deleteMany();
  await prisma.broadcastMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.cashBook.deleteMany();
  await prisma.businessMember.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create User matching reference screenshot
  const user = await prisma.user.create({
    data: {
      name: 'Kanishk',
      email: 'kp@gmail.com',
      phone: '7891012005',
      password: hashedPassword,
      avatar: 'KA',
    },
  });

  // 2. Create Business
  const business = await prisma.business.create({
    data: {
      name: 'kanishk',
      code: 'PB-KANISHK-01',
      category: 'Textiles & Garment Manufacturing',
      address: 'Plot 45, Focal Point Phase V, Ludhiana',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141010',
      phone: '7891012005',
      email: 'kp@gmail.com',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200088992211',
      ifscCode: 'HDFC0000452',
      statementName: 'KANISHK ENTERPRISES',
      kybStatus: 'VERIFIED',
    },
  });

  // Link User to Business as OWNER
  await prisma.businessMember.create({
    data: {
      userId: user.id,
      businessId: business.id,
      role: Role.OWNER,
    },
  });

  // Secondary Business for multi-business testing
  const business2 = await prisma.business.create({
    data: {
      name: 'Punjab Foodworks',
      code: 'PB-FOOD-02',
      category: 'Restaurant & Catering',
      address: 'Mall Road, Amritsar',
      city: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      phone: '9815098150',
      email: 'contact@punjabfood.com',
      statementName: 'PUNJAB FOODWORKS LLP',
      kybStatus: 'VERIFIED',
    },
  });

  await prisma.businessMember.create({
    data: {
      userId: user.id,
      businessId: business2.id,
      role: Role.ADMIN,
    },
  });

  // 3. Departments
  const deptProd = await prisma.department.create({
    data: { businessId: business.id, name: 'Production & Manufacturing', description: 'Stitching, tailoring & packaging floor' },
  });
  const deptSales = await prisma.department.create({
    data: { businessId: business.id, name: 'Sales & Store Operations', description: 'Showroom and client deliveries' },
  });
  const deptWarehouse = await prisma.department.create({
    data: { businessId: business.id, name: 'Logistics & Warehouse', description: 'Material handling and stock dispatch' },
  });
  const deptAdmin = await prisma.department.create({
    data: { businessId: business.id, name: 'Accounts & HR', description: 'Finance, office admin and billing' },
  });

  // 4. Branches & Geo Locations
  const branchLdh = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: 'Ludhiana Factory & HQ',
      address: 'Plot 45, Focal Point Phase V, Ludhiana',
      latitude: 30.901,
      longitude: 75.8573,
      radiusMeters: 250,
    },
  });

  const branchAsr = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: 'Amritsar Outlet',
      address: 'Shop 12, Lawrence Road, Amritsar',
      latitude: 31.634,
      longitude: 74.8723,
      radiusMeters: 200,
    },
  });

  await prisma.geoLocation.create({
    data: {
      businessId: business.id,
      branchId: branchLdh.id,
      name: 'Ludhiana Main Factory Gate',
      latitude: 30.901,
      longitude: 75.8573,
      radiusMeters: 250,
    },
  });

  // 5. Shifts (Regular, Morning, Overnight)
  const shiftGeneral = await prisma.shift.create({
    data: {
      businessId: business.id,
      name: 'General Shift (9 AM - 6 PM)',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      halfDayHours: 4.5,
      fullDayHours: 8.5,
      isOvernight: false,
    },
  });

  const shiftMorning = await prisma.shift.create({
    data: {
      businessId: business.id,
      name: 'Morning Shift (7 AM - 3:30 PM)',
      startTime: '07:00',
      endTime: '15:30',
      graceMinutes: 10,
      halfDayHours: 4.0,
      fullDayHours: 8.0,
      isOvernight: false,
    },
  });

  const shiftNight = await prisma.shift.create({
    data: {
      businessId: business.id,
      name: 'Night Shift (8 PM - 5 AM)',
      startTime: '20:00',
      endTime: '05:00',
      graceMinutes: 15,
      halfDayHours: 4.5,
      fullDayHours: 8.5,
      isOvernight: true,
    },
  });

  // 6. Work Rate Cards (for piece-rate workers)
  const cardStitch = await prisma.workRateCard.create({
    data: {
      businessId: business.id,
      itemName: 'Shirt Tailoring & Stitch',
      unit: 'Piece',
      ratePerUnit: 35.0,
      description: 'Finished collared shirt assembly',
    },
  });

  const cardPack = await prisma.workRateCard.create({
    data: {
      businessId: business.id,
      itemName: 'Master Carton Packing',
      unit: 'Carton',
      ratePerUnit: 12.0,
      description: 'Tape, bubble wrap and barcode stickered master box',
    },
  });

  // 7. Employees across salary models
  const emp1 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-101',
      name: 'Gurpreet Singh',
      phone: '9814011223',
      email: 'gurpreet@kanishk.com',
      designation: 'Production Supervisor',
      departmentId: deptProd.id,
      branchId: branchLdh.id,
      shiftId: shiftGeneral.id,
      salaryType: SalaryType.MONTHLY,
      baseSalary: 28000,
      bankName: 'State Bank of India',
      accountNumber: '30018923412',
      ifscCode: 'SBIN0001421',
      panNumber: 'ABCPS1234D',
      aadhaarNumber: '761234891234',
      status: 'ACTIVE',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      businessId: business.id,
      employeeId: emp1.id,
      basicPay: 16800,
      hra: 6720,
      da: 2800,
      specialAllow: 1680,
      bonus: 1000,
      epfDeduction: 1800,
      esiDeduction: 210,
      profTax: 200,
      overtimeHourlyRate: 200,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-102',
      name: 'Harpreet Kaur',
      phone: '9876543210',
      email: 'harpreet@kanishk.com',
      designation: 'Accounts Manager',
      departmentId: deptAdmin.id,
      branchId: branchLdh.id,
      shiftId: shiftGeneral.id,
      salaryType: SalaryType.MONTHLY,
      baseSalary: 32000,
      bankName: 'HDFC Bank',
      accountNumber: '50100223344',
      ifscCode: 'HDFC0000452',
      panNumber: 'XYZPK9876L',
      aadhaarNumber: '882190341290',
      status: 'ACTIVE',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      businessId: business.id,
      employeeId: emp2.id,
      basicPay: 20000,
      hra: 8000,
      da: 2500,
      specialAllow: 1500,
      bonus: 1500,
      epfDeduction: 1800,
      esiDeduction: 0,
      profTax: 200,
      overtimeHourlyRate: 250,
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-103',
      name: 'Manpreet Sharma',
      phone: '9915012345',
      email: 'manpreet@kanishk.com',
      designation: 'Sales Executive',
      departmentId: deptSales.id,
      branchId: branchAsr.id,
      shiftId: shiftGeneral.id,
      salaryType: SalaryType.MONTHLY,
      baseSalary: 22000,
      bankName: 'Punjab National Bank',
      accountNumber: '01290001892',
      ifscCode: 'PUNB0012900',
      status: 'ACTIVE',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      businessId: business.id,
      employeeId: emp3.id,
      basicPay: 14000,
      hra: 5000,
      da: 2000,
      specialAllow: 1000,
      bonus: 500,
      epfDeduction: 1680,
      esiDeduction: 165,
      profTax: 200,
      overtimeHourlyRate: 160,
    },
  });

  const emp4 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-104',
      name: 'Jaswinder Singh',
      phone: '9417088990',
      designation: 'Senior Warehouse Handler',
      departmentId: deptWarehouse.id,
      branchId: branchLdh.id,
      shiftId: shiftMorning.id,
      salaryType: SalaryType.DAILY,
      baseSalary: 850, // Rs 850 per day
      bankName: 'Canara Bank',
      accountNumber: '110022334455',
      ifscCode: 'CNRB0001122',
      status: 'ACTIVE',
    },
  });

  const emp5 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-105',
      name: 'Balwinder Ram',
      phone: '9888012398',
      designation: 'Night Security & Dispatch',
      departmentId: deptWarehouse.id,
      branchId: branchLdh.id,
      shiftId: shiftNight.id,
      salaryType: SalaryType.DAILY,
      baseSalary: 900,
      status: 'ACTIVE',
    },
  });

  const emp6 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-106',
      name: 'Sukhdev Lal',
      phone: '9779012345',
      designation: 'Master Craftsman / Tailor',
      departmentId: deptProd.id,
      branchId: branchLdh.id,
      shiftId: shiftGeneral.id,
      salaryType: SalaryType.PIECE_RATE,
      baseSalary: 0,
      status: 'ACTIVE',
    },
  });

  const emp7 = await prisma.employee.create({
    data: {
      businessId: business.id,
      empCode: 'PB-107',
      name: 'Amandeep Singh',
      phone: '9815566778',
      designation: 'Fabric Inspector',
      departmentId: deptProd.id,
      branchId: branchLdh.id,
      shiftId: shiftMorning.id,
      salaryType: SalaryType.HOURLY,
      baseSalary: 160, // Rs 160 per hour
      status: 'ACTIVE',
    },
  });

  // 8. Piece-rate Daily Work Entries for Sukhdev Lal
  const today = new Date();
  const todayYMD = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  await prisma.dailyWorkEntry.create({
    data: {
      businessId: business.id,
      employeeId: emp6.id,
      workRateCardId: cardStitch.id,
      date: todayYMD,
      unitsCompleted: 35,
      totalAmount: 35 * 35.0, // 1225
      remarks: 'Batch #A-42 Premium Khadi shirts completed',
    },
  });

  // 9. Advances & Repayments
  const adv1 = await prisma.advance.create({
    data: {
      businessId: business.id,
      employeeId: emp4.id,
      amount: 4000,
      repaidAmount: 1500,
      remainingAmount: 2500,
      reason: 'Home repair & family function',
      isSettled: false,
    },
  });

  await prisma.repayment.create({
    data: {
      advanceId: adv1.id,
      amount: 1500,
      source: 'DIRECT',
      notes: 'Cash repaid on 5th',
    },
  });

  // 10. Attendance Records for past 7 days and Today
  const employees = [emp1, emp2, emp3, emp4, emp5, emp6, emp7];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayYMD);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 is Sunday

    for (const emp of employees) {
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      let lateMinutes = 0;
      let overtimeHours = 0;
      let workHours = 8.5;

      if (dayOfWeek === 0) {
        status = AttendanceStatus.WEEKLY_OFF;
        workHours = 0;
      } else if (i === 2 && emp.id === emp3.id) {
        status = AttendanceStatus.PAID_LEAVE;
        workHours = 0;
      } else if (i === 4 && emp.id === emp4.id) {
        status = AttendanceStatus.HALF_DAY;
        workHours = 4.5;
      } else if (i === 1 && emp.id === emp1.id) {
        lateMinutes = 25;
        overtimeHours = 1.5;
      }

      const inTime = new Date(d);
      inTime.setHours(9, lateMinutes > 0 ? 25 : 2, 0);

      const outTime = new Date(d);
      outTime.setHours(18, overtimeHours > 0 ? 30 : 5, 0);

      await prisma.attendance.create({
        data: {
          businessId: business.id,
          employeeId: emp.id,
          shiftId: emp.shiftId,
          date: d,
          status,
          checkInTime: status === AttendanceStatus.WEEKLY_OFF || status === AttendanceStatus.PAID_LEAVE ? null : inTime,
          checkOutTime: status === AttendanceStatus.WEEKLY_OFF || status === AttendanceStatus.PAID_LEAVE ? null : outTime,
          lateMinutes,
          earlyMinutes: 0,
          overtimeHours,
          workHours,
          punchMethod: i === 0 ? 'GEO' : 'MANUAL',
          latitudeIn: 30.9011,
          longitudeIn: 75.8574,
          isVerified: true,
        },
      });
    }
  }

  // 11. Leave Requests
  await prisma.leaveRequest.create({
    data: {
      businessId: business.id,
      employeeId: emp3.id,
      leaveType: 'CASUAL',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      daysCount: 2,
      reason: 'Urgent family work at ancestral village',
      status: LeaveStatus.PENDING,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      businessId: business.id,
      employeeId: emp1.id,
      leaveType: 'SICK',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      daysCount: 2,
      reason: 'Viral fever - doctor prescription attached',
      status: LeaveStatus.APPROVED,
      actionNotes: 'Approved with medical certificate verified',
    },
  });

  // 12. CashBook Transactions
  await prisma.cashBook.create({
    data: {
      businessId: business.id,
      type: CashBookType.CASH_IN,
      amount: 45000,
      category: 'Sales Receipt',
      description: 'Advance received from Apex Textiles for Order #408',
      paymentMode: PaymentMode.CASH,
    },
  });

  await prisma.cashBook.create({
    data: {
      businessId: business.id,
      type: CashBookType.CASH_OUT,
      amount: 850,
      category: 'Tea/Snacks',
      description: 'Monthly pantry milk & tea supply for floor staff',
      paymentMode: PaymentMode.CASH,
    },
  });

  await prisma.cashBook.create({
    data: {
      businessId: business.id,
      type: CashBookType.CASH_OUT,
      amount: 2400,
      category: 'Machine Maintenance',
      description: 'Oil lubrication & needle replacements for sewing batch',
      paymentMode: PaymentMode.UPI,
    },
  });

  // 13. Broadcast Messages
  await prisma.broadcastMessage.create({
    data: {
      businessId: business.id,
      title: 'Bandi Chhor Divas & Diwali Timings',
      message: 'Office and manufacturing floor will operate half-day on Friday. Full holiday on Saturday and Sunday. Bonus distribution starts Thursday.',
      targetRole: 'ALL',
    },
  });

  // 14. Notifications
  await prisma.notification.create({
    data: {
      businessId: business.id,
      userId: user.id,
      title: 'Monthly Payroll Ready for Review',
      content: 'Attendance for current cycle is reconciled. You can review and lock the payroll.',
      type: 'PAYROLL',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      businessId: business.id,
      userId: user.id,
      title: 'New Leave Request from Manpreet Sharma',
      content: '2 days Casual Leave requested starting next Monday.',
      type: 'LEAVE',
      isRead: false,
    },
  });

  // 15. Approvals
  await prisma.approval.create({
    data: {
      businessId: business.id,
      requestType: 'LEAVE',
      referenceId: emp3.id,
      title: 'Casual Leave - Manpreet Sharma (2 Days)',
      details: 'Dates: Upcoming Mon-Tue. Reason: Family event in ancestral village.',
      status: ApprovalStatus.PENDING,
    },
  });

  await prisma.approval.create({
    data: {
      businessId: business.id,
      requestType: 'ATTENDANCE_CORRECTION',
      referenceId: emp4.id,
      title: 'Punch Correction - Jaswinder Singh',
      details: 'Missed punch out due to sudden power cut at gate biometric. Reported out time 18:05.',
      status: ApprovalStatus.PENDING,
    },
  });

  // 16. Performance Reviews & Goals
  await prisma.performanceReview.create({
    data: {
      businessId: business.id,
      employeeId: emp1.id,
      reviewPeriod: 'Q3 2026',
      rating: 4.8,
      feedback: 'Excellent punctuality and shop floor discipline. Met 104% production target.',
      reviewerName: 'Kanishk',
    },
  });

  await prisma.performanceGoal.create({
    data: {
      businessId: business.id,
      employeeId: emp1.id,
      title: 'Zero Defect Garment Assembly Line Target',
      progressPct: 85,
      status: 'IN_PROGRESS',
    },
  });

  await prisma.performanceGoal.create({
    data: {
      businessId: business.id,
      employeeId: emp3.id,
      title: 'Expand Ludhiana Wholesale Client Accounts by 15%',
      progressPct: 60,
      status: 'IN_PROGRESS',
    },
  });

  // 17. Holidays
  await prisma.holiday.create({
    data: {
      businessId: business.id,
      name: 'Guru Nanak Gurpurab',
      date: new Date(today.getFullYear(), 10, 15),
      description: 'State Gazetted Holiday in Punjab',
    },
  });

  await prisma.holiday.create({
    data: {
      businessId: business.id,
      name: 'Baisakhi Festival',
      date: new Date(today.getFullYear(), 3, 13),
      description: 'Punjab State Festival Holiday',
    },
  });

  // 18. Automation Rules
  await prisma.automationRule.create({
    data: {
      businessId: business.id,
      name: 'Late Entry Penalty (3 Lates = 1/2 Day)',
      ruleType: 'LATE_PENALTY',
      parametersJson: JSON.stringify({ graceMinutes: 15, penaltyAfterOccurrences: 3, deductionFraction: 0.5 }),
      isEnabled: true,
    },
  });

  await prisma.automationRule.create({
    data: {
      businessId: business.id,
      name: 'Auto Overtime Calculation',
      ruleType: 'OVERTIME_CALC',
      parametersJson: JSON.stringify({ minOvertimeMinutes: 30, rateMultiplier: 1.5 }),
      isEnabled: true,
    },
  });

  // 19. Sample Payroll Period
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const payroll = await prisma.payrollPeriod.create({
    data: {
      businessId: business.id,
      title: `${prevMonthStart.toLocaleString('default', { month: 'long' })} ${prevMonthStart.getFullYear()}`,
      startDate: prevMonthStart,
      endDate: prevMonthEnd,
      status: PayrollStatus.REVIEWED,
      totalGross: 82000,
      totalDeduct: 5675,
      totalNet: 76325,
    },
  });

  await prisma.payrollItem.create({
    data: {
      payrollPeriodId: payroll.id,
      employeeId: emp1.id,
      totalDays: 30,
      presentDays: 25,
      halfDays: 0,
      paidLeaves: 1,
      absentDays: 0,
      payableDays: 26,
      overtimeHours: 6,
      overtimePay: 1200,
      baseEarnings: 28000,
      grossSalary: 29200,
      epfDeduction: 1800,
      esiDeduction: 210,
      taxDeduction: 200,
      advanceDeduction: 0,
      totalDeductions: 2210,
      netPayable: 26990,
      status: 'PAID',
      paymentMode: PaymentMode.BANK_TRANSFER,
      paymentDate: new Date(today.getFullYear(), today.getMonth(), 5),
      paymentRef: 'NEFT-HDFC-9923847',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
