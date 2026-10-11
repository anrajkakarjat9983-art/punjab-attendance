import React, { useState, useEffect } from 'react';
import { X, Building2, CreditCard, MapPin, ShieldCheck, Check } from 'lucide-react';
import { Business } from '../../types';
import api from '../../services/api';

interface BusinessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  initialSection?: string;
  onRefresh: () => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  isOpen,
  onClose,
  business,
  initialSection = 'details',
  onRefresh,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    statementName: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        category: business.category || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        phone: business.phone || '',
        email: business.email || '',
        bankName: business.bankName || '',
        accountNumber: business.accountNumber || '',
        ifscCode: business.ifscCode || '',
        statementName: business.statementName || '',
      });
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateBusiness(formData);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update business');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Business Settings</h2>
            <p className="text-xs text-[#737B86]">KYB, Bank accounts, Address & Organization info</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {saved && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" /> Business profile updated successfully
            </div>
          )}

          {/* KYB Status pill */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-emerald-900">KYB Business Verified</h4>
                <p className="text-[11px] text-emerald-700">100% Free · Direct salary payout ready</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
              VERIFIED
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Business Details</h3>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Business Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Industry / Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Bank Account Information</h3>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Registered Statement Name</label>
              <input
                type="text"
                placeholder="Business Name in Bank Statement"
                value={formData.statementName}
                onChange={(e) => setFormData({ ...formData, statementName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Bank Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#3478E8] hover:bg-[#2563EB] text-white font-bold rounded-xl text-xs shadow-xs"
          >
            {loading ? 'Saving...' : 'Save Business Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessSettingsModal;
