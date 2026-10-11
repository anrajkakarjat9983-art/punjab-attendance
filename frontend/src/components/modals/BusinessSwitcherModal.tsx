import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Check, ShieldCheck } from 'lucide-react';
import { Business } from '../../types';
import api from '../../services/api';

interface BusinessSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBusiness: Business | null;
  onBusinessChanged: () => void;
}

export const BusinessSwitcherModal: React.FC<BusinessSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentBusiness,
  onBusinessChanged,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Manufacturing');
  const [newCity, setNewCity] = useState('Ludhiana');

  useEffect(() => {
    if (isOpen) {
      loadBusinesses();
    }
  }, [isOpen]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.listBusinesses();
      if (res.success) setBusinesses(res.businesses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = (b: Business) => {
    api.setBusinessId(b.id);
    onBusinessChanged();
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const res = await api.createBusiness({
        name: newName,
        category: newCategory,
        city: newCity,
      });
      if (res.success) {
        setNewName('');
        setShowCreate(false);
        api.setBusinessId(res.business.id);
        onBusinessChanged();
        onClose();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create business');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Switch Business</h2>
            <p className="text-xs text-[#737B86]">Manage isolated multi-business records</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="space-y-2">
            {businesses.map((b) => {
              const isActive = currentBusiness?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelectBusiness(b)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'border-[#3478E8] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#3478E8] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{b.name}</h4>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{b.category || 'Business'}</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> KYB Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-[#3478E8] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showCreate ? (
            <form onSubmit={handleCreate} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-800">Add New Business</h4>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Doaba Garments"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Industry</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white font-bold rounded-lg text-xs">
                Create & Switch
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Register Another Business</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessSwitcherModal;
