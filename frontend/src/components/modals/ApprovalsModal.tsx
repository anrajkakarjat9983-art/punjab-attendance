import React, { useState, useEffect } from 'react';
import { X, Check, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Approval } from '../../types';
import api from '../../services/api';

interface ApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshStats?: () => void;
}

export const ApprovalsModal: React.FC<ApprovalsModalProps> = ({ isOpen, onClose, onRefreshStats }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApprovals();
    }
  }, [isOpen]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.listApprovals();
      if (res.success) setApprovals(res.approvals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      const res = await api.actionApproval(id, status, `Reviewed on ${new Date().toLocaleDateString()}`);
      if (res.success) {
        await loadApprovals();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">My Approvals</h2>
            <p className="text-xs text-[#737B86]">Review leave requests & punch corrections</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading pending requests...</div>
          ) : approvals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No requests requiring approval.</div>
          ) : (
            approvals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'PENDING'
                          ? 'bg-amber-500 animate-pulse'
                          : item.status === 'APPROVED'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : item.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                  {item.details || 'No additional note'}
                </p>

                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.status === 'PENDING' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        disabled={actionLoading === item.id}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        disabled={actionLoading === item.id}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalsModal;
