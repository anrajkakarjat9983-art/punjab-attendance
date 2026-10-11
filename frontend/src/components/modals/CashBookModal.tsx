import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { CashBookEntry } from '../../types';
import api from '../../services/api';

interface CashBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashBookModal: React.FC<CashBookModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, netBalance: 0 });
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [entryType, setEntryType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_OUT');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Office Supply');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');

  useEffect(() => {
    if (isOpen) {
      loadCashBook();
    }
  }, [isOpen]);

  const loadCashBook = async () => {
    setLoading(true);
    try {
      const res = await api.listCashBook();
      if (res.success) {
        setEntries(res.entries);
        setSummary(res.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    try {
      const res = await api.addCashBook({
        type: entryType,
        amount,
        category,
        description,
        paymentMode,
      });
      if (res.success) {
        setAmount('');
        setDescription('');
        setShowAdd(false);
        loadCashBook();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add cash entry');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">CashBook & Petty Cash</h2>
            <p className="text-xs text-[#737B86]">Daily business cash in, cash out & balance</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance cards */}
        <div className="p-3 bg-[#F8FAFC] border-b border-[#E9EDF2] grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-green-50/70 border border-green-200/60 rounded-xl">
            <span className="text-[10px] text-green-700 block font-semibold">Total Cash In</span>
            <span className="text-sm font-extrabold text-green-700">₹{summary.totalIn.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-red-50/70 border border-red-200/60 rounded-xl">
            <span className="text-[10px] text-red-700 block font-semibold">Total Cash Out</span>
            <span className="text-sm font-extrabold text-red-700">₹{summary.totalOut.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl">
            <span className="text-[10px] text-blue-700 block font-semibold">Net Balance</span>
            <span className="text-sm font-black text-[#3478E8]">₹{summary.netBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Transaction History</span>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAddEntry} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('CASH_IN')}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    entryType === 'CASH_IN'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  + Cash In
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('CASH_OUT')}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    entryType === 'CASH_OUT'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  - Cash Out
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="Tea/Snacks">Tea / Snacks / Pantry</option>
                    <option value="Office Supply">Office Supply / Stationery</option>
                    <option value="Sales Receipt">Sales Cash Receipt</option>
                    <option value="Travel">Travel & Petrol</option>
                    <option value="Maintenance">Repair & Maintenance</option>
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Courier">Courier & Transport</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">Description / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Milk & biscuits for factory floor"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-[#3478E8] text-white text-xs font-bold rounded-lg">
                Record Transaction
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading ledger entries...</div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No cash transactions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {entries.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        item.type === 'CASH_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.type === 'CASH_IN' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.category}</h4>
                      <p className="text-[10px] text-slate-400">
                        {item.description || item.paymentMode} · {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-black text-sm ${
                      item.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.type === 'CASH_IN' ? '+' : '-'}₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashBookModal;
