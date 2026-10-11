import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Phone, Building2, User, ChevronRight, Filter } from 'lucide-react';
import { Employee, SalaryType } from '../../types';
import api from '../../services/api';

interface StaffListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onOpenAddStaff: () => void;
}

export const StaffListModal: React.FC<StaffListModalProps> = ({
  isOpen,
  onClose,
  onSelectEmployee,
  onOpenAddStaff,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      loadStaff();
    }
  }, [isOpen]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.listEmployees();
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(search.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()));
    const matchType = selectedType === 'ALL' || emp.salaryType === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Staff List</h2>
            <p className="text-xs text-[#737B86]">{employees.length} Employees registered</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 bg-[#F8FAFC] border-b border-[#E9EDF2] space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, code or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#3478E8]"
            />
          </div>

          {/* Salary Type Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1 text-xs">
            {['ALL', 'MONTHLY', 'DAILY', 'PIECE_RATE', 'HOURLY'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-[#3478E8] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type === 'ALL' ? 'All Wage Types' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Staff List Body */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-[#F1F5F9]">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Loading staff...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No staff members found matching search.
            </div>
          ) : (
            filtered.map((emp) => (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm text-[#1E293B] group-hover:text-[#3478E8] transition-colors">
                        {emp.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                        {emp.empCode}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[#737B86] mt-0.5">
                      <span>{emp.designation || 'Staff'}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-800">
                        {emp.salaryType === 'MONTHLY' && `₹${emp.baseSalary.toLocaleString()}/mo`}
                        {emp.salaryType === 'DAILY' && `₹${emp.baseSalary}/day`}
                        {emp.salaryType === 'HOURLY' && `₹${emp.baseSalary}/hr`}
                        {emp.salaryType === 'PIECE_RATE' && `Piece-Rate`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {emp.phone && (
                    <a
                      href={`tel:${emp.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Action */}
        <div className="p-3 border-t border-[#E9EDF2] bg-white">
          <button
            onClick={onOpenAddStaff}
            className="w-full py-2.5 bg-[#3478E8] hover:bg-[#2563EB] text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffListModal;
