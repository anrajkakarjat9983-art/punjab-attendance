import React, { useState } from 'react';
import { X, User, Phone, Briefcase, DollarSign, Building, CreditCard, Check } from 'lucide-react';
import { SalaryType } from '../../types';
import api from '../../services/api';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onStaffAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    empCode: '',
    phone: '',
    email: '',
    designation: '',
    salaryType: 'MONTHLY' as SalaryType,
    baseSalary: '25000',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    // Breakdown
    basicPay: '15000',
    hra: '5000',
    epfDeduction: '1800',
    esiDeduction: '190',
    overtimeHourlyRate: '150',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSalaryTypeChange = (type: SalaryType) => {
    let base = formData.baseSalary;
    if (type === 'MONTHLY') base = '25000';
    if (type === 'DAILY') base = '850';
    if (type === 'HOURLY') base = '150';
    if (type === 'WEEKLY') base = '5000';
    if (type === 'PIECE_RATE') base = '0';

    const numBase = parseFloat(base) || 0;
    setFormData({
      ...formData,
      salaryType: type,
      baseSalary: base,
      basicPay: type === 'MONTHLY' ? String(Math.round(numBase * 0.6)) : '0',
      hra: type === 'MONTHLY' ? String(Math.round(numBase * 0.2)) : '0',
      epfDeduction: type === 'MONTHLY' && numBase >= 15000 ? '1800' : '0',
      esiDeduction: type === 'MONTHLY' && numBase <= 21000 ? String(Math.round(numBase * 0.0075)) : '0',
      overtimeHourlyRate: type === 'MONTHLY' ? String(Math.round(numBase / 200)) : '100',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide staff name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.createEmployee(formData);
      if (res.success) {
        onStaffAdded();
        onClose();
      } else {
        setError(res.message || 'Failed to add staff');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">Add New Staff</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jaswinder Singh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#3478E8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#3478E8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emp Code (PB-XXX)</label>
                <input
                  type="text"
                  placeholder="Auto if blank"
                  value={formData.empCode}
                  onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#3478E8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="e.g. Machine Operator, Accountant"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#3478E8]"
              />
            </div>
          </div>

          {/* Wage / Compensation Model */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compensation Model</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {(['MONTHLY', 'DAILY', 'PIECE_RATE', 'HOURLY', 'WEEKLY'] as SalaryType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleSalaryTypeChange(type)}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                    formData.salaryType === type
                      ? 'bg-blue-50 border-[#3478E8] text-[#3478E8]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type === 'PIECE_RATE' ? 'Piece-Rate' : type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {formData.salaryType !== 'PIECE_RATE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.salaryType === 'MONTHLY' && 'Monthly CTC / Base (₹)'}
                  {formData.salaryType === 'DAILY' && 'Daily Wage Rate (₹)'}
                  {formData.salaryType === 'HOURLY' && 'Hourly Wage Rate (₹)'}
                  {formData.salaryType === 'WEEKLY' && 'Weekly Wage Rate (₹)'}
                </label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#3478E8]"
                />
              </div>
            )}

            {formData.salaryType === 'MONTHLY' && (
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500">Basic Pay:</span>
                  <input
                    type="number"
                    value={formData.basicPay}
                    onChange={(e) => setFormData({ ...formData, basicPay: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-slate-500">HRA:</span>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-slate-500">EPF Deduction:</span>
                  <input
                    type="number"
                    value={formData.epfDeduction}
                    onChange={(e) => setFormData({ ...formData, epfDeduction: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-slate-500">OT Hourly Rate:</span>
                  <input
                    type="number"
                    value={formData.overtimeHourlyRate}
                    onChange={(e) => setFormData({ ...formData, overtimeHourlyRate: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bank details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Details (Optional)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#3478E8]"
              />
              <input
                type="text"
                placeholder="IFSC Code"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#3478E8]"
              />
            </div>
            <input
              type="text"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#3478E8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#3478E8] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            {loading ? <span>Saving...</span> : <span>Save Staff Record</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
