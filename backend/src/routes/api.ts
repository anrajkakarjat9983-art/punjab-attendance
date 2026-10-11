import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as businessCtrl from '../controllers/businessController.js';
import * as employeeCtrl from '../controllers/employeeController.js';
import * as attendanceCtrl from '../controllers/attendanceController.js';
import * as payrollCtrl from '../controllers/payrollController.js';
import * as leaveCtrl from '../controllers/leaveController.js';
import * as advanceCtrl from '../controllers/advanceController.js';
import * as cashbookCtrl from '../controllers/cashbookController.js';
import * as workRateCtrl from '../controllers/workRateController.js';
import * as approvalCtrl from '../controllers/approvalController.js';
import * as broadcastCtrl from '../controllers/broadcastController.js';
import * as notifCtrl from '../controllers/notificationController.js';
import * as perfCtrl from '../controllers/performanceController.js';
import * as settingsCtrl from '../controllers/settingsController.js';

const router = Router();

// Public auth routes
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);

// Protected routes
router.use(authenticateToken);

// Auth & user
router.get('/auth/me', authCtrl.getMe);
router.post('/profile/update', settingsCtrl.updateProfile);

// Business
router.get('/business/current', businessCtrl.getCurrentBusiness);
router.put('/business/current', businessCtrl.updateBusiness);
router.get('/business/list', businessCtrl.listBusinesses);
router.post('/business/create', businessCtrl.createBusiness);
router.get('/business/stats', businessCtrl.getBusinessStats);

// Employees / Staff
router.get('/employees', employeeCtrl.listEmployees);
router.get('/employees/:id', employeeCtrl.getEmployeeById);
router.post('/employees', employeeCtrl.createEmployee);
router.put('/employees/:id', employeeCtrl.updateEmployee);
router.delete('/employees/:id', employeeCtrl.deleteEmployee);
router.post('/employees/import', employeeCtrl.importEmployees);

// Attendance
router.get('/attendance', attendanceCtrl.getAttendance);
router.post('/attendance/mark', attendanceCtrl.markAttendance);
router.post('/attendance/bulk-mark', attendanceCtrl.bulkMarkAttendance);
router.post('/attendance/geo-punch', attendanceCtrl.geoPunch);
router.get('/attendance/summary', attendanceCtrl.getMusterRollSummary);

// Payroll
router.get('/payroll/periods', payrollCtrl.listPayrollPeriods);
router.post('/payroll/periods', payrollCtrl.createPayrollPeriod);
router.post('/payroll/calculate/:periodId', payrollCtrl.calculatePayrollPeriod);
router.get('/payroll/periods/:periodId', payrollCtrl.getPayrollPeriodDetails);
router.post('/payroll/periods/:periodId/lock', payrollCtrl.lockPayrollPeriod);
router.post('/payroll/periods/:periodId/unlock', payrollCtrl.unlockPayrollPeriod);
router.post('/payroll/pay-item/:itemId', payrollCtrl.recordSalaryPayment);
router.get('/payroll/payslip/:itemId', payrollCtrl.getPayslip);

// Leaves
router.get('/leaves', leaveCtrl.listLeaves);
router.post('/leaves', leaveCtrl.createLeaveRequest);
router.put('/leaves/:id/status', leaveCtrl.updateLeaveStatus);

// Advances
router.get('/advances', advanceCtrl.listAdvances);
router.post('/advances', advanceCtrl.createAdvance);
router.post('/advances/:id/repay', advanceCtrl.recordRepayment);

// CashBook
router.get('/cashbook', cashbookCtrl.listCashBookEntries);
router.post('/cashbook', cashbookCtrl.addCashBookEntry);

// Work Rate Cards & Daily Work Entries
router.get('/work-rate/cards', workRateCtrl.listWorkRateCards);
router.post('/work-rate/cards', workRateCtrl.createWorkRateCard);
router.get('/work-rate/entries', workRateCtrl.listDailyWorkEntries);
router.post('/work-rate/entries', workRateCtrl.addDailyWorkEntry);

// Approvals
router.get('/approvals', approvalCtrl.listApprovals);
router.post('/approvals/:id/action', approvalCtrl.actionApproval);

// Broadcasts
router.get('/broadcasts', broadcastCtrl.listBroadcasts);
router.post('/broadcasts', broadcastCtrl.createBroadcast);

// Notifications
router.get('/notifications', notifCtrl.listNotifications);
router.put('/notifications/:id/read', notifCtrl.markNotificationRead);
router.post('/notifications/clear', notifCtrl.markAllNotificationsRead);

// Performance
router.get('/performance/reviews', perfCtrl.listPerformanceReviews);
router.post('/performance/reviews', perfCtrl.createPerformanceReview);
router.get('/performance/goals', perfCtrl.listPerformanceGoals);
router.post('/performance/goals', perfCtrl.createPerformanceGoal);
router.put('/performance/goals/:id', perfCtrl.updatePerformanceGoal);

// Shifts, Departments, Branches, Organisation, Holidays, Automation
router.get('/shifts', settingsCtrl.listShifts);
router.post('/shifts', settingsCtrl.createShift);
router.get('/departments', settingsCtrl.listDepartments);
router.post('/departments', settingsCtrl.createDepartment);
router.get('/branches', settingsCtrl.listBranches);
router.post('/branches', settingsCtrl.createBranch);
router.get('/holidays', settingsCtrl.listHolidays);
router.post('/holidays', settingsCtrl.createHoliday);
router.get('/automation-rules', settingsCtrl.listAutomationRules);
router.post('/automation-rules/:id/toggle', settingsCtrl.toggleAutomationRule);
router.get('/organisation/members', settingsCtrl.listOrganisationMembers);

export default router;
