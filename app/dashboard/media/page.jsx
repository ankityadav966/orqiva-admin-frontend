'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Trash2,
  Eye,
  Loader2,
  ExternalLink,
  Check,
  Search,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media');
      if (res.success) {
        setMediaList(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load media files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    setUploading(true);
    try {
      const res = await api.upload('/media/upload', formData);
      if (res.success) {
        toast.success('Media asset uploaded successfully!');
        fetchMedia();
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    setActionLoading(true);
    try {
      await api.delete(`/media/${selectedMedia._id}`);
      toast.success('Media file deleted.');
      setIsDeleteOpen(false);
      fetchMedia();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    (m.title || m.originalName || m.url || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Media &amp; Asset Library</h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload images, client logos, project screenshots, and brand assets to use across the CMS.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              <span>{uploading ? 'Uploading Asset...' : 'Upload Media'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
          />
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#FF6A21]" />
            <span className="text-xs text-slate-400">Loading Media Library...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-[#1E2D4A] max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-700 mb-3">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-sm font-bold text-white font-display">No Media Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Click &quot;Upload Media&quot; above to upload your first image asset.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item._id}
                className="group glass-card rounded-2xl border border-[#1E2D4A] overflow-hidden flex flex-col hover:border-[#FF6A21]/40 transition-all duration-200"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.title || 'Media asset'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Overlay Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setIsPreviewOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.url, item._id)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                      title="Copy URL"
                    >
                      {copiedId === item._id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-[#0F1829]/70 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-bold text-white truncate font-display" title={item.title || item.originalName}>
                    {item.title || item.originalName || 'Image Asset'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2D4A] text-[10px] text-slate-400">
                    <span>{item.mimeType?.split('/')[1]?.toUpperCase() || 'IMG'}</span>
                    <button
                      onClick={() => handleCopyUrl(item.url, item._id)}
                      className="text-[#FF8336] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy size={10} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={selectedMedia?.title || 'Media Preview'}
          size="lg"
        >
          {selectedMedia && (
            <div className="space-y-4">
              <div className="max-h-96 bg-[#0B1220] rounded-2xl overflow-hidden flex items-center justify-center border border-[#1E2D4A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-h-96 w-auto object-contain"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1829] border border-[#1E2D4A] flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-mono text-slate-300 truncate">{selectedMedia.url}</p>
                </div>
                <button
                  onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia._id)}
                  className="btn-brand px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                >
                  <Copy size={12} />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={actionLoading}
          title="Delete Media Asset"
          message={`Are you sure you want to permanently delete "${selectedMedia?.title || 'this file'}"?`}
        />
      </div>
  );
}
