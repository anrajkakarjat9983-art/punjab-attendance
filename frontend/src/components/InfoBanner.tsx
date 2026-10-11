import React from 'react';
import { CalendarCheck, FileText, CheckCircle2 } from 'lucide-react';

interface InfoBannerProps {
  onMarkAttendance: () => void;
  onViewReports: () => void;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  onMarkAttendance,
  onViewReports,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E9EDF2] p-4 shadow-xs relative overflow-hidden">
      <div className="space-y-3">
        {/* Top Header Row with Title and 100% Free Badge */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-[16px] text-[#1E293B] tracking-tight">
              Punjab Attendance & Payroll
            </h3>
            <p className="text-xs text-[#737B86] font-normal leading-relaxed">
              Manage employee attendance and payroll in one place.
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0 ml-2">
            <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
            100% Free
          </span>
        </div>

        {/* Two Useful Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onMarkAttendance}
            className="py-2 px-3 bg-[#3478E8] hover:bg-[#2563EB] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={onViewReports}
            className="py-2 px-3 bg-[#EFF6FF] hover:bg-blue-100/70 active:scale-[0.98] text-[#3478E8] border border-blue-200/80 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
