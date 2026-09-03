'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const ImageUpload = ({ value, onChange, label = 'Upload Image', hint = 'PNG, JPG, WEBP, or SVG up to 10MB' }) => {
  const [loading, setLoading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.upload('/media/upload', formData);
      if (res.success && res.data?.url) {
        // Backend returns /uploads/... so full URL is accessible
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
          : 'https://orqiva-admin-backend.onrender.com';
        const fullUrl = res.data.url.startsWith('http')
          ? res.data.url
          : `${baseUrl}${res.data.url}`;
        onChange(fullUrl);
        toast.success('Image uploaded successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs text-[#FF8336] hover:underline flex items-center gap-1"
        >
          <LinkIcon size={12} />
          {isUrlMode ? 'Upload File instead' : 'Enter URL instead'}
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
          >
            Apply
          </button>
        </div>
      ) : null}

      {value ? (
        <div className="relative rounded-xl border border-[#1E2D4A] bg-[#0F1829] overflow-hidden p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{value}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Image Ready</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#1E2D4A] hover:border-[#FF6A21]/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0F1829]/40 hover:bg-[#0F1829] transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.svg,.pdf"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-[#FF6A21]/15 text-slate-400 group-hover:text-[#FF8336] flex items-center justify-center transition-colors">
            {loading ? <Loader2 size={22} className="animate-spin text-[#FF6A21]" /> : <Upload size={22} />}
          </div>
          <p className="text-sm font-semibold text-white mt-3 group-hover:text-[#FF8336] transition-colors">
            {loading ? 'Uploading File...' : 'Click to Upload Image'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{hint}</p>
        </div>
      )}
    </div>
  );
};
