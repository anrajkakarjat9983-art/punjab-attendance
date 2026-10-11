const metaEnv = (import.meta as any).env;
const API_BASE = (metaEnv?.VITE_API_URL ? String(metaEnv.VITE_API_URL).replace(/\/$/, '') : '') + '/api';

class ApiClient {
  private token: string | null = null;
  private currentBusinessId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('pb_auth_token');
    this.currentBusinessId = localStorage.getItem('pb_current_business_id');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('pb_auth_token', token);
    } else {
      localStorage.removeItem('pb_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setBusinessId(id: string | null) {
    this.currentBusinessId = id;
    if (id) {
      localStorage.setItem('pb_current_business_id', id);
    } else {
      localStorage.removeItem('pb_current_business_id');
    }
  }

  getBusinessId(): string | null {
    return this.currentBusinessId;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.currentBusinessId) {
      headers['x-business-id'] = this.currentBusinessId;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `Request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.message || errMsg;
      } catch (e) {
        // fallback
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  // Auth
  async login(identifier: string, password: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      this.setToken(res.token);
      if (res.currentBusiness?.id) {
        this.setBusinessId(res.currentBusiness.id);
      }
    }
    return res;
  }

  async register(data: any) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
      if (res.currentBusiness?.id) {
        this.setBusinessId(res.currentBusiness.id);
      }
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Business
  async getCurrentBusiness() {
    return this.request('/business/current');
  }

  async updateBusiness(data: any) {
    return this.request('/business/current', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listBusinesses() {
    return this.request('/business/list');
  }

  async createBusiness(data: any) {
    return this.request('/business/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBusinessStats() {
    return this.request('/business/stats');
  }

  // Staff / Employees
  async listEmployees(params?: { departmentId?: string; salaryType?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/employees?${query}`);
  }

  async getEmployee(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async importEmployees(staffList: any[]) {
    return this.request('/employees/import', {
      method: 'POST',
      body: JSON.stringify({ staffList }),
    });
  }

  // Attendance
  async getAttendance(date?: string, employeeId?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (employeeId) params.append('employeeId', employeeId);
    return this.request(`/attendance?${params.toString()}`);
  }

  async markAttendance(data: any) {
    // Offline queue check
    if (!navigator.onLine) {
      this.queueOfflinePunch(data);
      return { success: true, offlineQueued: true };
    }
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkMarkAttendance(date: string, status: string, employeeIds?: string[]) {
    return this.request('/attendance/bulk-mark', {
      method: 'POST',
      body: JSON.stringify({ date, status, employeeIds }),
    });
  }

  async geoPunch(employeeId: string, latitude: number, longitude: number, punchType: 'IN' | 'OUT') {
    return this.request('/attendance/geo-punch', {
      method: 'POST',
      body: JSON.stringify({ employeeId, latitude, longitude, punchType }),
    });
  }

  async getMusterRoll(year: number, month: number) {
    return this.request(`/attendance/summary?year=${year}&month=${month}`);
  }

  // Offline queue management
  private queueOfflinePunch(data: any) {
    const queue = JSON.parse(localStorage.getItem('pb_offline_punches') || '[]');
    queue.push({ ...data, queuedAt: new Date().toISOString() });
    localStorage.setItem('pb_offline_punches', JSON.stringify(queue));
  }

  async syncOfflinePunches() {
    const raw = localStorage.getItem('pb_offline_punches');
    if (!raw) return { synced: 0 };
    const queue = JSON.parse(raw);
    let count = 0;
    const remaining = [];
    for (const item of queue) {
      try {
        await this.request('/attendance/mark', {
          method: 'POST',
          body: JSON.stringify(item),
        });
        count++;
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem('pb_offline_punches', JSON.stringify(remaining));
    return { synced: count, remaining: remaining.length };
  }

  // Payroll
  async listPayrollPeriods() {
    return this.request('/payroll/periods');
  }

  async createPayrollPeriod(data: { title: string; startDate: string; endDate: string }) {
    return this.request('/payroll/periods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculatePayroll(periodId: string) {
    return this.request(`/payroll/calculate/${periodId}`, {
      method: 'POST',
    });
  }

  async getPayrollPeriod(periodId: string) {
    return this.request(`/payroll/periods/${periodId}`);
  }

  async lockPayroll(periodId: string) {
    return this.request(`/payroll/periods/${periodId}/lock`, {
      method: 'POST',
    });
  }

  async unlockPayroll(periodId: string, reason: string) {
    return this.request(`/payroll/periods/${periodId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async recordPayment(itemId: string, data: any) {
    return this.request(`/payroll/pay-item/${itemId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayslip(itemId: string) {
    return this.request(`/payroll/payslip/${itemId}`);
  }

  // Leaves
  async listLeaves(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/leaves${query}`);
  }

  async createLeave(data: any) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeaveStatus(id: string, status: string, actionNotes?: string) {
    return this.request(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, actionNotes }),
    });
  }

  // Advances
  async listAdvances() {
    return this.request('/advances');
  }

  async createAdvance(data: any) {
    return this.request('/advances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async repayAdvance(id: string, data: any) {
    return this.request(`/advances/${id}/repay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CashBook
  async listCashBook(type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/cashbook${query}`);
  }

  async addCashBook(data: any) {
    return this.request('/cashbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Work Rate & Daily Work
  async listWorkRateCards() {
    return this.request('/work-rate/cards');
  }

  async createWorkRateCard(data: any) {
    return this.request('/work-rate/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listDailyWorkEntries(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request(`/work-rate/entries${query}`);
  }

  async addDailyWorkEntry(data: any) {
    return this.request('/work-rate/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Approvals
  async listApprovals(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/approvals${query}`);
  }

  async actionApproval(id: string, status: string, actionNotes?: string) {
    return this.request(`/approvals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ status, actionNotes }),
    });
  }

  // Broadcasts
  async listBroadcasts() {
    return this.request('/broadcasts');
  }

  async createBroadcast(data: any) {
    return this.request('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async listNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async clearNotifications() {
    return this.request('/notifications/clear', { method: 'POST' });
  }

  // Performance
  async listPerformanceReviews() {
    return this.request('/performance/reviews');
  }

  async createPerformanceReview(data: any) {
    return this.request('/performance/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listPerformanceGoals() {
    return this.request('/performance/goals');
  }

  async createPerformanceGoal(data: any) {
    return this.request('/performance/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePerformanceGoal(id: string, data: any) {
    return this.request(`/performance/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async listShifts() {
    return this.request('/shifts');
  }

  async createShift(data: any) {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listDepartments() {
    return this.request('/departments');
  }

  async createDepartment(data: any) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listBranches() {
    return this.request('/branches');
  }

  async createBranch(data: any) {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listHolidays() {
    return this.request('/holidays');
  }

  async createHoliday(data: any) {
    return this.request('/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listAutomationRules() {
    return this.request('/automation-rules');
  }

  async toggleAutomationRule(id: string, isEnabled: boolean) {
    return this.request(`/automation-rules/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isEnabled }),
    });
  }

  async listMembers() {
    return this.request('/organisation/members');
  }

  async updateProfile(data: any) {
    return this.request('/profile/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
export default api;
