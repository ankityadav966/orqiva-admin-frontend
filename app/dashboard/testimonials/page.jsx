'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Star, MessageSquareQuote } from 'lucide-react';

export default function TestimonialsManagerPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    designation: '',
    company: '',
    avatar: '',
    testimonial: '',
    rating: 5,
    isFeatured: true,
    isPublished: true,
    order: 0,
  });

  const fetchTestimonials = useCallback(async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/testimonials?search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setTestimonials(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      fetchTestimonials('');
      return;
    }
    const timer = setTimeout(() => {
      fetchTestimonials(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchTestimonials]);

  const handleOpenCreate = () => {
    setSelectedTestimonial(null);
    setFormData({
      clientName: '',
      designation: 'CEO',
      company: '',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face&q=80',
      testimonial: '',
      rating: 5,
      isFeatured: true,
      isPublished: true,
      order: testimonials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTestimonial(t);
    setFormData({
      clientName: t.clientName || '',
      designation: t.designation || '',
      company: t.company || '',
      avatar: t.avatar || '',
      testimonial: t.testimonial || '',
      rating: t.rating || 5,
      isFeatured: t.isFeatured !== false,
      isPublished: t.isPublished !== false,
      order: t.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedTestimonial) {
        await api.put(`/testimonials/${selectedTestimonial._id}`, formData);
        toast.success('Testimonial updated successfully.');
      } else {
        await api.post('/testimonials', formData);
        toast.success('Testimonial added successfully.');
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    setModalLoading(true);
    try {
      await api.delete(`/testimonials/${selectedTestimonial._id}`);
      toast.success('Testimonial deleted.');
      setIsDeleteOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Client Reviewer',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-[#1E2D4A] overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.avatar || '/orqiva_tech_logo.jpg'} alt={row.clientName} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.clientName}</p>
            <p className="text-xs text-slate-400">
              {row.designation} {row.company ? `• ${row.company}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => (
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(row.rating || 5)].map((_, i) => (
            <Star key={i} size={13} fill="currentColor" />
          ))}
        </div>
      ),
    },
    {
      header: 'Feedback Quote',
      accessor: 'testimonial',
      cell: (row) => <p className="text-xs text-slate-300 italic line-clamp-2 max-w-sm">&ldquo;{row.testimonial}&rdquo;</p>,
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
              setSelectedTestimonial(row);
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
            <h1 className="text-2xl font-black text-white font-display">Client Testimonials &amp; Reviews</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage client feedback, 5-star ratings, and executive endorsements featured on the ORQIVA Tech website.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Testimonial</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={testimonials}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reviews by client, company, quote..."
          emptyTitle="No Testimonials Found"
          emptyMessage="Click Add Testimonial to publish a client review."
        />

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Mehta"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. CEO or Founder"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. MediCare Group"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Star Rating (1–5)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) || 5 })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value={5} className="bg-[#111C2E] text-white">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4} className="bg-[#111C2E] text-white">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3} className="bg-[#111C2E] text-white">⭐⭐⭐ (3 Stars)</option>
                </select>
              </div>
            </div>

            <ImageUpload
              label="Client Avatar Photo"
              value={formData.avatar}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Testimonial Feedback Quote *
              </label>
              <textarea
                rows={4}
                required
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Orqiva Tech transformed our operations..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Featured on Home Carousel</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Active &amp; Visible</span>
              </label>
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
                <span>{selectedTestimonial ? 'Update Testimonial' : 'Add Testimonial'}</span>
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
          title="Delete Testimonial"
          message={`Are you sure you want to remove the review from "${selectedTestimonial?.clientName}"?`}
        />
      </div>
  );
}
