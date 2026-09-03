'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@orqivatech.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide both email and password.');
      return;
    }

    setLoading(true);
    await login(email.trim().toLowerCase(), password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none bg-[#FF6A21]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none bg-blue-600" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#1E2D4A] shadow-2xl shadow-black/90 bg-[#0E1524]/90 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8336] via-[#FF5A1F] to-[#B91C1C] flex items-center justify-center mx-auto shadow-xl shadow-[#FF6A21]/30 mb-4">
              <span className="text-white font-black text-2xl font-display">O</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight">
              ORQIVA <span className="text-[#FF6A21]">TECH</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Enterprise CMS &amp; Administration Security
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@orqivatech.com"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm text-white bg-slate-900/80 border-slate-700 placeholder:text-slate-500 font-medium focus:border-[#FF6A21] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full glass-input rounded-xl pl-10 pr-11 py-3 text-sm text-white bg-slate-900/80 border-slate-700 placeholder:text-slate-500 font-medium focus:border-[#FF6A21] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brand py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50 transition-all shadow-lg shadow-[#FF6A21]/20 hover:shadow-[#FF6A21]/40"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-[#1E2D4A]/80 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-[#FF6A21]" />
              <span>Encrypted Credentials &amp; JWT Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
