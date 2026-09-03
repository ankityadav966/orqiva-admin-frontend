'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Building2, Sparkles } from 'lucide-react';

export default function IndustriesManagerPage() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '🏥',
    projectCount: '40+',
    description: '',
    color: '#FF6A21',
    order: 0,
    isPublished: true,
  });

  const popularEmojis = ['🏥', '🎓', '💰', '🛒', '🏭', '🏠', '✈️', '🏛️', '⚡', '🚀', '🌐', '🛡️', '📦', '🍔', '🚗'];

  const fetchIndustries = useCallback(async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/industries?search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setIndustries(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load industries.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      fetchIndustries('');
      return;
    }
    const timer = setTimeout(() => {
      fetchIndustries(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchIndustries]);

  const handleOpenCreate = () => {
    setSelectedIndustry(null);
    setFormData({
      name: '',
      slug: '',
      icon: '🏥',
      projectCount: '20+',
      description: '',
      color: '#FF6A21',
      order: industries.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (industry) => {
    setSelectedIndustry(industry);
    setFormData({
      name: industry.name || '',
      slug: industry.slug || '',
      icon: industry.icon || '🏥',
      projectCount: industry.projectCount || '40+',
      description: industry.description || '',
      color: industry.color || '#FF6A21',
      order: industry.order || 0,
      isPublished: industry.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedIndustry) {
        await api.put(`/industries/${selectedIndustry._id}`, formData);
        toast.success('Industry updated successfully.');
      } else {
        await api.post('/industries', formData);
        toast.success('Industry created successfully.');
      }
      setIsModalOpen(false);
      fetchIndustries();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIndustry) return;
    setModalLoading(true);
    try {
      await api.delete(`/industries/${selectedIndustry._id}`);
      toast.success('Industry deleted.');
      setIsDeleteOpen(false);
      fetchIndustries();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Industry Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-slate-800/80 border border-[#1E2D4A]"
            style={{ borderColor: row.color ? `${row.color}40` : '#1E2D4A' }}
          >
            {row.icon || '🏥'}
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.name}</p>
            <p className="text-xs text-slate-400 truncate max-w-xs">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Project Count Badge',
      cell: (row) => (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
          style={{
            background: row.color ? `${row.color}20` : 'rgba(255, 106, 33, 0.15)',
            borderColor: row.color ? `${row.color}50` : 'rgba(255, 106, 33, 0.3)',
            color: row.color || '#FF8336',
          }}
        >
          {row.projectCount} Projects
        </span>
      ),
    },
    {
      header: 'URL Slug',
      accessor: 'slug',
      cell: (row) => <span className="text-xs font-mono text-slate-400">/{row.slug}</span>,
    },
    {
      header: 'Order',
      accessor: 'order',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold text-slate-300">
          #{row.order}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'} size="sm">
          {row.isPublished ? 'Published' : 'Hidden'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              setSelectedIndustry(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6A21]/15 text-[#FF8336] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              <span>Core Homepage Module</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display">Industries Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage all industry categories, icon glyphs, and project counters rendered on the public website.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Industry</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={industries}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search industries (Healthcare, Education, Finance...)..."
          emptyTitle="No Industries Found"
          emptyMessage="Click Add Industry to configure your first domain category."
        />

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedIndustry ? 'Edit Industry Domain' : 'Add New Industry'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Emoji Icon *
                </label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏥"
                  className="w-full glass-input rounded-xl px-4 py-2 text-center text-xl"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Industry Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Healthcare"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Quick Emoji Pickers */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Quick Icon Glyphs:</span>
              <div className="flex flex-wrap gap-1.5">
                {popularEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-base flex items-center justify-center transition border border-[#1E2D4A]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Count Badge *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectCount}
                  onChange={(e) => setFormData({ ...formData, projectCount: e.target.value })}
                  placeholder="e.g. 40+ or 55+"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Industry Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Hospital ERP, patient portals, telemedicine, and medical billing."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 glass-input rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>Published Live</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2D4A]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="btn-brand px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {modalLoading && <Loader2 size={14} className="animate-spin" />}
                <span>{selectedIndustry ? 'Update Industry' : 'Create Industry'}</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={modalLoading}
          title="Delete Industry"
          message={`Are you sure you want to delete "${selectedIndustry?.name}"?`}
        />
      </div>
  );
}
