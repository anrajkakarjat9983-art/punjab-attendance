import React, { useState, useEffect } from 'react';
import { X, Plus, ClipboardList, PackageCheck, User, Calendar } from 'lucide-react';
import { WorkRateCard, DailyWorkEntry, Employee } from '../../types';
import api from '../../services/api';

interface ManageWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageWorkModal: React.FC<ManageWorkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'rateCards'>('entries');
  const [cards, setCards] = useState<WorkRateCard[]>([]);
  const [entries, setEntries] = useState<DailyWorkEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // New Rate Card Form
  const [showAddCard, setShowAddCard] = useState(false);
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [ratePerUnit, setRatePerUnit] = useState('25');

  // New Work Entry Form
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [unitsCompleted, setUnitsCompleted] = useState('');
  const [entryRemarks, setEntryRemarks] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resCards, resEntries, resStaff] = await Promise.all([
        api.listWorkRateCards(),
        api.listDailyWorkEntries(),
        api.listEmployees(),
      ]);
      if (resCards.success) setCards(resCards.cards);
      if (resEntries.success) setEntries(resEntries.entries);
      if (resStaff.success) {
        setEmployees(resStaff.employees);
        if (resStaff.employees.length > 0) setSelectedEmpId(resStaff.employees[0].id);
      }
      if (resCards.cards?.length > 0) setSelectedCardId(resCards.cards[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !ratePerUnit) return;
    try {
      const res = await api.createWorkRateCard({
        itemName,
        unit,
        ratePerUnit,
      });
      if (res.success) {
        setItemName('');
        setShowAddCard(false);
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create rate card');
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedCardId || !unitsCompleted) return;
    try {
      const res = await api.addDailyWorkEntry({
        employeeId: selectedEmpId,
        workRateCardId: selectedCardId,
        unitsCompleted,
        remarks: entryRemarks,
      });
      if (res.success) {
        setUnitsCompleted('');
        setEntryRemarks('');
        setShowAddEntry(false);
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to record entry');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Manage Work & Piece Rates</h2>
            <p className="text-xs text-[#737B86]">Track item completion, tailoring & unit wages</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-3 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('entries')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'entries'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            Daily Work Entries
          </button>
          <button
            onClick={() => setActiveTab('rateCards')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'rateCards'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            Work Rate Cards
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'entries' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Completed Work Logs</span>
                <button
                  onClick={() => setShowAddEntry(!showAddEntry)}
                  className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Work Done</span>
                </button>
              </div>

              {showAddEntry && (
                <form onSubmit={handleAddEntry} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900">Record Completed Task Units</h4>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Staff Member</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.salaryType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Rate Card Item</label>
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.itemName} (₹{c.ratePerUnit}/{c.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Units Completed</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        required
                        value={unitsCompleted}
                        onChange={(e) => setUnitsCompleted(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Remarks / Batch No</label>
                    <input
                      type="text"
                      placeholder="e.g. Order #102 Batch A"
                      value={entryRemarks}
                      onChange={(e) => setEntryRemarks(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
                    Save Work Entry & Compute Wage
                  </button>
                </form>
              )}

              {entries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No work entries logged yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {entries.map((entry) => (
                    <div key={entry.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{entry.employee.name}</span>
                          <span className="text-[10px] text-slate-400">({entry.workRateCard.itemName})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {entry.unitsCompleted} {entry.workRateCard.unit}s @ ₹{entry.workRateCard.ratePerUnit}/{entry.workRateCard.unit}
                          {entry.remarks && ` · ${entry.remarks}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 block text-sm">
                          ₹{entry.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Piece-Rate Rate Cards</span>
                <button
                  onClick={() => setShowAddCard(!showAddCard)}
                  className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Rate Card</span>
                </button>
              </div>

              {showAddCard && (
                <form onSubmit={handleCreateCard} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900">Add Item Work Rate</h4>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Item / Task Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kurti Stitching, Packing"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Measurement Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. Piece, Box, Meter"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Rate per Unit (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        required
                        value={ratePerUnit}
                        onChange={(e) => setRatePerUnit(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
                    Save Rate Card
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 gap-2">
                {cards.map((card) => (
                  <div key={card.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{card.itemName}</h4>
                      <p className="text-[11px] text-slate-500">Unit: {card.unit}</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#3478E8]">
                      ₹{card.ratePerUnit} / {card.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageWorkModal;
