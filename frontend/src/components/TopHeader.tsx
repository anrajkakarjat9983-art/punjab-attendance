import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { Business, User } from '../types';

interface TopHeaderProps {
  business: Business | null;
  user: User | null;
  onOpenBusinessSwitcher: () => void;
  onOpenProfile: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  business,
  user,
  onOpenBusinessSwitcher,
  onOpenProfile,
}) => {
  return (
    <header className="bg-[#EFF6FF] px-4 pt-3 pb-3 border-b border-[#E3EDFA] sticky top-0 z-30">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Business and Greeting */}
        <div
          onClick={onOpenBusinessSwitcher}
          className="flex items-center space-x-2.5 cursor-pointer active:opacity-80 group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white/90 border border-blue-100 flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#3478E8] transition-colors" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-base text-[#1E293B] leading-tight">
                {business?.name || 'Punjab Business'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />
            </div>
            <span className="text-[12px] text-[#737B86] font-medium leading-none mt-0.5">
              Hello, {user?.name || 'Owner'}
            </span>
          </div>
        </div>

        {/* User Avatar Circle */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center font-bold text-sm text-[#7C3AED] shadow-xs active:scale-95 transition-transform"
          title="Profile & Settings"
        >
          {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'KA')}
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
