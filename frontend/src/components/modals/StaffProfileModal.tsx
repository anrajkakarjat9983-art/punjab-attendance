import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, Clock, DollarSign, Calendar, Shield, CreditCard, Edit3 } from 'lucide-react';
import { Employee } from '../../types';
import api from '../../services/api';

interface StaffProfileModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  employee,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [empDetail, setEmpDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance' | 'advance'>('overview');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [advLoading, setAdvLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.id) {
      loadDetails();
    }
  }, [isOpen, employee]);

  const loadDetails = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const res = await api.getEmployee(employee.id);
      if (res.success) {
        setEmpDetail(res.employee);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !advanceAmount) return;
    setAdvLoading(true);
    try {
      await api.createAdvance({
        employeeId: employee.id,
        amount: advanceAmount,
        reason: advanceReason,
      });
      setAdvanceAmount('');
      setAdvanceReason('');
      await loadDetails();
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to issue advance');
    } finally {
      setAdvLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  const currentEmp = empDetail || employee;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-[#E9EDF2] flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3478E8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {currentEmp.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#1E293B]">{currentEmp.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  {currentEmp.status}
                </span>
              </div>
              <p className="text-xs text-[#737B86] mt-0.5">
                {currentEmp.designation} · {currentEmp.empCode}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/80 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 px-3 bg-white text-xs font-semibold text-slate-600">
          {(['overview', 'salary', 'attendance', 'advance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 border-b-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'border-[#3478E8] text-[#3478E8]'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Phone Number</span>
                  <span className="font-semibold text-slate-800">{currentEmp.phone || 'Not provided'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Wage Type</span>
                  <span className="font-semibold text-slate-800">{currentEmp.salaryType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Assigned Shift</span>
                  <span className="font-semibold text-slate-800">{currentEmp.shift?.name || 'General (9-6)'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Branch Location</span>
                  <span className="font-semibold text-slate-800">{currentEmp.branch?.name || 'Ludhiana Works'}</span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-[#3478E8]" /> Bank Account Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Bank: </span>
                    <span className="font-medium text-slate-700">{currentEmp.bankName || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">IFSC: </span>
                    <span className="font-mono text-slate-700">{currentEmp.ifscCode || 'Not Set'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Account No: </span>
                    <span className="font-mono font-medium text-slate-700">{currentEmp.accountNumber || 'Not Set'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 font-medium">Base Compensation</span>
                  <h3 className="text-xl font-bold text-[#1E293B]">
                    {currentEmp.salaryType === 'MONTHLY' && `₹${currentEmp.baseSalary.toLocaleString()}/month`}
                    {currentEmp.salaryType === 'DAILY' && `₹${currentEmp.baseSalary}/day`}
                    {currentEmp.salaryType === 'HOURLY' && `₹${currentEmp.baseSalary}/hour`}
                    {currentEmp.salaryType === 'PIECE_RATE' && `Per Item Rate Card`}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white text-blue-600 rounded-lg shadow-2xs">
                  {currentEmp.salaryType}
                </span>
              </div>

              {currentEmp.salaryStructure && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700 mb-2">Configured Structure Breakdown</h4>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Basic Pay</span>
                    <span className="font-semibold">₹{currentEmp.salaryStructure.basicPay}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">HRA</span>
                    <span className="font-semibold">₹{currentEmp.salaryStructure.hra}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">EPF Employee Share</span>
                    <span className="font-semibold text-red-600">-₹{currentEmp.salaryStructure.epfDeduction}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">ESI Employee Share</span>
                    <span className="font-semibold text-red-600">-₹{currentEmp.salaryStructure.esiDeduction}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Overtime Rate</span>
                    <span className="font-semibold text-green-600">₹{currentEmp.salaryStructure.overtimeHourlyRate}/hr</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600">Recent Attendance Records</h4>
              {currentEmp.attendance?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent records found.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {currentEmp.attendance?.slice(0, 10).map((att: any) => (
                    <div key={att.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">
                          {new Date(att.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">Method: {att.punchMethod}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'PRESENT'
                            ? 'bg-green-100 text-green-700'
                            : att.status === 'HALF_DAY'
                            ? 'bg-yellow-100 text-yellow-700'
                            : att.status === 'WEEKLY_OFF'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'advance' && (
            <div className="space-y-4">
              {/* Issue new advance */}
              <form onSubmit={handleIssueAdvance} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700">Issue Salary Advance</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    required
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Reason / Note"
                    value={advanceReason}
                    onChange={(e) => setAdvanceReason(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={advLoading}
                  className="w-full py-1.5 bg-[#3478E8] text-white font-semibold text-xs rounded-lg hover:bg-[#2563EB]"
                >
                  {advLoading ? 'Issuing...' : 'Approve & Disburse Advance'}
                </button>
              </form>

              {/* Existing advances */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600">Active & Past Advances</h4>
                {currentEmp.advances?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">No advance history for this employee.</p>
                ) : (
                  currentEmp.advances?.map((adv: any) => (
                    <div key={adv.id} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Advance: ₹{adv.amount}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            adv.isSettled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {adv.isSettled ? 'SETTLED' : `Remaining: ₹${adv.remainingAmount}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{adv.reason || 'Personal advance'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfileModal;
