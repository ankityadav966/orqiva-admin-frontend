'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@orqivatech.com');
  const [password, setPassword] = useState('Admin@Orqiva2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleFillDemo = () => {
    setEmail('admin@orqivatech.com');
    setPassword('Admin@Orqiva2026!');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none bg-[#FF6A21]" />
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
        {/* Brand Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#1E2D4A] shadow-2xl shadow-black/80">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8336] via-[#FF5A1F] to-[#B91C1C] flex items-center justify-center mx-auto shadow-xl shadow-[#FF6A21]/30 mb-4">
              <span className="text-white font-black text-2xl font-display">O</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight">
              ORQIVA <span className="text-[#FF6A21]">TECH</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Enterprise Content Management & Control Panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@orqivatech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brand py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 pt-6 border-t border-[#1E2D4A]/80 text-center">
            <div className="bg-[#0F1829] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center justify-between gap-3 text-left">
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
                  <ShieldCheck size={14} className="text-[#FF6A21]" />
                  <span>Default Seed Admin</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">admin@orqivatech.com</p>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 rounded-lg bg-[#FF6A21]/15 text-[#FF8336] hover:bg-[#FF6A21]/25 text-xs font-bold border border-[#FF6A21]/30 transition flex items-center gap-1 flex-shrink-0"
              >
                <Sparkles size={12} />
                <span>Fill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>Protected with JWT &amp; 256-bit encryption</span>
          <span>•</span>
          <span>ORQIVA Tech CMS v1.0</span>
        </div>
      </div>
    </div>
  );
}
