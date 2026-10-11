import React, { useState, useEffect } from 'react';
import { X, Plus, Building2, Users } from 'lucide-react';
import { Department } from '../../types';
import api from '../../services/api';

interface DepartmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentsModal: React.FC<DepartmentsModalProps> = ({ isOpen, onClose }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.listDepartments();
      if (res.success) setDepartments(res.departments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await api.createDepartment({ name, description });
      if (res.success) {
        setName('');
        setDescription('');
        setShowAdd(false);
        loadDepartments();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create department');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Departments</h2>
            <p className="text-xs text-[#737B86]">Organize staff into operational units</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">Departments List</span>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-2.5 py-1 bg-[#3478E8] text-white font-semibold rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleCreate} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
              <h4 className="font-bold text-blue-900">New Department</h4>
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Quality Control, Marketing"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">Description</label>
                <input
                  type="text"
                  placeholder="Brief function"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white font-semibold rounded-lg">
                Save Department
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading departments...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((d) => (
                <div key={d.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{d.name}</h4>
                    <p className="text-[11px] text-slate-400">{d.description || 'No description'}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">
                    {d._count?.employees || 0} Staff
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

export default DepartmentsModal;
