import React from 'react';
import { Home, UserCheck, MapPin, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'attendance' | 'geo' | 'settings';
  onChangeTab: (tab: 'home' | 'attendance' | 'geo' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E9EDF2] px-3 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home' ? 'text-[#3478E8]' : 'text-[#8A94A6] hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 fill-current" strokeWidth={1.5} />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
        </button>

        {/* Attendance */}
        <button
          onClick={() => onChangeTab('attendance')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            activeTab === 'attendance' ? 'text-[#3478E8]' : 'text-[#8A94A6] hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <UserCheck className="w-5 h-5" strokeWidth={1.8} />
            {/* Red badge dot as shown in screenshot */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeTab === 'attendance' ? 'font-bold' : 'font-medium'}`}>
            Attendance
          </span>
        </button>

        {/* Geo */}
        <button
          onClick={() => onChangeTab('geo')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            activeTab === 'geo' ? 'text-[#3478E8]' : 'text-[#8A94A6] hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <MapPin className="w-5 h-5" strokeWidth={1.8} />
            {/* Red badge dot as shown in screenshot */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeTab === 'geo' ? 'font-bold' : 'font-medium'}`}>
            Geo
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => onChangeTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'settings' ? 'text-[#3478E8]' : 'text-[#8A94A6] hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Settings className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeTab === 'settings' ? 'font-bold' : 'font-medium'}`}>
            Settings
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
