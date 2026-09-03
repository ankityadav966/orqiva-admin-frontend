'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, HelpCircle } from 'lucide-react';

export default function FAQsManagerPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const categories = ['All', 'General Questions', 'Services & Pricing', 'Development Process', 'Support & Maintenance', 'Legal & Compliance'];

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General Questions',
    order: 0,
    isPublished: true,
  });

  const fetchFaqs = useCallback(async (searchQuery = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const res = await api.get(`/faqs?search=${encodeURIComponent(searchQuery)}${catParam}`);
      if (res.success) {
        setFaqs(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    if (!search) {
      fetchFaqs('', selectedCategory);
      return;
    }
    const timer = setTimeout(() => {
      fetchFaqs(search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, fetchFaqs]);

  const handleOpenCreate = () => {
    setSelectedFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'General Questions',
      order: faqs.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General Questions',
      order: faq.order || 0,
      isPublished: faq.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedFaq) {
        await api.put(`/faqs/${selectedFaq._id}`, formData);
        toast.success('FAQ updated successfully.');
      } else {
        await api.post('/faqs', formData);
        toast.success('FAQ created successfully.');
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaq) return;
    setModalLoading(true);
    try {
      await api.delete(`/faqs/${selectedFaq._id}`);
      toast.success('FAQ removed.');
      setIsDeleteOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Question',
      cell: (row) => (
        <div className="max-w-md">
          <p className="font-bold text-white font-display text-sm">{row.question}</p>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{row.answer}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => <Badge variant="primary" size="sm">{row.category}</Badge>,
    },
    {
      header: 'Order',
      accessor: 'order',
      cell: (row) => <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold text-slate-300">#{row.order}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'} size="sm">
          {row.isPublished ? 'Published' : 'Draft'}
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
              setSelectedFaq(row);
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

  const categoryFilters = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-md custom-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => setSelectedCategory(cat)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? 'bg-[#FF6A21] text-white shadow-md shadow-[#FF6A21]/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-[#1E2D4A]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Frequently Asked Questions (FAQ)</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage client questions, development methodologies, pricing structures, and SLA answers.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={faqs}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search FAQs by question or answer..."
          filters={categoryFilters}
          emptyTitle="No FAQs Found"
          emptyMessage="Click Add Question to create your first FAQ entry."
        />

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedFaq ? 'Edit FAQ' : 'Add FAQ Entry'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Question Text *
              </label>
              <input
                type="text"
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g. What services does Orqiva Tech offer?"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#111C2E] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Comprehensive Answer *
              </label>
              <textarea
                rows={4}
                required
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Detailed answer for clients..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
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
                <span>{selectedFaq ? 'Update FAQ' : 'Create FAQ'}</span>
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
          title="Delete FAQ"
          message={`Are you sure you want to remove "${selectedFaq?.question}"?`}
        />
      </div>
  );
}
