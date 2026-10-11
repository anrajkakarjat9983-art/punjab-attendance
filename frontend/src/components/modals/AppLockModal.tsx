import React, { useState } from 'react';
import { X, Lock, Shield, Check } from 'lucide-react';

interface AppLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState(localStorage.getItem('pb_app_pin') || '');
  const [isLocked, setIsLocked] = useState(!!localStorage.getItem('pb_app_pin'));
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (pin.length === 4) {
      localStorage.setItem('pb_app_pin', pin);
      setIsLocked(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else if (pin.length === 0) {
      localStorage.removeItem('pb_app_pin');
      setIsLocked(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert('PIN must be 4 digits');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">App Lock & Security</h2>
            <p className="text-xs text-[#737B86]">Secure payroll and staff data with PIN</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {saved && (
            <div className="p-2 bg-green-50 text-green-700 rounded-lg text-center font-bold">
              Security settings saved!
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-600 font-semibold block">4-Digit Security PIN</label>
            <input
              type="password"
              maxLength={4}
              placeholder="Enter 4 digits (or clear to disable)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-center text-lg font-bold tracking-widest"
            />
            <p className="text-[11px] text-slate-400 text-center">
              {isLocked ? 'App Lock is currently ENABLED' : 'App Lock is currently DISABLED'}
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-[#3478E8] text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Save Security PIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppLockModal;
