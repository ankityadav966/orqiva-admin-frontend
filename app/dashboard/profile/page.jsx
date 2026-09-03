'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User, Lock, Save, Loader2, KeyRound, ShieldCheck } from 'lucide-react';

export default function AdminProfilePage() {
  const { user, updateUserData } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@orqivatech.com',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        toast.success('Admin profile updated successfully.');
        updateUserData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Administrator Profile &amp; Security</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your CMS administrative account credentials, display profile, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Admin Profile Card */}
          <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FF5A1F] to-[#B91C1C] flex items-center justify-center text-white overflow-hidden shadow-xl shadow-[#FF6A21]/30 p-1 border-2 border-[#FF6A21]/40">
              {profileData.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileData.avatar} alt="Admin" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <User size={48} />
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-white font-display">{profileData.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{profileData.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A21]/15 text-[#FF8336] text-[11px] font-bold uppercase tracking-wider mt-3 border border-[#FF6A21]/30">
                <ShieldCheck size={12} />
                <span>{user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}</span>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-[#1E2D4A] text-left text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-semibold">Active &amp; Verified</span>
              </div>
              <div className="flex justify-between">
                <span>CMS Version:</span>
                <span className="text-slate-300 font-mono">v1.0.0 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Middle & Right: Update Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Info Form */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A]">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3 mb-4">
                Personal Information
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <ImageUpload
                  label="Profile Avatar Photo"
                  value={profileData.avatar}
                  onChange={(url) => setProfileData({ ...profileData, avatar: url })}
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn-brand px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Update Profile</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center gap-2 border-b border-[#1E2D4A] pb-3 mb-4">
                <KeyRound size={16} className="text-[#FF6A21]" />
                <h3 className="text-sm font-bold text-white font-display">Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-brand px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}
