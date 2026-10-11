import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Bell, CheckCircle2, UserCheck } from 'lucide-react';
import api from '../../services/api';

interface OrganisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'members' | 'roles' | 'alarms';
}

export const OrganisationModal: React.FC<OrganisationModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'members',
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'alarms'>(defaultTab);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [morningAlarm, setMorningAlarm] = useState(true);
  const [eveningAlarm, setEveningAlarm] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      loadMembers();
    }
  }, [isOpen, defaultTab]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.listMembers();
      if (res.success) setMembers(res.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">
              {activeTab === 'members' && 'Manage Users & Admins'}
              {activeTab === 'roles' && 'Roles & Permissions'}
              {activeTab === 'alarms' && 'Attendance Alarms & Reminders'}
            </h2>
            <p className="text-xs text-[#737B86]">Organisation management & access control</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switches */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-center text-xs font-semibold">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'members'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'roles'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('alarms')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'alarms'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            Alarms
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {activeTab === 'members' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-700 block">Authorized Business Administrators</span>
              {loading ? (
                <div className="py-6 text-center text-slate-400">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No additional users.</div>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                        {m.user?.avatar || (m.user?.name ? m.user.name.slice(0, 2) : 'US')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{m.user?.name || 'Administrator'}</h4>
                        <p className="text-[11px] text-slate-400">{m.user?.email || m.user?.phone}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {m.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-2.5">
              {[
                { role: 'OWNER', desc: 'Full business control, payroll locking, billing & staff management', badge: 'Active' },
                { role: 'ADMIN', desc: 'Manage attendance, shifts, work entries & generate reports', badge: 'Available' },
                { role: 'MANAGER', desc: 'Daily punch verification, roster schedules & leave approvals', badge: 'Available' },
                { role: 'STAFF', desc: 'Self attendance punch, geo punch & payslip view', badge: 'Available' },
              ].map((r) => (
                <div key={r.role} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{r.role}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {r.badge} (100% Free)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{r.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alarms' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Shift Punch-In Alarm</h4>
                  <p className="text-[11px] text-slate-500">Alerts floor managers at 09:00 AM</p>
                </div>
                <button
                  onClick={() => setMorningAlarm(!morningAlarm)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    morningAlarm ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {morningAlarm ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Shift Punch-Out Reminder</h4>
                  <p className="text-[11px] text-slate-500">Alerts floor managers at 06:00 PM</p>
                </div>
                <button
                  onClick={() => setEveningAlarm(!eveningAlarm)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    eveningAlarm ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {eveningAlarm ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationModal;
