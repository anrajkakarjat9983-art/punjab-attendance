import React, { useState, useEffect } from 'react';
import { X, Sliders, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { AutomationRule } from '../../types';
import api from '../../services/api';

interface AutomationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationRulesModal: React.FC<AutomationRulesModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await api.listAutomationRules();
      if (res.success) setRules(res.rules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await api.toggleAutomationRule(rule.id, !rule.isEnabled);
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, isEnabled: !r.isEnabled } : r))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Automation Rules</h2>
            <p className="text-xs text-[#737B86]">Automate late marks, overtime and holiday deductions</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading automation rules...</div>
          ) : rules.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No automation rules configured.</div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{rule.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Type: <span className="font-mono text-slate-700">{rule.ruleType}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleToggle(rule)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                    rule.isEnabled
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{rule.isEnabled ? 'ACTIVE' : 'OFF'}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationRulesModal;
