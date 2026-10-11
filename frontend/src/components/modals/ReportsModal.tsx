import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Calendar, Users, DollarSign, BookOpen, Check } from 'lucide-react';
import api from '../../services/api';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<'attendance' | 'muster' | 'payroll' | 'cashbook'>('attendance');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen, reportType, selectedMonth, selectedYear]);

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'attendance') {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await api.getAttendance(todayStr);
        setReportData(res);
      } else if (reportType === 'muster') {
        const res = await api.getMusterRoll(selectedYear, selectedMonth);
        setReportData(res);
      } else if (reportType === 'payroll') {
        const res = await api.listPayrollPeriods();
        setReportData(res);
      } else if (reportType === 'cashbook') {
        const res = await api.listCashBook();
        setReportData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'attendance' && reportData?.staffAttendance) {
      csvContent += 'Employee Code,Name,Designation,Status,Check In,Check Out,Work Hours,Overtime\n';
      reportData.staffAttendance.forEach((item: any) => {
        csvContent += `"${item.employee.empCode}","${item.employee.name}","${item.employee.designation || ''}","${item.status}","${item.attendance?.checkInTime || '-'}","${item.attendance?.checkOutTime || '-'}","${item.attendance?.workHours || 0}","${item.attendance?.overtimeHours || 0}"\n`;
      });
    } else if (reportType === 'muster' && reportData?.summary) {
      csvContent += 'Employee Code,Name,Present,Half Day,Leaves,Weekly Off,Holidays,Payable Days,OT Hours\n';
      reportData.summary.forEach((item: any) => {
        csvContent += `"${item.employee.empCode}","${item.employee.name}","${item.present}","${item.halfDay}","${item.paidLeave}","${item.weeklyOff}","${item.holiday}","${item.payableDays}","${item.totalOvertime}"\n`;
      });
    } else if (reportType === 'cashbook' && reportData?.entries) {
      csvContent += 'Date,Type,Category,Amount,Description,Payment Mode\n';
      reportData.entries.forEach((e: any) => {
        csvContent += `"${new Date(e.date).toLocaleDateString()}","${e.type}","${e.category}","${e.amount}","${e.description || ''}","${e.paymentMode}"\n`;
      });
    } else {
      csvContent += 'Export generated from Punjab Attendance & Payroll (100% Free)\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `punjab_${reportType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3478E8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Business Reports</h2>
              <p className="text-xs text-[#737B86]">100% Free unlimited exports in CSV & PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Types Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 text-center text-xs font-semibold">
          {[
            { id: 'attendance', label: 'Daily Attend.' },
            { id: 'muster', label: 'Muster Roll' },
            { id: 'payroll', label: 'Salary Reg.' },
            { id: 'cashbook', label: 'CashBook' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`py-3 transition-colors border-b-2 ${
                reportType === tab.id
                  ? 'border-[#3478E8] text-[#3478E8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Report Body View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Compiling report data...</div>
          ) : reportType === 'attendance' && reportData?.staffAttendance ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-1">
                <span>Date: {reportData.date}</span>
                <span>Total Staff: {reportData.staffAttendance.length}</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {reportData.staffAttendance.map((item: any) => (
                  <div key={item.employee.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{item.employee.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({item.employee.empCode})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'HALF_DAY'
                          ? 'bg-yellow-100 text-yellow-700'
                          : item.status === 'WEEKLY_OFF'
                          ? 'bg-blue-100 text-blue-700'
                          : item.status === 'UNMARKED'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : reportType === 'muster' && reportData?.summary ? (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 pb-1">
                Monthly Master Roll for Month: {reportData.period.month}/{reportData.period.year}
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {reportData.summary.map((item: any) => (
                  <div key={item.employee.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{item.employee.name}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        P: {item.present} · HD: {item.halfDay} · L: {item.paidLeave} · WO: {item.weeklyOff}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{item.payableDays} Payable Days</span>
                      <span className="text-[10px] text-blue-600 font-medium">OT: {item.totalOvertime} hrs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : reportType === 'cashbook' && reportData?.entries ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs pb-2 border-b border-slate-100">
                <div className="p-2 bg-green-50 rounded-xl">
                  <span className="text-[10px] text-green-700 block">Total In</span>
                  <span className="font-bold text-green-800">₹{reportData.summary?.totalIn}</span>
                </div>
                <div className="p-2 bg-red-50 rounded-xl">
                  <span className="text-[10px] text-red-700 block">Total Out</span>
                  <span className="font-bold text-red-800">₹{reportData.summary?.totalOut}</span>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <span className="text-[10px] text-blue-700 block">Net Balance</span>
                  <span className="font-bold text-[#3478E8]">₹{reportData.summary?.netBalance}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {reportData.entries.map((e: any) => (
                  <div key={e.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">{e.category}</span>
                      <span className="text-[10px] text-slate-400 block">{e.description || 'Entry'}</span>
                    </div>
                    <span className={`font-bold ${e.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {e.type === 'CASH_IN' ? '+' : '-'}₹{e.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">Select report view</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#E9EDF2] flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 py-2.5 bg-[#3478E8] hover:bg-[#2563EB] text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Full CSV Export (Free)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsModal;
