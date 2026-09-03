'use client';

import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Loader2, Rocket, Code2, ExternalLink } from 'lucide-react';

export default function FeaturedProjectManagerPage() {
  const [formData, setFormData] = useState({
    name: 'ERP System for MediCare Group',
    client: 'MediCare Group',
    description: 'Complete hospital management and operations ERP suite',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=960&h=720&fit=crop&auto=format&q=80',
    url: '/portfolio',
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const res = await api.get('/featured-project');
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load featured project data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/featured-project', formData);
      if (res.success) {
        toast.success('Featured project ("Currently Building") updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#FF6A21]" />
        <span className="text-xs text-slate-400">Loading Featured Project...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white font-display">
              &quot;Currently Building&quot; Featured Project
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage the dynamic live project badge featured directly over the homepage hero banner.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-brand px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Project Details
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ERP System for MediCare Group"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Client / Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. MediCare Group"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Status Pill Label
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="e.g. Live or In Progress"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the work in progress..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Destination Link URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g. /portfolio or https://example.com"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A21]" />
                </label>
                <span className="text-xs font-semibold text-slate-300">
                  Show on Public Homepage
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview Card */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Hero Frame Image
              </h3>
              <ImageUpload
                label="Showcase Visual"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            {/* Live Preview on Homepage Badge */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-3">
              <h3 className="text-sm font-bold text-white font-display">Homepage Badge Preview</h3>
              <div className="bg-[#0B1220] p-4 rounded-2xl border border-white/10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8336] via-[#FF5A1F] to-[#B91C1C] flex items-center justify-center flex-shrink-0 text-white">
                    <Code2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-xs font-extrabold truncate font-display">
                      Currently Building
                    </div>
                    <div className="text-white/70 text-[11px] font-medium truncate">
                      {formData.name || 'ERP System for MediCare Group'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/25 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span>{formData.status || 'Live'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
  );
}
