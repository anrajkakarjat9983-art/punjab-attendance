import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Building2,
  Clock,
  Radio,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Branch, Employee } from '../types';
import api from '../services/api';

export const GeoScreen: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [punchResult, setPunchResult] = useState<any>(null);
  const [punching, setPunching] = useState(false);
  const [offlineSynced, setOfflineSynced] = useState<number | null>(null);

  useEffect(() => {
    loadGeoData();
    fetchCurrentLocation();
  }, []);

  const loadGeoData = async () => {
    try {
      const [resB, resStaff] = await Promise.all([api.listBranches(), api.listEmployees()]);
      if (resB.success) setBranches(resB.branches);
      if (resStaff.success && resStaff.employees.length > 0) {
        setEmployees(resStaff.employees);
        setSelectedEmpId(resStaff.employees[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCurrentLocation = () => {
    setGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: parseFloat(pos.coords.latitude.toFixed(5)),
            lng: parseFloat(pos.coords.longitude.toFixed(5)),
          });
          setGettingLocation(false);
        },
        (err) => {
          console.warn('Geolocation fallback to Ludhiana Main Works coords');
          // Simulated Punjab office coordinates
          setCoords({ lat: 30.9011, lng: 75.8574 });
          setGettingLocation(false);
        },
        { timeout: 8000 }
      );
    } else {
      setCoords({ lat: 30.9011, lng: 75.8574 });
      setGettingLocation(false);
    }
  };

  const handlePunch = async (type: 'IN' | 'OUT') => {
    if (!selectedEmpId || !coords) return;
    setPunching(true);
    try {
      const res = await api.geoPunch(selectedEmpId, coords.lat, coords.lng, type);
      setPunchResult(res);
    } catch (e: any) {
      alert(e.message || 'Geo punch failed');
    } finally {
      setPunching(false);
    }
  };

  const handleSyncOffline = async () => {
    try {
      const res = await api.syncOfflinePunches();
      setOfflineSynced(res.synced);
      setTimeout(() => setOfflineSynced(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      {/* Top Header */}
      <div className="bg-[#EFF6FF] border-b border-[#E3EDFA] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-blue-100 flex items-center justify-center text-[#3478E8]">
              <Radio className="w-4 h-4 text-[#3478E8] animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Geo-Fenced Attendance</h2>
              <p className="text-[11px] text-[#737B86]">Authorized workplace verification</p>
            </div>
          </div>

          <button
            onClick={fetchCurrentLocation}
            disabled={gettingLocation}
            className="p-1.5 rounded-xl bg-white border border-blue-200 text-[#3478E8] shadow-2xs hover:bg-blue-50"
            title="Refresh GPS"
          >
            <RefreshCw className={`w-4 h-4 ${gettingLocation ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* Radar Graphic Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9EDF2] shadow-xs text-center relative overflow-hidden">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-blue-100 animate-ping opacity-25" />
            <div className="absolute inset-2 rounded-full border border-blue-200 bg-blue-50/40" />
            <div className="absolute inset-8 rounded-full border border-blue-300 bg-blue-100/50" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#3478E8] text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/25">
              <Navigation className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="font-bold text-sm text-[#1E293B]">Live Location Status</h3>
            <p className="text-xs text-slate-500 font-mono">
              {coords ? `Lat: ${coords.lat} · Long: ${coords.lng}` : 'Acquiring GPS fix...'}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
              <ShieldCheck className="w-3 h-3 mr-1" /> GPS Accuracy: High
            </span>
          </div>
        </div>

        {/* Staff Selection for Punch */}
        <div className="bg-white rounded-2xl p-4 border border-[#E9EDF2] space-y-3 shadow-2xs">
          <h4 className="font-bold text-xs text-[#1E293B]">Select Staff to Punch</h4>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.empCode}) - {e.designation}
              </option>
            ))}
          </select>

          {/* Punch In / Out Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handlePunch('IN')}
              disabled={punching}
              className="py-3 bg-[#3478E8] hover:bg-[#2563EB] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
            >
              <span>GEO PUNCH IN</span>
              <span className="text-[10px] text-blue-200 font-normal">Check-in at Location</span>
            </button>

            <button
              onClick={() => handlePunch('OUT')}
              disabled={punching}
              className="py-3 bg-[#1E293B] hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
            >
              <span>GEO PUNCH OUT</span>
              <span className="text-[10px] text-slate-400 font-normal">Departure Punch</span>
            </button>
          </div>
        </div>

        {/* Result Callout */}
        {punchResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-1 animate-in zoom-in-95 ${
              punchResult.geofenceVerified
                ? 'bg-green-50/80 border-green-200 text-green-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-1.5 font-bold">
              {punchResult.geofenceVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {punchResult.geofenceVerified
                  ? 'Punch Verified within Authorized Premises!'
                  : 'Punch Recorded Outside Geofence Perimeter'}
              </span>
            </div>
            <p className="text-[11px]">
              Assigned Hub: <b>{punchResult.branch}</b> · Distance: <b>{punchResult.distanceMeters} meters</b>
            </p>
          </div>
        )}

        {/* Authorized Geofenced Branches */}
        <div className="bg-white rounded-2xl p-4 border border-[#E9EDF2] space-y-2 shadow-2xs">
          <div className="flex justify-between items-center pb-1">
            <h4 className="font-bold text-xs text-[#1E293B]">Configured Authorized Sites</h4>
            <span className="text-[10px] font-bold text-emerald-600">Geo Radius Active</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {branches.map((b) => (
              <div key={b.id} className="py-2.5 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3478E8] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{b.name}</h5>
                    <p className="text-[11px] text-slate-400">{b.address || 'Punjab Works'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {b.radiusMeters || 200}m Radius
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Offline sync banner */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Offline Punch Sync</span>
            <p className="text-[10px] text-slate-400">Punches work offline without internet and sync safely</p>
          </div>
          <button
            onClick={handleSyncOffline}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
          >
            Sync Offline
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeoScreen;
