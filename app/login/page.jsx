'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Loader2, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const FIXED_EMAIL = 'ankityadav941318@gmail.com';
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const { sendOtp, verifyOtp } = useAuth();

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP box on step change
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || email.trim().toLowerCase() !== FIXED_EMAIL.toLowerCase()) {
      toast.error('Access denied. You are not authorized to access this panel.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(email.trim().toLowerCase());
    setLoading(false);

    if (res?.success) {
      setStep('otp');
      setResendCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newValues = [...otpValues];
    newValues[index] = cleanVal.slice(-1); // Take last character typed
    setOtpValues(newValues);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('');
      setOtpValues(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    await verifyOtp(email.trim().toLowerCase(), otpCode);
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

          {step === 'email' ? (
            /* STEP 1: Enter Fixed Email */
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Administrator Email
                  </label>
                </div>

                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email address"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm text-white bg-slate-900/80 border-slate-700 placeholder:text-slate-500 font-medium focus:border-[#FF6A21] outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#FF6A21]" />
                  <span>A 6-digit OTP will be delivered to the authorized email.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50 transition-all shadow-lg shadow-[#FF6A21]/20 hover:shadow-[#FF6A21]/40"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending 6-Digit OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter 6-Digit OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6A21]/15 border border-[#FF6A21]/30 flex items-center justify-center mx-auto text-[#FF6A21] mb-3">
                  <KeyRound size={22} />
                </div>
                <h2 className="text-base font-bold text-white">Enter 6-Digit Code</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  We have sent a verification code to <span className="text-white font-semibold">{email}</span>
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-white bg-[#070B14] border-2 border-[#1E2D4A] focus:border-[#FF6A21] rounded-xl outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otpValues.join('').length !== 6}
                className="w-full btn-brand py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-[#FF6A21]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify &amp; Open Dashboard</span>
                  </>
                )}
              </button>

              {/* Resend & Back Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E2D4A] text-xs">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <ArrowLeft size={13} />
                  <span>Change Email</span>
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-slate-500 font-medium">
                    Resend in <strong className="text-[#FF6A21]">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-[#FF6A21] hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-[#1E2D4A]/80 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-[#FF6A21]" />
              <span>Two-Factor Authentication Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
