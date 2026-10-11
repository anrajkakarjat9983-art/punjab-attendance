import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Bell, Users } from 'lucide-react';
import { BroadcastMessage } from '../../types';
import api from '../../services/api';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBroadcasts();
    }
  }, [isOpen]);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await api.listBroadcasts();
      if (res.success) setBroadcasts(res.broadcasts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    try {
      const res = await api.createBroadcast({ title, message, targetRole });
      if (res.success) {
        setTitle('');
        setMessage('');
        loadBroadcasts();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Broadcast Messages</h2>
            <p className="text-xs text-[#737B86]">Send company announcements to all staff instantly</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compose form */}
        <form onSubmit={handleSend} className="p-3 bg-[#F8FAFC] border-b border-[#E9EDF2] space-y-2">
          <input
            type="text"
            placeholder="Announcement Title (e.g. Festival Timings)"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
          />
          <textarea
            rows={2}
            placeholder="Write message details for the workforce..."
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs resize-none"
          />
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400">Target:</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="ALL">All Staff</option>
                <option value="STAFF">Floor Workers</option>
                <option value="MANAGER">Supervisors</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="px-3.5 py-1.5 bg-[#3478E8] hover:bg-[#2563EB] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Broadcast'}</span>
            </button>
          </div>
        </form>

        {/* Sent History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <span className="text-xs font-bold text-slate-500 block">Sent Broadcasts</span>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading broadcasts...</div>
          ) : broadcasts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No broadcasts sent yet.</div>
          ) : (
            broadcasts.map((b) => (
              <div key={b.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-800">{b.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(b.sentAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{b.message}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold mt-1">
                  Target: {b.targetRole}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
