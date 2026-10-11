import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  UserCheck,
  CreditCard,
  Building2,
  Users,
  User,
  LayoutGrid,
  Clock,
  Shield,
  FileText,
  MapPin,
  Calendar,
  Lock,
  LogOut,
  BellRing,
  Globe,
  Sliders,
  Sparkles,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Business, User as UserType, Employee } from '../types';
import BusinessSettingsModal from '../components/modals/BusinessSettingsModal';
import BusinessSwitcherModal from '../components/modals/BusinessSwitcherModal';
import DepartmentsModal from '../components/modals/DepartmentsModal';
import AutomationRulesModal from '../components/modals/AutomationRulesModal';
import RosterModal from '../components/modals/RosterModal';
import ManageWorkModal from '../components/modals/ManageWorkModal';
import CashBookModal from '../components/modals/CashBookModal';
import HireStaffModal from '../components/modals/HireStaffModal';
import AppLockModal from '../components/modals/AppLockModal';
import ApprovalsModal from '../components/modals/ApprovalsModal';
import StaffListModal from '../components/modals/StaffListModal';
import AddStaffModal from '../components/modals/AddStaffModal';
import StaffProfileModal from '../components/modals/StaffProfileModal';
import PayrollModal from '../components/modals/PayrollModal';
import OrganisationModal from '../components/modals/OrganisationModal';
import api from '../services/api';

interface SettingsScreenProps {
  business: Business | null;
  user: UserType | null;
  onRefreshMe: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  business,
  user,
  onRefreshMe,
  onLogout,
}) => {
  const [search, setSearch] = useState('');

  // Modals
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessSection, setBusinessSection] = useState('details');
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showManageWorkModal, setShowManageWorkModal] = useState(false);
  const [showCashBookModal, setShowCashBookModal] = useState(false);
  const [showHireStaffModal, setShowHireStaffModal] = useState(false);
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [showStaffListModal, setShowStaffListModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [showStaffProfileModal, setShowStaffProfileModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgTab, setOrgTab] = useState<'members' | 'roles' | 'alarms'>('members');

  // Profile edit prompt
  const handleEditProfile = async (field: string) => {
    const val = prompt(`Update ${field}:`, field === 'Name' ? user?.name : field === 'Phone' ? user?.phone : user?.email);
    if (val) {
      try {
        const updateData: any = {};
        if (field === 'Name') updateData.name = val;
        if (field === 'Phone') updateData.phone = val;
        if (field === 'Email') updateData.email = val;
        await api.updateProfile(updateData);
        onRefreshMe();
      } catch (e: any) {
        alert(e.message || 'Update failed');
      }
    }
  };

  // Group definitions
  const sections = [
    {
      id: 'attendance',
      title: 'Attendance Setting',
      icon: UserCheck,
      items: [
        {
          id: 'att_templates',
          title: 'Attendance Templates',
          subtitle: 'Templatize attendance',
          badge: 'New',
          onClick: () => setShowRosterModal(true),
        },
        {
          id: 'automation_rules',
          title: 'Automation Rules',
          subtitle: 'Configure rules for late entry, breaks & overtime',
          onClick: () => setShowAutomationModal(true),
        },
        {
          id: 'weekly_holiday',
          title: 'Weekly Holiday',
          subtitle: 'Manage Weekly Off Templates',
          onClick: () => setShowRosterModal(true),
        },
        {
          id: 'attendance_rules_ho',
          title: 'Attendance Rules for HO and WO',
          subtitle: 'Manage Holiday and Weekly Off Rules',
          onClick: () => setShowAutomationModal(true),
        },
        {
          id: 'shifts_templates',
          title: 'Shifts Templates',
          subtitle: 'Templatize Shift timings',
          onClick: () => setShowRosterModal(true),
        },
        {
          id: 'leave_policy',
          title: 'Leave Policy',
          subtitle: '1 Added · Casual, Sick & Privilege',
          onClick: () => setShowApprovalsModal(true),
        },
      ],
    },
    {
      id: 'salary',
      title: 'Salary Settings',
      icon: CreditCard,
      items: [
        {
          id: 'work_rate_card',
          title: 'Work Rate Card',
          subtitle: 'Piece-rate items & tailoring cards',
          onClick: () => setShowManageWorkModal(true),
        },
        {
          id: 'daily_work_entry',
          title: 'Daily Work Entry',
          subtitle: 'Record completed production units',
          onClick: () => setShowManageWorkModal(true),
        },
        {
          id: 'salary_structures',
          title: 'Salary Structures',
          subtitle: 'Basic, HRA, EPF, ESI & Overtime breakdown',
          onClick: () => setShowStaffListModal(true),
        },
        {
          id: 'payroll_rules',
          title: 'Payroll Rules',
          subtitle: 'Salary cycles, advances & deduction rules',
          onClick: () => setShowPayrollModal(true),
        },
        {
          id: 'overtime',
          title: 'Overtime Policy',
          subtitle: 'Multiplier & automated overtime calculator',
          onClick: () => setShowAutomationModal(true),
        },
      ],
    },
    {
      id: 'business',
      title: 'Business Settings',
      icon: Building2,
      items: [
        {
          id: 'departments',
          title: 'Departments',
          subtitle: 'Manage Departments & Units',
          onClick: () => setShowDeptModal(true),
        },
        {
          id: 'kyb',
          title: 'KYB Verification',
          subtitle: 'Pre-verified 100% Free · Direct salary payout ready',
          onClick: () => {
            setBusinessSection('kyb');
            setShowBusinessModal(true);
          },
        },
        {
          id: 'biz_name',
          title: 'Business Name',
          subtitle: business?.name || 'kanishk',
          onClick: () => {
            setBusinessSection('details');
            setShowBusinessModal(true);
          },
        },
        {
          id: 'biz_bank',
          title: 'Business bank account',
          subtitle: business?.accountNumber ? `HDFC A/C: ${business.accountNumber}` : 'Enter Details for Payouts',
          onClick: () => {
            setBusinessSection('bank');
            setShowBusinessModal(true);
          },
        },
        {
          id: 'biz_statement_name',
          title: 'Business Name in Bank Statement',
          subtitle: business?.statementName || 'KANISHK ENTERPRISES',
          onClick: () => {
            setBusinessSection('bank');
            setShowBusinessModal(true);
          },
        },
        {
          id: 'biz_logo_address',
          title: 'Business Logo & Address',
          subtitle: `${business?.city || 'Ludhiana'}, ${business?.state || 'Punjab'}`,
          onClick: () => {
            setBusinessSection('details');
            setShowBusinessModal(true);
          },
        },
      ],
    },
    {
      id: 'organisation',
      title: 'Organisation Settings',
      icon: Users,
      items: [
        {
          id: 'roles_perm',
          title: 'Roles & Permissions',
          subtitle: 'Owner, Admin & Supervisor permissions',
          badge: 'New',
          onClick: () => {
            setOrgTab('roles');
            setShowOrgModal(true);
          },
        },
        {
          id: 'manage_users',
          title: 'Manage Users',
          subtitle: 'Manage administrative members and access',
          badge: 'New',
          onClick: () => {
            setOrgTab('members');
            setShowOrgModal(true);
          },
        },
        {
          id: 'admin_setting',
          title: 'Admin Setting',
          subtitle: `1 Admin (${user?.name || 'You'})`,
          onClick: () => {
            setOrgTab('members');
            setShowOrgModal(true);
          },
        },
        {
          id: 'businesses',
          title: 'Businesses',
          subtitle: `${business?.name ? '1 Active Business' : 'Multi-Business Support'}`,
          onClick: () => setShowSwitcherModal(true),
        },
      ],
    },
    {
      id: 'profile',
      title: 'Profile / Personal Info',
      icon: User,
      items: [
        {
          id: 'prof_name',
          title: 'Name',
          subtitle: user?.name || 'Kanishk',
          onClick: () => handleEditProfile('Name'),
        },
        {
          id: 'prof_phone',
          title: 'Phone Number',
          subtitle: user?.phone || '7891012005',
          onClick: () => handleEditProfile('Phone'),
        },
        {
          id: 'prof_email',
          title: 'Email',
          subtitle: user?.email || 'kp@gmail.com',
          onClick: () => handleEditProfile('Email'),
        },
      ],
    },
    {
      id: 'other',
      title: 'Other',
      icon: LayoutGrid,
      items: [
        {
          id: 'cashbook',
          title: 'CashBook',
          subtitle: 'Add Entries & Petty Cash',
          onClick: () => setShowCashBookModal(true),
        },
        {
          id: 'hire_staff',
          title: 'Hire Staff',
          subtitle: 'Make job poster for WhatsApp',
          onClick: () => setShowHireStaffModal(true),
        },
        {
          id: 'alarm',
          title: 'Alarm & Reminders',
          subtitle: 'Attendance punch reminder alerts',
          onClick: () => {
            setOrgTab('alarms');
            setShowOrgModal(true);
          },
        },
        {
          id: 'app_lock',
          title: 'App Lock',
          subtitle: localStorage.getItem('pb_app_pin') ? 'Enabled (PIN Protected)' : 'Disabled',
          onClick: () => setShowAppLockModal(true),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: selectedLanguage,
          onClick: () => setShowLanguageModal(true),
        },
      ],
    },
  ];

  // Search filtering
  const filteredSections = sections
    .map((sec) => {
      const filteredItems = sec.items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
      );
      return {
        ...sec,
        items: filteredItems,
      };
    })
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      {/* Settings Top Header with Search Bar */}
      <div className="bg-[#EFF6FF] px-4 pt-4 pb-3 border-b border-[#E3EDFA] sticky top-0 z-30">
        <div className="max-w-md mx-auto space-y-3">
          <h1 className="text-xl font-bold text-[#1E293B]">Settings</h1>

          {/* Search for items input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search for items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-blue-100 text-xs text-[#1E293B] placeholder-slate-400 shadow-2xs focus:outline-hidden focus:border-[#3478E8]"
            />
          </div>
        </div>
      </div>

      {/* Main Settings Grouped Cards */}
      <div className="max-w-md mx-auto px-4 pt-3 space-y-3.5">
        {filteredSections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-[#E9EDF2] p-4 shadow-xs space-y-1"
            >
              {/* Section Header */}
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100/80">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <IconComp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">{sec.title}</h3>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={item.onClick}
                    className="py-3 flex items-center justify-between cursor-pointer group hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#3478E8] transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-[#737B86] mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Standalone Logout Row */}
        <div className="bg-white rounded-2xl border border-[#E9EDF2] p-2 shadow-xs">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 flex items-center justify-between text-red-600 hover:bg-red-50/60 rounded-xl transition-colors font-bold text-xs"
          >
            <span>Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Selector Dialog */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 space-y-3 shadow-2xl animate-in zoom-in-95 text-xs">
            <h3 className="font-bold text-sm text-slate-800">Select Application Language</h3>
            <div className="space-y-1.5">
              {[
                { code: 'en', label: 'English (Default)' },
                { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.label);
                    setShowLanguageModal(false);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-left font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connected Modals */}
      <BusinessSettingsModal
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        business={business}
        initialSection={businessSection}
        onRefresh={onRefreshMe}
      />

      <BusinessSwitcherModal
        isOpen={showSwitcherModal}
        onClose={() => setShowSwitcherModal(false)}
        currentBusiness={business}
        onBusinessChanged={onRefreshMe}
      />

      <DepartmentsModal isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} />
      <AutomationRulesModal isOpen={showAutomationModal} onClose={() => setShowAutomationModal(false)} />
      <RosterModal isOpen={showRosterModal} onClose={() => setShowRosterModal(false)} />
      <ManageWorkModal isOpen={showManageWorkModal} onClose={() => setShowManageWorkModal(false)} />
      <CashBookModal isOpen={showCashBookModal} onClose={() => setShowCashBookModal(false)} />
      <HireStaffModal isOpen={showHireStaffModal} onClose={() => setShowHireStaffModal(false)} business={business} />
      <AppLockModal isOpen={showAppLockModal} onClose={() => setShowAppLockModal(false)} />
      <ApprovalsModal isOpen={showApprovalsModal} onClose={() => setShowApprovalsModal(false)} />
      <OrganisationModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        defaultTab={orgTab}
      />
      <StaffListModal
        isOpen={showStaffListModal}
        onClose={() => setShowStaffListModal(false)}
        onSelectEmployee={(emp) => {
          setSelectedStaff(emp);
          setShowStaffProfileModal(true);
        }}
        onOpenAddStaff={() => {
          setShowStaffListModal(false);
          setShowAddStaffModal(true);
        }}
      />
      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onStaffAdded={onRefreshMe}
      />
      <StaffProfileModal
        employee={selectedStaff}
        isOpen={showStaffProfileModal}
        onClose={() => setShowStaffProfileModal(false)}
        onRefresh={onRefreshMe}
      />
      <PayrollModal isOpen={showPayrollModal} onClose={() => setShowPayrollModal(false)} />
    </div>
  );
};

export default SettingsScreen;
