import React, { useState, useEffect } from 'react';
import { X, Star, Target, Plus, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { PerformanceReview, PerformanceGoal, Employee } from '../../types';
import api from '../../services/api';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'reviews' | 'goals';
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'reviews',
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals'>(defaultTab);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // New review form
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [period, setPeriod] = useState('Q4 2026');
  const [rating, setRating] = useState('5.0');
  const [feedback, setFeedback] = useState('');

  // New goal form
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      loadData();
    }
  }, [isOpen, defaultTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRev, resGoals, resStaff] = await Promise.all([
        api.listPerformanceReviews(),
        api.listPerformanceGoals(),
        api.listEmployees(),
      ]);
      if (resRev.success) setReviews(resRev.reviews);
      if (resGoals.success) setGoals(resGoals.goals);
      if (resStaff.success) {
        setEmployees(resStaff.employees);
        if (resStaff.employees.length > 0) setSelectedEmpId(resStaff.employees[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      const res = await api.createPerformanceReview({
        employeeId: selectedEmpId,
        reviewPeriod: period,
        rating,
        feedback,
      });
      if (res.success) {
        setShowAddReview(false);
        setFeedback('');
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit review');
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !goalTitle) return;
    try {
      const res = await api.createPerformanceGoal({
        employeeId: selectedEmpId,
        title: goalTitle,
        targetDate: goalTargetDate,
        progressPct: 0,
      });
      if (res.success) {
        setShowAddGoal(false);
        setGoalTitle('');
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoalProgress = async (id: string, currentPct: number) => {
    const nextPct = Math.min(100, currentPct + 25);
    try {
      await api.updatePerformanceGoal(id, {
        progressPct: nextPct,
        status: nextPct === 100 ? 'ACHIEVED' : 'IN_PROGRESS',
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-4 border-b border-[#E9EDF2] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Appraisals & Goals</h2>
            <p className="text-xs text-[#737B86]">Track staff KPI targets & quarterly ratings</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-center text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 transition-colors border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Performance Reviews</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3 transition-colors border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'goals'
                ? 'border-[#3478E8] text-[#3478E8]'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Performance Goals</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'reviews' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Recent Ratings</span>
                <button
                  onClick={() => setShowAddReview(!showAddReview)}
                  className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rate Staff</span>
                </button>
              </div>

              {showAddReview && (
                <form onSubmit={handleAddReview} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900">Add Staff Review</h4>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Staff Member</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.designation || 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Review Cycle</label>
                      <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Rating (1 to 5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Appraisal Feedback</label>
                    <textarea
                      rows={2}
                      placeholder="Comment on work quality, attendance and attitude..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
                    Submit Review
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No performance reviews logged yet.</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-slate-800">{r.employee.name}</h4>
                      <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{r.rating} / 5</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{r.reviewPeriod} · By {r.reviewerName || 'Admin'}</span>
                    {r.feedback && <p className="text-xs text-slate-600 mt-1">{r.feedback}</p>}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Assigned Goals & KPIs</span>
                <button
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  className="px-2.5 py-1 bg-[#3478E8] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Goal</span>
                </button>
              </div>

              {showAddGoal && (
                <form onSubmit={handleAddGoal} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900">Assign Target Goal</h4>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Staff Member</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Target Objective / KPI</label>
                    <input
                      type="text"
                      placeholder="e.g. Zero machine breakdown for 30 days"
                      required
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Target Completion Date</label>
                    <input
                      type="date"
                      value={goalTargetDate}
                      onChange={(e) => setGoalTargetDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <button type="submit" className="w-full py-1.5 bg-[#3478E8] text-white text-xs font-semibold rounded-lg">
                    Set Goal
                  </button>
                </form>
              )}

              {goals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No goals assigned yet.</div>
              ) : (
                goals.map((g) => (
                  <div key={g.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{g.title}</h4>
                        <span className="text-[10px] text-slate-400">{g.employee.name}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          g.status === 'ACHIEVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Progress</span>
                        <span>{g.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#3478E8] h-full rounded-full transition-all duration-300"
                          style={{ width: `${g.progressPct}%` }}
                        />
                      </div>
                    </div>

                    {g.status !== 'ACHIEVED' && (
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, g.progressPct)}
                        className="text-[11px] text-[#3478E8] font-bold hover:underline"
                      >
                        + Log +25% Progress
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceModal;
