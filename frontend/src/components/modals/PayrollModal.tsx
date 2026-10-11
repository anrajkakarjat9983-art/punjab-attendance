import React, { useState, useEffect } from 'react';
import { X, Calendar, Calculator, CheckCircle2, Lock, DollarSign, Download, Eye, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { PayrollPeriod, PayrollItem } from '../../types';
import api from '../../services/api';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayrollModal: React.FC<PayrollModalProps> = ({ isOpen, onClose }) => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePayslip, setActivePayslip] = useState<any>(null);
  const [payingItem, setPayingItem] = useState<PayrollItem | null>(null);
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPeriods();
    }
  }, [isOpen]);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.listPayrollPeriods();
      if (res.success) {
        setPeriods(res.periods);
        if (res.periods.length > 0 && !selectedPeriod) {
          loadPeriodDetail(res.periods[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodDetail = async (id: string) => {
    try {
      const res = await api.getPayrollPeriod(id);
      if (res.success) {
        setSelectedPeriod(res.period);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !startDate || !endDate) return;
    try {
      const res = await api.createPayrollPeriod({
        title: newTitle,
        startDate,
        endDate,
      });
      if (res.success) {
        setShowCreateForm(false);
        setNewTitle('');
        await loadPeriods();
        await loadPeriodDetail(res.period.id);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create period');
    }
  };

  const handleCalculate = async () => {
    if (!selectedPeriod) return;
    setCalculating(true);
    try {
      const res = await api.calculatePayroll(selectedPeriod.id);
      if (res.success) {
        await loadPeriodDetail(selectedPeriod.id);
        await loadPeriods();
      }
    } catch (e: any) {
      alert(e.message || 'Calculation error');
    } finally {
      setCalculating(false);
    }
  };

  const handleLockPayroll = async () => {
    if (!selectedPeriod) return;
    if (!confirm('Are you sure you want to approve and lock this payroll period? Once locked, calculations are final.')) return;
    try {
      const res = await api.lockPayroll(selectedPeriod.id);
      if (res.success) {
        await loadPeriodDetail(selectedPeriod.id);
        await loadPeriods();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to lock payroll');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingItem) return;
    try {
      const res = await api.recordPayment(payingItem.id, {
        mode: paymentMode,
        referenceNo: paymentRef || `TXN-${Date.now()}`,
      });
      if (res.success) {
        setPayingItem(null);
        await loadPeriodDetail(selectedPeriod.id);
      }
    } catch (e: any) {
      alert(e.message || 'Payment recording failed');
    }
  };

  const openPayslip = async (itemId: string) => {
    try {
      const res = await api.getPayslip(itemId);
      if (res.success) {
        setActivePayslip(res.payslip);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#1E293B]">Payroll Management</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                100% Free
              </span>
            </div>
            <p className="text-xs text-[#737B86]">Decimal-safe salary computation & bank payments</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Selector & Action Bar */}
        <div className="p-3 bg-[#F8FAFC] border-b border-[#E9EDF2] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod?.id || ''}
              onChange={(e) => loadPeriodDetail(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
            >
              + New Period
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedPeriod && selectedPeriod.status !== 'LOCKED' && selectedPeriod.status !== 'PAID' && (
              <>
                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="px-3 py-1.5 bg-[#3478E8] hover:bg-[#2563EB] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{calculating ? 'Reconciling...' : 'Compute Salary'}</span>
                </button>
                <button
                  onClick={handleLockPayroll}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Approve & Lock</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Create Period Form Dialog */}
        {showCreateForm && (
          <form onSubmit={handleCreatePeriod} className="p-3 bg-blue-50/70 border-b border-blue-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-900">Create New Payroll Cycle</span>
              <button type="button" onClick={() => setShowCreateForm(false)} className="text-xs text-blue-600 font-semibold">
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Cycle Title (e.g. November 2026)"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
              />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
              />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
              />
            </div>
            <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
              Start Payroll Cycle
            </button>
          </form>
        )}

        {/* Selected Period Stats Banner */}
        {selectedPeriod && (
          <div className="p-3 bg-white border-b border-slate-100 grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Cycle Status</span>
              <span className="text-xs font-bold text-slate-800">{selectedPeriod.status}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Gross Payable</span>
              <span className="text-xs font-bold text-slate-800">₹{selectedPeriod.totalGross.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Total Deductions</span>
              <span className="text-xs font-bold text-red-600">-₹{selectedPeriod.totalDeduct.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-600 block font-semibold">Net Payout</span>
              <span className="text-xs font-extrabold text-[#3478E8]">₹{selectedPeriod.totalNet.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading payroll items...</div>
          ) : !selectedPeriod?.items || selectedPeriod.items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-500">No salary calculations compiled for this cycle yet.</p>
              <button
                onClick={handleCalculate}
                className="px-4 py-2 bg-[#3478E8] text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Reconcile Attendance & Compute Salary
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPeriod.items.map((item: PayrollItem) => (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-[#1E293B]">{item.employee.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                          {item.employee.empCode}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({item.employee.salaryType})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Payable Days: <b className="text-slate-800">{item.payableDays}</b> (P:{item.presentDays}, HD:{item.halfDays}, L:{item.paidLeaves})
                        {item.overtimeHours > 0 && ` · OT: ${item.overtimeHours}h (₹${item.overtimePay})`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{item.netPayable.toLocaleString()}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Deduction breakdown tag */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <div>
                      Gross: ₹{item.grossSalary}
                      {item.advanceDeduction > 0 && ` · Adv Ded: -₹${item.advanceDeduction}`}
                      {item.epfDeduction > 0 && ` · EPF: -₹${item.epfDeduction}`}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openPayslip(item.id)}
                        className="text-[#3478E8] hover:underline font-semibold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Payslip</span>
                      </button>

                      {item.status !== 'PAID' && (
                        <button
                          onClick={() => setPayingItem(item)}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-[10px]"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Record Payment Sub-modal */}
        {payingItem && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">Record Salary Payment</h3>
                <button onClick={() => setPayingItem(null)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Employee: <b>{payingItem.employee.name}</b> · Amount: <b>₹{payingItem.netPayable}</b>
              </p>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-99238471 or Cash Slip"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={handleRecordPayment}
                className="w-full py-2 bg-green-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Confirm Payment & Update Balance
              </button>
            </div>
          </div>
        )}

        {/* Itemized Payslip View Modal */}
        {activePayslip && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#1E293B]">
                    {activePayslip.payrollPeriod?.business?.name || 'Punjab Enterprise'}
                  </h3>
                  <p className="text-xs text-slate-500">Payslip for {activePayslip.payrollPeriod?.title}</p>
                </div>
                <button onClick={() => setActivePayslip(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Employee Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Name:</span>
                  <span className="font-bold text-slate-800">{activePayslip.employee?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Emp Code:</span>
                  <span className="font-mono font-bold text-slate-800">{activePayslip.employee?.empCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department:</span>
                  <span className="font-medium text-slate-700">{activePayslip.employee?.department?.name || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bank A/C:</span>
                  <span className="font-mono text-slate-700">{activePayslip.employee?.accountNumber || 'Cash Payment'}</span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Earnings */}
                <div className="space-y-1.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900 block pb-1 border-b border-blue-200">Earnings</span>
                  <div className="flex justify-between">
                    <span>Base Earnings</span>
                    <span className="font-semibold">₹{activePayslip.baseEarnings}</span>
                  </div>
                  {activePayslip.pieceRatePay > 0 && (
                    <div className="flex justify-between">
                      <span>Piece Rate</span>
                      <span className="font-semibold">₹{activePayslip.pieceRatePay}</span>
                    </div>
                  )}
                  {activePayslip.overtimePay > 0 && (
                    <div className="flex justify-between">
                      <span>Overtime</span>
                      <span className="font-semibold">₹{activePayslip.overtimePay}</span>
                    </div>
                  )}
                  {activePayslip.allowances > 0 && (
                    <div className="flex justify-between">
                      <span>Allowances</span>
                      <span className="font-semibold">₹{activePayslip.allowances}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-blue-200 font-bold text-slate-900">
                    <span>Total Gross</span>
                    <span>₹{activePayslip.grossSalary}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-1.5 p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <span className="font-bold text-red-900 block pb-1 border-b border-red-200">Deductions</span>
                  <div className="flex justify-between">
                    <span>EPF Share</span>
                    <span className="font-semibold">₹{activePayslip.epfDeduction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESI Share</span>
                    <span className="font-semibold">₹{activePayslip.esiDeduction}</span>
                  </div>
                  {activePayslip.advanceDeduction > 0 && (
                    <div className="flex justify-between">
                      <span>Advance Rec.</span>
                      <span className="font-semibold">₹{activePayslip.advanceDeduction}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-red-200 font-bold text-red-700">
                    <span>Total Deduct</span>
                    <span>₹{activePayslip.totalDeductions}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Callout */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 font-medium">Net Take-Home Pay</span>
                  <h4 className="text-lg font-black text-emerald-700">₹{activePayslip.netPayable.toLocaleString()}</h4>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg text-emerald-800 border border-emerald-200">
                  {activePayslip.status}
                </span>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-[#3478E8] text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Print / Download Payslip PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollModal;
