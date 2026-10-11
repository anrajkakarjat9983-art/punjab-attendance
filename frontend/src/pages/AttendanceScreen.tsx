import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceStatus, StaffAttendanceItem, Employee } from '../types';
import api from '../services/api';
import StaffProfileModal from '../components/modals/StaffProfileModal';
import ReportsModal from '../components/modals/ReportsModal';

export const AttendanceScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Punch modal state
  const [punchingItem, setPunchingItem] = useState<StaffAttendanceItem | null>(null);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('18:00');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [lateMinutes, setLateMinutes] = useState('0');
  const [punchNotes, setPunchNotes] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance(selectedDate);
      if (res.success) {
        setStaffAttendance(res.staffAttendance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const changeDateByDays = (delta: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + delta);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleQuickMark = async (item: StaffAttendanceItem, status: AttendanceStatus) => {
    try {
      const res = await api.markAttendance({
        employeeId: item.employee.id,
        date: selectedDate,
        status,
        punchMethod: 'MANUAL',
      });
      if (res.success) {
        loadAttendance();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to mark attendance');
    }
  };

  const handleOpenDetailedPunch = (item: StaffAttendanceItem) => {
    setPunchingItem(item);
    const rec = item.attendance;
    if (rec?.checkInTime) {
      const d = new Date(rec.checkInTime);
      setCheckInTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    } else {
      setCheckInTime('09:00');
    }

    if (rec?.checkOutTime) {
      const d = new Date(rec.checkOutTime);
      setCheckOutTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    } else {
      setCheckOutTime('18:00');
    }

    setOvertimeHours(rec?.overtimeHours ? String(rec.overtimeHours) : '0');
    setLateMinutes(rec?.lateMinutes ? String(rec.lateMinutes) : '0');
    setPunchNotes(rec?.notes || '');
  };

  const handleSaveDetailedPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchingItem) return;

    const inDate = new Date(`${selectedDate}T${checkInTime}:00`);
    const outDate = new Date(`${selectedDate}T${checkOutTime}:00`);

    try {
      const res = await api.markAttendance({
        employeeId: punchingItem.employee.id,
        date: selectedDate,
        status: punchingItem.status === 'UNMARKED' ? 'PRESENT' : punchingItem.status,
        checkInTime: inDate.toISOString(),
        checkOutTime: outDate.toISOString(),
        overtimeHours,
        lateMinutes,
        notes: punchNotes,
        punchMethod: 'MANUAL',
      });
      if (res.success) {
        setPunchingItem(null);
        loadAttendance();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating attendance');
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!confirm('Mark all active staff as PRESENT for this day?')) return;
    try {
      const res = await api.bulkMarkAttendance(selectedDate, 'PRESENT');
      if (res.success) loadAttendance();
    } catch (e) {
      console.error(e);
    }
  };

  // Counts
  const presentCount = staffAttendance.filter((i) => i.status === 'PRESENT').length;
  const halfDayCount = staffAttendance.filter((i) => i.status === 'HALF_DAY').length;
  const leaveCount = staffAttendance.filter((i) => i.status === 'PAID_LEAVE' || i.status === 'UNPAID_LEAVE').length;
  const absentCount = staffAttendance.filter((i) => i.status === 'ABSENT').length;
  const weeklyOffCount = staffAttendance.filter((i) => i.status === 'WEEKLY_OFF').length;

  const filtered = staffAttendance.filter((i) => {
    const matchSearch =
      i.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      i.employee.empCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      {/* Date Navigation Header */}
      <div className="bg-[#EFF6FF] border-b border-[#E3EDFA] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 rounded-xl bg-white/90 border border-blue-100 hover:bg-white text-slate-700 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#3478E8]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-sm text-[#1E293B] focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 rounded-xl bg-white/90 border border-blue-100 hover:bg-white text-slate-700 shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 bg-white/90 border border-blue-200 text-[#3478E8] font-bold text-xs rounded-xl shadow-2xs"
            >
              Today
            </button>
            <button
              onClick={() => setShowReports(true)}
              className="p-1.5 rounded-xl bg-white/90 border border-blue-200 text-slate-600 hover:text-[#3478E8]"
              title="Reports & Muster Roll"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3">
        {/* Attendance Metric Pills */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div
            onClick={() => setFilterStatus(filterStatus === 'PRESENT' ? 'ALL' : 'PRESENT')}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'PRESENT'
                ? 'bg-green-100 border-green-300 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-green-50/50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Present</span>
            <span className="text-sm font-black text-green-700">{presentCount}</span>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'HALF_DAY' ? 'ALL' : 'HALF_DAY')}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'HALF_DAY'
                ? 'bg-amber-100 border-amber-300 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-amber-50/50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Half Day</span>
            <span className="text-sm font-black text-amber-700">{halfDayCount}</span>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'PAID_LEAVE' ? 'ALL' : 'PAID_LEAVE')}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'PAID_LEAVE'
                ? 'bg-blue-100 border-blue-300 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-blue-50/50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Leave</span>
            <span className="text-sm font-black text-blue-700">{leaveCount}</span>
          </div>

          <div
            onClick={() => setFilterStatus(filterStatus === 'ABSENT' ? 'ALL' : 'ABSENT')}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'ABSENT'
                ? 'bg-red-100 border-red-300 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-red-50/50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Absent</span>
            <span className="text-sm font-black text-red-700">{absentCount}</span>
          </div>
        </div>

        {/* Quick Action Bar: Search & Bulk Mark */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#3478E8]"
            />
          </div>

          <button
            onClick={handleBulkMarkPresent}
            className="px-3 py-2 bg-[#3478E8] hover:bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-xs whitespace-nowrap"
          >
            Mark All Present
          </button>
        </div>

        {/* Staff Attendance List */}
        <div className="space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading attendance data...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No staff records match filter.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.employee.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2.5 hover:border-blue-200 transition-all"
              >
                {/* Employee Row */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      setSelectedStaff(item.employee);
                      setShowProfile(true);
                    }}
                    className="flex items-center space-x-2.5 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                      {item.employee.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs text-[#1E293B] group-hover:text-[#3478E8]">
                          {item.employee.name}
                        </h4>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {item.employee.empCode}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.employee.shift?.name || 'General (9-6)'}</span>
                        {item.employee.shift?.isOvernight && (
                          <span className="text-[10px] text-indigo-600 font-semibold flex items-center">
                            <Moon className="w-2.5 h-2.5 ml-0.5" /> Overnight
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed punch trigger */}
                  <button
                    onClick={() => handleOpenDetailedPunch(item)}
                    className="text-right group active:scale-95"
                  >
                    <div className="flex items-center space-x-1 text-slate-600 group-hover:text-[#3478E8]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold">
                        {item.attendance?.checkInTime
                          ? new Date(item.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </span>
                    </div>
                    {item.attendance?.overtimeHours ? (
                      <span className="text-[10px] font-bold text-green-600 block">
                        +{item.attendance.overtimeHours}h OT
                      </span>
                    ) : item.attendance?.lateMinutes ? (
                      <span className="text-[10px] font-bold text-amber-600 block">
                        {item.attendance.lateMinutes}m Late
                      </span>
                    ) : null}
                  </button>
                </div>

                {/* Status Toggle Buttons Row */}
                <div className="grid grid-cols-6 gap-1 pt-1 border-t border-slate-100 text-[11px] font-bold">
                  {/* P */}
                  <button
                    onClick={() => handleQuickMark(item, 'PRESENT')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'PRESENT'
                        ? 'bg-green-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    P
                  </button>

                  {/* A */}
                  <button
                    onClick={() => handleQuickMark(item, 'ABSENT')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'ABSENT'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    A
                  </button>

                  {/* HD */}
                  <button
                    onClick={() => handleQuickMark(item, 'HALF_DAY')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'HALF_DAY'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    HD
                  </button>

                  {/* L (Leave) */}
                  <button
                    onClick={() => handleQuickMark(item, 'PAID_LEAVE')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'PAID_LEAVE' || item.status === 'UNPAID_LEAVE'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    L
                  </button>

                  {/* WO (Weekly Off) */}
                  <button
                    onClick={() => handleQuickMark(item, 'WEEKLY_OFF')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'WEEKLY_OFF'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    WO
                  </button>

                  {/* HO (Holiday) */}
                  <button
                    onClick={() => handleQuickMark(item, 'HOLIDAY')}
                    className={`py-1 rounded-lg transition-all ${
                      item.status === 'HOLIDAY'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    HO
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Punch Adjustment Modal */}
      {punchingItem && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800">
                Adjust Punch - {punchingItem.employee.name}
              </h3>
              <button onClick={() => setPunchingItem(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailedPunch} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Punch In Time</label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Punch Out Time</label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Overtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-green-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Late Entry (Mins)</label>
                  <input
                    type="number"
                    value={lateMinutes}
                    onChange={(e) => setLateMinutes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Punch Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Overtime approved for dispatch"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#3478E8] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Save Attendance Record
              </button>
            </form>
          </div>
        </div>
      )}

      <StaffProfileModal
        employee={selectedStaff}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onRefresh={loadAttendance}
      />

      <ReportsModal isOpen={showReports} onClose={() => setShowReports(false)} />
    </div>
  );
};

export default AttendanceScreen;
