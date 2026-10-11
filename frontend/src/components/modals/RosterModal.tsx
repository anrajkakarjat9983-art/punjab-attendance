import React, { useState, useEffect } from 'react';
import { X, Clock, Moon, Sun, Plus, Check } from 'lucide-react';
import { Shift } from '../../types';
import api from '../../services/api';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({ isOpen, onClose }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [graceMinutes, setGraceMinutes] = useState('15');
  const [isOvernight, setIsOvernight] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShifts();
    }
  }, [isOpen]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await api.listShifts();
      if (res.success) setShifts(res.shifts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startTime || !endTime) return;
    try {
      const res = await api.createShift({
        name,
        startTime,
        endTime,
        graceMinutes,
        isOvernight,
      });
      if (res.success) {
        setName('');
        setShowAdd(false);
        loadShifts();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create shift');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Shifts & Roster Schedule</h2>
            <p className="text-xs text-[#737B86]">Configurable shift timings, grace & overnight shifts</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Available Shift Templates</span>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Shift</span>
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleCreateShift} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-blue-900">Define Shift Timing</h4>
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">Shift Name</label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon Shift (2 PM - 10 PM)"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="checkbox"
                    id="overnightCheck"
                    checked={isOvernight}
                    onChange={(e) => setIsOvernight(e.target.checked)}
                    className="w-4 h-4 text-[#3478E8] rounded"
                  />
                  <label htmlFor="overnightCheck" className="text-xs text-slate-700 font-medium">
                    Overnight Shift (Ends next day)
                  </label>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-slate-500">Grace:</span>
                  <input
                    type="number"
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(e.target.value)}
                    className="w-12 px-1 py-1 bg-white border border-slate-200 rounded text-xs text-center"
                  />
                  <span className="text-[11px] text-slate-500">min</span>
                </div>
              </div>
              <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
                Save Shift Template
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading shift templates...</div>
          ) : (
            shifts.map((s) => (
              <div key={s.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {s.isOvernight ? (
                      <Moon className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <h4 className="font-bold text-xs text-slate-800">{s.name}</h4>
                  </div>
                  {s.isOvernight && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      Overnight
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <span>Grace: {s.graceMinutes}m</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterModal;
