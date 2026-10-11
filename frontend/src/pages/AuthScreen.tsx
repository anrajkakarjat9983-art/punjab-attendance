import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, Phone, User } from 'lucide-react';
import api from '../services/api';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('kp@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Kanishk');
  const [businessName, setBusinessName] = useState('kanishk');
  const [phone, setPhone] = useState('7891012005');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email: identifier,
          phone,
          password,
          businessName,
        });
        if (res.success) {
          onAuthSuccess();
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        const res = await api.login(identifier, password);
        if (res.success) {
          onAuthSuccess();
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setIsRegister(false);
    setIdentifier('kp@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E9EDF2] shadow-xl space-y-5 animate-in zoom-in-95">
        {/* Brand Logo & Name */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-blue-200 flex items-center justify-center mx-auto text-[#3478E8] shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#1E293B] pt-2">
            Punjab Attendance & Payroll
          </h1>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 100% Free Workforce Solution
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanishk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#3478E8] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kanishk"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#3478E8] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 7891012005"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#3478E8] focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-slate-600 font-semibold block mb-1">
              {isRegister ? 'Email Address' : 'Email or Phone'}
            </label>
            <input
              type="text"
              required
              placeholder="kp@gmail.com or 7891012005"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#3478E8] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#3478E8] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3478E8] hover:bg-[#2563EB] active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Please wait...' : isRegister ? 'Create Free Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center space-y-2 text-xs">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-[#3478E8] font-bold hover:underline"
          >
            One-Click Demo Login (Kanishk Enterprises)
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-slate-500 font-medium hover:text-slate-800"
          >
            {isRegister ? 'Already registered? Sign In' : 'New business? Register 100% Free'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
