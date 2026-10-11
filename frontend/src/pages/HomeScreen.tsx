import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  MapPin,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Bell,
  ShieldCheck,
  UserPlus,
  Sparkles,
  TrendingUp,
  CalendarCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import TopHeader from '../components/TopHeader';
import InfoBanner from '../components/InfoBanner';
import StaffListModal from '../components/modals/StaffListModal';
import AddStaffModal from '../components/modals/AddStaffModal';
import StaffProfileModal from '../components/modals/StaffProfileModal';
import PayrollModal from '../components/modals/PayrollModal';
import ReportsModal from '../components/modals/ReportsModal';
import ManageWorkModal from '../components/modals/ManageWorkModal';
import BroadcastModal from '../components/modals/BroadcastModal';
import NotificationsModal from '../components/modals/NotificationsModal';
import ApprovalsModal from '../components/modals/ApprovalsModal';
import PerformanceModal from '../components/modals/PerformanceModal';
import RosterModal from '../components/modals/RosterModal';
import BusinessSwitcherModal from '../components/modals/BusinessSwitcherModal';
import BusinessSettingsModal from '../components/modals/BusinessSettingsModal';
import { Business, User, Employee } from '../types';
import api from '../services/api';

interface HomeScreenProps {
  onNavigateTab: (tab: 'home' | 'attendance' | 'geo' | 'settings') => void;
  user: User | null;
  business: Business | null;
  onRefreshMe: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  user,
  business,
  onRefreshMe,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modals state
  const [showStaffList, setShowStaffList] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showStaffProfile, setShowStaffProfile] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showManageWork, setShowManageWork] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceTab, setPerformanceTab] = useState<'reviews' | 'goals'>('reviews');
  const [showRoster, setShowRoster] = useState(false);
  const [showBusinessSwitcher, setShowBusinessSwitcher] = useState(false);
  const [showBusinessSettings, setShowBusinessSettings] = useState(false);

  useEffect(() => {
    loadStats();
  }, [business]);

  const loadStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await api.getBusinessStats();
      if (res.success) {
        setStats(res.stats);
      } else {
        setStatsError(res.message || 'Failed to load attendance summary');
      }
    } catch (e: any) {
      console.error(e);
      setStatsError(e.message || 'Network error fetching stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowStaffProfile(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      {/* Top Header */}
      <TopHeader
        business={business}
        user={user}
        onOpenBusinessSwitcher={() => setShowBusinessSwitcher(true)}
        onOpenProfile={() => setShowBusinessSettings(true)}
      />

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3.5">
        {/* Clean Informational Banner */}
        <InfoBanner
          onMarkAttendance={() => onNavigateTab('attendance')}
          onViewReports={() => setShowReports(true)}
        />

        {/* Live Today's Attendance Real-Time Summary Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E9EDF2] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#3478E8]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                  Today's Attendance
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* View Sheet Action */}
            <button
              onClick={() => onNavigateTab('attendance')}
              className="flex items-center text-xs font-bold text-[#3478E8] hover:text-blue-700 active:scale-95 transition-all"
            >
              <span>View Sheet</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Loading State */}
          {loadingStats && (
            <div className="py-4 text-center space-y-1">
              <div className="w-5 h-5 border-2 border-[#3478E8] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[11px] text-slate-400">Loading today's attendance summary...</p>
            </div>
          )}

          {/* Error State */}
          {!loadingStats && statsError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-600">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{statsError}</span>
              </div>
              <button
                onClick={loadStats}
                className="font-bold underline text-red-700 hover:text-red-800 ml-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loadingStats && !statsError && stats && stats.totalStaff === 0 && (
            <div className="py-3 text-center space-y-1.5">
              <p className="text-xs text-slate-500">No employees registered yet.</p>
              <button
                onClick={() => setShowAddStaff(true)}
                className="px-3 py-1 bg-[#3478E8] text-white font-semibold text-xs rounded-lg"
              >
                + Add Staff Member
              </button>
            </div>
          )}

          {/* Real Data Breakdown Metrics */}
          {!loadingStats && !statsError && stats && stats.totalStaff > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-black text-[#1E293B]">
                    {stats.presentToday} Present
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    out of {stats.totalStaff} Total Staff
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {stats.totalStaff > 0
                    ? `${Math.round((stats.presentToday / stats.totalStaff) * 100)}% Present`
                    : '0%'}
                </span>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {/* Present */}
                <div className="p-1.5 rounded-lg bg-green-50 border border-green-200/60">
                  <span className="text-[10px] text-green-700 block font-medium">Present</span>
                  <span className="text-xs font-black text-green-800">{stats.presentToday}</span>
                </div>

                {/* Absent */}
                <div className="p-1.5 rounded-lg bg-red-50 border border-red-200/60">
                  <span className="text-[10px] text-red-700 block font-medium">Absent</span>
                  <span className="text-xs font-black text-red-800">{stats.absentToday}</span>
                </div>

                {/* Half Day */}
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60">
                  <span className="text-[10px] text-amber-700 block font-medium">Half Day</span>
                  <span className="text-xs font-black text-amber-800">{stats.halfDayToday}</span>
                </div>

                {/* Leave */}
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/60">
                  <span className="text-[10px] text-blue-700 block font-medium">Leave</span>
                  <span className="text-xs font-black text-blue-800">{stats.leaveToday}</span>
                </div>

                {/* Unmarked */}
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Unmarked</span>
                  <span className="text-xs font-black text-slate-700">{stats.unmarkedToday}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main 3-Column Shortcut Grid (Exact match to screenshot 1) */}
        <div className="grid grid-cols-3 gap-3">
          {/* 1. Staff List */}
          <button
            onClick={() => setShowStaffList(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Staff List
            </span>
          </button>

          {/* 2. Attendance */}
          <button
            onClick={() => onNavigateTab('attendance')}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Attendance
            </span>
          </button>

          {/* 3. Geo */}
          <button
            onClick={() => onNavigateTab('geo')}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Geo
            </span>
          </button>

          {/* 4. Reports */}
          <button
            onClick={() => setShowReports(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Reports
            </span>
          </button>

          {/* 5. Manage Work */}
          <button
            onClick={() => setShowManageWork(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Manage Work
            </span>
          </button>

          {/* 6. Broadcast Messages */}
          <button
            onClick={() => setShowBroadcast(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Broadcast Messages
            </span>
          </button>

          {/* 7. Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px] relative"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform relative">
              <Bell className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
              {stats?.unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Notifications
            </span>
          </button>

          {/* 8. My Approvals */}
          <button
            onClick={() => setShowApprovals(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px] relative"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform relative">
              <ShieldCheck className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
              {stats?.pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
              )}
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              My Approvals
            </span>
          </button>

          {/* 9. Payroll Engine Shortcut */}
          <button
            onClick={() => setShowPayroll(true)}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-100/80 hover:border-blue-200 active:scale-[0.97] transition-all group min-h-[104px]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#3478E8]" strokeWidth={2.2} />
            </div>
            <span className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#3478E8] transition-colors leading-tight">
              Payroll
            </span>
          </button>
        </div>

        {/* Quick Actions Header */}
        <div className="pt-2">
          <h3 className="text-base font-bold text-[#1E293B] mb-3">Quick Actions</h3>

          {/* 4-Column Quick Action Icons (Exact match to screenshot 1) */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Add Staff */}
            <button
              onClick={() => setShowAddStaff(true)}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mb-1.5 shadow-2xs group-hover:bg-[#EDE9FE] transition-colors">
                <UserPlus className="w-6 h-6 text-[#8B5CF6]" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-[#1E293B] leading-tight">
                Add Staff
              </span>
            </button>

            {/* Performance Reviews */}
            <button
              onClick={() => {
                setPerformanceTab('reviews');
                setShowPerformance(true);
              }}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mb-1.5 shadow-2xs group-hover:bg-[#EDE9FE] transition-colors">
                <Sparkles className="w-6 h-6 text-[#8B5CF6]" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-[#1E293B] leading-tight">
                Performance Reviews
              </span>
            </button>

            {/* Performance Goals */}
            <button
              onClick={() => {
                setPerformanceTab('goals');
                setShowPerformance(true);
              }}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mb-1.5 shadow-2xs group-hover:bg-[#EDE9FE] transition-colors">
                <TrendingUp className="w-6 h-6 text-[#8B5CF6]" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-[#1E293B] leading-tight">
                Performance Goals
              </span>
            </button>

            {/* Roster Schedule */}
            <button
              onClick={() => setShowRoster(true)}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mb-1.5 shadow-2xs group-hover:bg-[#EDE9FE] transition-colors">
                <CalendarCheck className="w-6 h-6 text-[#8B5CF6]" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-[#1E293B] leading-tight">
                Roster Schedule
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Sub-screens */}
      <StaffListModal
        isOpen={showStaffList}
        onClose={() => setShowStaffList(false)}
        onSelectEmployee={handleSelectEmployee}
        onOpenAddStaff={() => {
          setShowStaffList(false);
          setShowAddStaff(true);
        }}
      />

      <AddStaffModal
        isOpen={showAddStaff}
        onClose={() => setShowAddStaff(false)}
        onStaffAdded={() => {
          loadStats();
          setShowStaffList(true);
        }}
      />

      <StaffProfileModal
        employee={selectedEmployee}
        isOpen={showStaffProfile}
        onClose={() => setShowStaffProfile(false)}
        onRefresh={loadStats}
      />

      <PayrollModal isOpen={showPayroll} onClose={() => setShowPayroll(false)} />
      <ReportsModal isOpen={showReports} onClose={() => setShowReports(false)} />
      <ManageWorkModal isOpen={showManageWork} onClose={() => setShowManageWork(false)} />
      <BroadcastModal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} />
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onRefreshStats={loadStats}
      />
      <ApprovalsModal
        isOpen={showApprovals}
        onClose={() => setShowApprovals(false)}
        onRefreshStats={loadStats}
      />
      <PerformanceModal
        isOpen={showPerformance}
        onClose={() => setShowPerformance(false)}
        defaultTab={performanceTab}
      />
      <RosterModal isOpen={showRoster} onClose={() => setShowRoster(false)} />

      <BusinessSwitcherModal
        isOpen={showBusinessSwitcher}
        onClose={() => setShowBusinessSwitcher(false)}
        currentBusiness={business}
        onBusinessChanged={() => {
          onRefreshMe();
          loadStats();
        }}
      />

      <BusinessSettingsModal
        isOpen={showBusinessSettings}
        onClose={() => setShowBusinessSettings(false)}
        business={business}
        onRefresh={onRefreshMe}
      />
    </div>
  );
};

export default HomeScreen;
