'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Save,
  Loader2,
  Building,
  Globe,
  Share2,
  Phone,
  Mail,
  MapPin,
  Search,
  Eye,
  Settings as SettingsIcon,
} from 'lucide-react';

export default function SettingsManagerPage() {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'social' | 'seo' | 'footer'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: 'ORQIVA Tech',
    tagline: 'Leading Software Development & AI Engineering Company',
    email: 'info@orqivatech.com',
    supportEmail: 'support@orqivatech.com',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'World Trade Park, Malviya Nagar, Jaipur, Rajasthan 302017',
    workingHours: 'Mon - Fri: 9:00 AM - 7:00 PM IST',
    logo: '/orqiva_tech_logo.jpg',
    favicon: '/favicon.ico',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/orqivatech',
      twitter: 'https://twitter.com/orqivatech',
      instagram: 'https://instagram.com/orqivatech',
      facebook: 'https://facebook.com/orqivatech',
      youtube: 'https://youtube.com/@orqivatech',
      github: 'https://github.com/orqivatech',
    },
    seo: {
      metaTitle: 'ORQIVA Tech — Leading Software Development & AI Engineering Company',
      metaDescription:
        'Award-winning software development, mobile apps, ERP systems, AI automation, and cloud engineering across 10+ countries.',
      metaKeywords: ['software development', 'ERP solutions', 'mobile apps', 'AI agency', 'ORQIVA Tech'],
      ogImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop&auto=format',
    },
    footer: {
      aboutText:
        'ORQIVA Tech is an award-winning global IT & software engineering company delivering scalable digital products, ERP solutions, and AI automation for fast-growing enterprises worldwide.',
      copyrightText: '© 2025 ORQIVA Tech. All rights reserved.',
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setFormData((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      toast.error('Failed to load website settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', formData);
      if (res.success) {
        toast.success('Website settings updated successfully! Live website will refresh.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#FF6A21]" />
        <span className="text-xs font-semibold text-slate-400">Loading Corporate Settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Company Profile & Contact', icon: Building },
    { id: 'social', label: 'Social Channels', icon: Share2 },
    { id: 'seo', label: 'Global SEO Defaults', icon: Search },
    { id: 'footer', label: 'Footer & Compliance', icon: Globe },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6A21] flex items-center justify-center">
                <SettingsIcon size={16} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Website Settings &amp; Configuration
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure company contact credentials, social networks, SEO metadata, and footer brand identity.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Save All Settings</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${isActive
                  ? 'bg-[#FF6A21] text-white shadow-sm font-bold'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* General Profile Tab */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 admin-card rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-3">
                Corporate Credentials &amp; Contact Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Official Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Public Primary Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Support / Help Email
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Official Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Office HQ Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Operating Hours / Timezone
                </label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Live Website Preview Card */}
            <div className="admin-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-white font-display">Live Website Preview</h3>
                  <Eye size={14} className="text-[#FF6A21]" />
                </div>
                <div className="p-4 rounded-2xl bg-[#090E18] border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company</span>
                    <span className="text-white font-bold">{formData.companyName || 'ORQIVA Tech'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</span>
                    <span className="text-orange-400 font-semibold">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone / WhatsApp</span>
                    <span className="text-slate-200 font-mono">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Location</span>
                    <span className="text-slate-400">{formData.address}</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

        {/* Social Channels Tab */}
        {activeTab === 'social' && (
          <div className="admin-card rounded-3xl p-6 max-w-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-3">
              Official Social Media &amp; Profiles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'github'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 capitalize">
                    {key} Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks?.[key] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, [key]: e.target.value },
                      })
                    }
                    placeholder={`https://${key}.com/...`}
                    className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Defaults Tab */}
        {activeTab === 'seo' && (
          <div className="admin-card rounded-3xl p-6 max-w-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-3">
              Global SEO &amp; Meta Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                value={formData.seo?.metaTitle || ''}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })
                }
                className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.metaDescription || ''}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })
                }
                className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="url"
                value={formData.seo?.ogImage || ''}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, ogImage: e.target.value } })
                }
                className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className="admin-card rounded-3xl p-6 max-w-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-3">
              Footer Identity &amp; Legal Notices
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Footer Tagline / About Text
              </label>
              <textarea
                rows={3}
                value={formData.footer?.aboutText || ''}
                onChange={(e) =>
                  setFormData({ ...formData, footer: { ...formData.footer, aboutText: e.target.value } })
                }
                className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Copyright Notice
              </label>
              <input
                type="text"
                value={formData.footer?.copyrightText || ''}
                onChange={(e) =>
                  setFormData({ ...formData, footer: { ...formData.footer, copyrightText: e.target.value } })
                }
                className="w-full admin-input rounded-xl px-3.5 py-2 text-xs sm:text-sm"
              />
            </div>
          </div>
        )}
      </form>
  );
}

