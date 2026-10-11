import React, { useState } from 'react';
import { X, Briefcase, Share2, Copy, Check } from 'lucide-react';
import { Business } from '../../types';

interface HireStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
}

export const HireStaffModal: React.FC<HireStaffModalProps> = ({ isOpen, onClose, business }) => {
  const [role, setRole] = useState('Machine Tailor / Stitching Master');
  const [openings, setOpenings] = useState('3');
  const [salaryRange, setSalaryRange] = useState('₹18,000 - ₹26,000');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const posterText = `📢 URGENT HIRING AT ${business?.name?.toUpperCase() || 'PUNJAB ENTERPRISE'}
Location: ${business?.city || 'Ludhiana'}, ${business?.state || 'Punjab'}
Designation: ${role}
Openings: ${openings}
Monthly Salary: ${salaryRange}
Benefits: Timely Salary, Overtime Pay, EPF/ESI facility.
Contact immediately: ${business?.phone || '7891012005'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(posterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Hire Staff & Job Poster</h2>
            <p className="text-xs text-[#737B86]">Make instant WhatsApp & social job recruitment posters</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Position / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">No. of Openings</label>
              <input
                type="text"
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Poster preview */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1 font-mono text-[11px] whitespace-pre-line text-blue-950">
            {posterText}
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 bg-[#3478E8] hover:bg-[#2563EB] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Job Poster to WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HireStaffModal;
