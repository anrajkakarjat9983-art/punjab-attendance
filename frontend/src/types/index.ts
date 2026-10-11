export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'PAID_LEAVE'
  | 'UNPAID_LEAVE'
  | 'WEEKLY_OFF'
  | 'HOLIDAY'
  | 'UNMARKED';

export type SalaryType = 'MONTHLY' | 'DAILY' | 'HOURLY' | 'WEEKLY' | 'PIECE_RATE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Business {
  id: string;
  name: string;
  code?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  logo?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  statementName?: string;
  kybStatus?: string;
  role?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: { employees: number };
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  _count?: { employees: number };
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  halfDayHours: number;
  fullDayHours: number;
  isOvernight: boolean;
  _count?: { employees: number };
}

export interface SalaryStructure {
  id?: string;
  basicPay: number;
  hra: number;
  da: number;
  specialAllow: number;
  bonus: number;
  epfDeduction: number;
  esiDeduction: number;
  profTax: number;
  otherDeductions?: number;
  overtimeHourlyRate: number;
}

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  departmentId?: string;
  department?: Department;
  branchId?: string;
  branch?: Branch;
  shiftId?: string;
  shift?: Shift;
  salaryType: SalaryType;
  baseSalary: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  emergencyContact?: string;
  status: string;
  salaryStructure?: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: Employee;
  shiftId?: string;
  shift?: Shift;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes: number;
  earlyMinutes: number;
  overtimeHours: number;
  workHours: number;
  punchMethod: string;
  latitudeIn?: number;
  longitudeIn?: number;
  latitudeOut?: number;
  longitudeOut?: number;
  notes?: string;
  isVerified: boolean;
}

export interface StaffAttendanceItem {
  employee: Employee;
  attendance: AttendanceRecord | null;
  status: AttendanceStatus;
}

export interface PayrollPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'REVIEWED' | 'LOCKED' | 'PAID';
  totalGross: number;
  totalDeduct: number;
  totalNet: number;
  lockedAt?: string;
  _count?: { items: number };
}

export interface PayrollItem {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  employee: Employee;
  totalDays: number;
  presentDays: number;
  halfDays: number;
  paidLeaves: number;
  absentDays: number;
  payableDays: number;
  overtimeHours: number;
  overtimePay: number;
  baseEarnings: number;
  pieceRatePay: number;
  allowances: number;
  bonuses: number;
  arrears: number;
  grossSalary: number;
  epfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  status: string;
  paymentDate?: string;
  paymentMode?: string;
  paymentRef?: string;
  payments?: any[];
}

export interface Advance {
  id: string;
  employeeId: string;
  employee: Employee;
  amount: number;
  repaidAmount: number;
  remainingAmount: number;
  disbursedDate: string;
  reason?: string;
  isSettled: boolean;
  repayments?: any[];
}

export interface CashBookEntry {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  category: string;
  description?: string;
  paymentMode: string;
  date: string;
}

export interface WorkRateCard {
  id: string;
  itemName: string;
  unit: string;
  ratePerUnit: number;
  description?: string;
}

export interface DailyWorkEntry {
  id: string;
  employeeId: string;
  employee: Employee;
  workRateCardId: string;
  workRateCard: WorkRateCard;
  date: string;
  unitsCompleted: number;
  totalAmount: number;
  remarks?: string;
}

export interface Approval {
  id: string;
  requestType: string;
  referenceId: string;
  title: string;
  details?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  actionBy?: User;
  actionNotes?: string;
  createdAt: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetRole: string;
  sentAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  ruleType: string;
  parametersJson: string;
  isEnabled: boolean;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employee: Employee;
  reviewPeriod: string;
  rating: number;
  feedback?: string;
  reviewerName?: string;
  createdAt: string;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employee: Employee;
  title: string;
  targetDate?: string;
  status: string;
  progressPct: number;
}
