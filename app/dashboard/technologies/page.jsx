'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Cpu, Check, Eye } from 'lucide-react';

export default function TechnologiesManagerPage() {
  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const categories = ['All', 'Frontend', 'Backend', 'Mobile', 'Cloud', 'DevOps', 'Database', 'AI'];
  const colorPresets = ['#FF6A21', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#64748B'];

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Frontend',
    color: '#FF6A21',
    description: '',
    order: 0,
    isPublished: true,
  });

  const fetchTech = useCallback(async (searchQuery = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const res = await api.get(`/technologies?search=${encodeURIComponent(searchQuery)}${catParam}`);
      if (res.success) {
        setTechList(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load technologies.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    if (!search) {
      fetchTech('', selectedCategory);
      return;
    }
    const timer = setTimeout(() => {
      fetchTech(search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, fetchTech]);

  const handleOpenCreate = () => {
    setSelectedTech(null);
    setFormData({
      name: '',
      slug: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Frontend',
      color: '#FF6A21',
      description: '',
      order: techList.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tech) => {
    setSelectedTech(tech);
    setFormData({
      name: tech.name || '',
      slug: tech.slug || '',
      category: tech.category || 'Frontend',
      color: tech.color || '#FF6A21',
      description: tech.description || '',
      order: tech.order || 0,
      isPublished: tech.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedTech) {
        await api.put(`/technologies/${selectedTech._id}`, formData);
        toast.success('Technology updated successfully.');
      } else {
        await api.post('/technologies', formData);
        toast.success('Technology added successfully.');
      }
      setIsModalOpen(false);
      fetchTech();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTech) return;
    setModalLoading(true);
    try {
      await api.delete(`/technologies/${selectedTech._id}`);
      toast.success('Technology deleted.');
      setIsDeleteOpen(false);
      fetchTech();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Technology',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{
              background: `${row.color || '#FF6A21'}18`,
              color: row.color || '#FF8336',
              border: `1px solid ${row.color || '#FF6A21'}35`,
            }}
          >
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white font-display text-xs sm:text-sm truncate">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">/{row.slug || row.name.toLowerCase()}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Order',
      accessor: 'order',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono font-bold text-slate-400">
          #{row.order}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'} size="sm">
          {row.isPublished ? 'Live on Site' : 'Hidden'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Edit Technology"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => {
              setSelectedTech(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
            title="Delete Technology"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const categoryFilters = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-md custom-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => setSelectedCategory(cat)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? 'bg-[#FF6A21] text-white shadow-sm font-bold'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6A21] flex items-center justify-center">
                <Cpu size={16} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Technology Stack Manager
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage programming languages, frameworks, AI models, and cloud tools displayed on the public website.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Technology</span>
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={techList}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search technologies (e.g. React, Node.js, Python)..."
          filters={categoryFilters}
          emptyTitle="No Technologies Found"
          emptyMessage="No technology matches your current search or category filter."
          emptyAction={
            <button
              onClick={handleOpenCreate}
              className="btn-primary px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              Add New Technology
            </button>
          }
        />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTech ? 'Edit Technology' : 'Add New Technology'}
        subtitle="This technology badge will sync live across the homepage & technologies section."
        icon={Cpu}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Technology Name <span className="text-[#FF6A21]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React, Next.js, FastAPI, Solana"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: !selectedTech ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : formData.slug,
                });
              }}
              className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#0E1524] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: c }}
                  title={c}
                >
                  {formData.color === c && <Check size={14} className="text-white drop-shadow" />}
                </button>
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-[#090E18] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                style={{
                  background: `${formData.color}20`,
                  color: formData.color,
                  border: `1px solid ${formData.color}40`,
                }}
              >
                {(formData.name || 'AB').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{formData.name || 'Technology Name'}</p>
                <p className="text-[11px] text-slate-400">{formData.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Eye size={12} className="text-[#FF6A21]" />
              <span>Live Card Preview</span>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-xs font-semibold text-slate-200 cursor-pointer">
              Publish immediately on public website
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {modalLoading && <Loader2 size={14} className="animate-spin" />}
              <span>{selectedTech ? 'Save Changes' : 'Create Technology'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Technology"
        message={`Are you sure you want to remove "${selectedTech?.name}" from your active technology stack? This will sync immediately on the website.`}
        confirmText="Yes, Delete"
        loading={modalLoading}
        variant="danger"
      />
    </div>
  );
}
