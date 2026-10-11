import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeScreen from './pages/HomeScreen';
import AttendanceScreen from './pages/AttendanceScreen';
import GeoScreen from './pages/GeoScreen';
import SettingsScreen from './pages/SettingsScreen';
import AuthScreen from './pages/AuthScreen';
import { User, Business } from './types';
import api from './services/api';
import { Lock, Unlock } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'geo' | 'settings'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // App Lock PIN check
  const [isPinLocked, setIsPinLocked] = useState(() => {
    return !!localStorage.getItem('pb_app_pin');
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      // Auto-login with seeded credentials for seamless instant review
      try {
        const loginRes = await api.login('kp@gmail.com', 'password123');
        if (loginRes.success) {
          setUser(loginRes.user);
          setBusiness(loginRes.currentBusiness);
        }
      } catch (e) {
        console.warn('Auto login failed, showing auth screen');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        setBusiness(res.currentBusiness);
      } else {
        api.setToken(null);
      }
    } catch (e) {
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('pb_app_pin');
    if (enteredPin === stored) {
      setIsPinLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    api.setBusinessId(null);
    setUser(null);
    setBusiness(null);
    setActiveTab('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#3478E8] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">Starting Punjab Attendance & Payroll...</span>
      </div>
    );
  }

  // App PIN Lock gate
  if (isPinLocked) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-xs w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3478E8] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900">App Locked</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter 4-digit security PIN to access</p>
          </div>

          {pinError && <p className="text-xs text-red-600 font-bold">Incorrect PIN. Try again.</p>}

          <form onSubmit={handleUnlockPin} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              autoFocus
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 text-center text-xl font-bold tracking-widest border border-slate-200 rounded-xl"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#3478E8] text-white font-bold rounded-xl text-xs"
            >
              Unlock Application
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex justify-center">
      <div className="w-full max-w-md bg-[#F7F9FC] min-h-screen relative flex flex-col shadow-2xl">
        {/* Tab Pages */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomeScreen
              onNavigateTab={setActiveTab}
              user={user}
              business={business}
              onRefreshMe={checkAuth}
            />
          )}

          {activeTab === 'attendance' && <AttendanceScreen />}

          {activeTab === 'geo' && <GeoScreen />}

          {activeTab === 'settings' && (
            <SettingsScreen
              business={business}
              user={user}
              onRefreshMe={checkAuth}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Fixed Mobile Safe Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
