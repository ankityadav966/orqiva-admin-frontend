'use client';

import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Loader2, Sparkles, Eye, Plus, X } from 'lucide-react';

export default function HomepageManagerPage() {
  const [formData, setFormData] = useState({
    badgeText: 'Award-Winning Global IT Company',
    headingLine1: 'Transform Your',
    headingLine2: 'Business With',
    typingWords: ['Custom Software', 'Mobile Apps', 'ERP Systems', 'AI Solutions', 'Cloud Architecture', 'Digital Marketing'],
    description: 'Enterprise-grade software, mobile apps, ERP & AI that drive measurable growth across 10+ countries.',
    primaryCtaText: 'Get Free Quote',
    primaryCtaUrl: '/get-quote',
    secondaryCtaText: 'Book Free Demo',
    secondaryCtaUrl: '/book-demo',
    heroImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=960&h=720&fit=crop&auto=format&q=80',
    trustBadges: ['ISO 27001 Certified', 'GDPR Compliant', '99.9% Uptime SLA'],
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const fetchHero = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hero');
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load hero section data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/hero', formData);
      if (res.success) {
        toast.success('Hero section updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const addTypingWord = () => {
    if (newWord.trim() && !formData.typingWords.includes(newWord.trim())) {
      setFormData((prev) => ({
        ...prev,
        typingWords: [...prev.typingWords, newWord.trim()],
      }));
      setNewWord('');
    }
  };

  const removeTypingWord = (idx) => {
    setFormData((prev) => ({
      ...prev,
      typingWords: prev.typingWords.filter((_, i) => i !== idx),
    }));
  };

  const addTrustBadge = () => {
    if (newBadge.trim() && !formData.trustBadges.includes(newBadge.trim())) {
      setFormData((prev) => ({
        ...prev,
        trustBadges: [...prev.trustBadges, newBadge.trim()],
      }));
      setNewBadge('');
    }
  };

  const removeTrustBadge = (idx) => {
    setFormData((prev) => ({
      ...prev,
      trustBadges: prev.trustBadges.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#FF6A21]" />
        <span className="text-xs text-slate-400">Loading Homepage Settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Hero Section Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Customize the main headline, typing text rotations, CTAs, and featured hero visual.
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
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Headlines Card */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Headlines &amp; Badges
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Top Eyebrow Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  placeholder="e.g. Award-Winning Global IT Company"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Heading Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.headingLine1}
                    onChange={(e) => setFormData({ ...formData, headingLine1: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Heading Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.headingLine2}
                    onChange={(e) => setFormData({ ...formData, headingLine2: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Animated Typing Words */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Rotating Headline Typing Words
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.typingWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6A21]/15 text-[#FF8336] border border-[#FF6A21]/30 text-xs font-semibold"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() => removeTypingWord(idx)}
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new phrase (e.g. AI Automation)..."
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTypingWord())}
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTypingWord}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* CTAs & Links Card */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Call To Action (CTA) Buttons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={formData.primaryCtaText}
                    onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary CTA URL
                  </label>
                  <input
                    type="text"
                    value={formData.primaryCtaUrl}
                    onChange={(e) => setFormData({ ...formData, primaryCtaUrl: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryCtaText}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Secondary CTA URL
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryCtaUrl}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaUrl: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual & Trust Badges */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Hero Image Visual
              </h3>
              <ImageUpload
                label="Hero Showcase Visual"
                value={formData.heroImage}
                onChange={(url) => setFormData({ ...formData, heroImage: url })}
              />
            </div>

            {/* Trust Badges */}
            <div className="glass-card rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
              <h3 className="text-sm font-bold text-white font-display border-b border-[#1E2D4A] pb-3">
                Trust &amp; Compliance Badges
              </h3>
              <div className="space-y-2">
                {formData.trustBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#0F1829] border border-[#1E2D4A] rounded-xl text-xs font-semibold text-slate-200"
                  >
                    <span>{badge}</span>
                    <button
                      type="button"
                      onClick={() => removeTrustBadge(idx)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New badge (e.g. SOC 2 Ready)..."
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrustBadge())}
                  className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={addTrustBadge}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
  );
}
