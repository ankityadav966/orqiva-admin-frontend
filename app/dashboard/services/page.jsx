'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Layers, X, Eye, Check, Star } from 'lucide-react';

export default function ServicesManagerPage() {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const colorPresets = ['#FF6A21', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'];

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    color: '#FF6A21',
    icon: 'FaCode',
    shortDescription: '',
    description: '',
    technologies: [],
    features: [],
    order: 0,
    isFeatured: false,
    isPublished: true,
  });

  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const fetchServices = useCallback(async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/services?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setServices(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      fetchServices(1, '');
      return;
    }
    const timer = setTimeout(() => {
      fetchServices(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchServices]);

  const handleOpenCreate = () => {
    setSelectedService(null);
    setFormData({
      title: '',
      slug: '',
      color: '#FF6A21',
      icon: 'FaCode',
      shortDescription: '',
      description: '',
      technologies: ['React', 'Next.js', 'Node.js'],
      features: ['High Performance', 'Scalable Architecture', 'SEO Optimized'],
      order: services.length + 1,
      isFeatured: true,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title || '',
      slug: service.slug || '',
      color: service.color || '#FF6A21',
      icon: service.icon || 'FaCode',
      shortDescription: service.shortDescription || '',
      description: service.description || '',
      technologies: service.technologies || [],
      features: service.features || [],
      order: service.order || 0,
      isFeatured: service.isFeatured !== false,
      isPublished: service.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedService) {
        await api.put(`/services/${selectedService._id}`, formData);
        toast.success('Service updated successfully.');
      } else {
        await api.post('/services', formData);
        toast.success('Service created successfully.');
      }
      setIsModalOpen(false);
      fetchServices(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setModalLoading(true);
    try {
      await api.delete(`/services/${selectedService._id}`);
      toast.success('Service deleted.');
      setIsDeleteOpen(false);
      fetchServices(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, techInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTech = (idx) => {
    setFormData((prev) => ({ ...prev, technologies: prev.technologies.filter((_, i) => i !== idx) }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (idx) => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const columns = [
    {
      header: 'Service Title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${row.color || '#FF6A21'}18`,
              color: row.color || '#FF6A21',
              border: `1px solid ${row.color || '#FF6A21'}35`,
            }}
          >
            <Layers size={17} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-white font-display text-xs sm:text-sm truncate">{row.title}</p>
              {row.isFeatured && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  <Star size={9} /> Featured
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.shortDescription || row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'URL Slug',
      accessor: 'slug',
      cell: (row) => <span className="text-xs text-slate-400 font-mono">/{row.slug}</span>,
    },
    {
      header: 'Stack & Capabilities',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.technologies || []).slice(0, 3).map((t, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {t}
            </span>
          ))}
          {(row.technologies || []).length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
              +{row.technologies.length - 3}
            </span>
          )}
        </div>
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
          {row.isPublished ? 'Live on Site' : 'Draft'}
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
            title="Edit Service"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => {
              setSelectedService(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
            title="Delete Service"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6A21] flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Services Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create, configure, reorder, and publish the core IT &amp; software services presented on the public website.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search services by title or keyword..."
          pagination={pagination}
          onPageChange={(p) => fetchServices(p)}
          emptyTitle="No Services Found"
          emptyMessage="No service matches your search. Click Add Service to create your first offering."
          emptyAction={
            <button
              onClick={handleOpenCreate}
              className="btn-primary px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              Add New Service
            </button>
          }
        />

        {/* Modal CRUD Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedService ? 'Edit Service Offering' : 'Add New Service Offering'}
          subtitle="This service card will sync in real time across the homepage and services catalog."
          icon={Layers}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Service Title <span className="text-[#FF6A21]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      title,
                      slug: !selectedService ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : formData.slug,
                    });
                  }}
                  placeholder="e.g. Enterprise Web Applications"
                  className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL Path / Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                  className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Short Tagline / Overview <span className="text-[#FF6A21]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="High-performance, scalable web platforms built with React & Next.js..."
                className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Scope &amp; Details
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed explanation of the engineering process, deliverables, and architecture..."
                className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Included Tech Stack ({formData.technologies.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                  >
                    <span>{t}</span>
                    <button type="button" onClick={() => removeTech(idx)} className="hover:text-rose-400 transition">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add technology (e.g. Next.js, FastAPI, AWS)..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="flex-1 admin-input rounded-xl px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="btn-secondary px-3 py-2 rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Key Features &amp; Deliverables ({formData.features.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.features.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                  >
                    <span>{f}</span>
                    <button type="button" onClick={() => removeFeature(idx)} className="hover:text-rose-400 transition">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add feature (e.g. 99.9% Uptime SLA, Microservices Architecture)..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 admin-input rounded-xl px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn-secondary px-3 py-2 rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Theme Color Accent
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

            {/* Display Order & Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-full admin-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                  <span>Show in Homepage Featured Services</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                  <span>Publish live on website</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
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
                <span>{selectedService ? 'Save Changes' : 'Create Service'}</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={modalLoading}
          title="Delete Service"
          message={`Are you sure you want to delete "${selectedService?.title}"? This service will be removed from the public website.`}
          confirmText="Yes, Delete"
          variant="danger"
        />
      </div>
  );
}
