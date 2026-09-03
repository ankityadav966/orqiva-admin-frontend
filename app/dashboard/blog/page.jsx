'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, BookOpen, Tag, Calendar, X } from 'lucide-react';

export default function BlogManagerPage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const categories = ['All', 'AI & Technology', 'DevOps', 'Mobile Development', 'Fintech & Compliance', 'Business Strategy', 'Cybersecurity'];

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: 'AI & Technology',
    tags: [],
    author: 'ORQIVA Tech Team',
    readingTime: '8 min',
    status: 'Published',
  });

  const [tagInput, setTechInput] = useState('');

  const fetchPosts = useCallback(async (page = 1, searchQuery = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const res = await api.get(`/blog?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}${catParam}`);
      if (res.success) {
        setPosts(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    if (!search) {
      fetchPosts(1, '', selectedCategory);
      return;
    }
    const timer = setTimeout(() => {
      fetchPosts(1, search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, fetchPosts]);

  const handleOpenCreate = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=380&fit=crop&auto=format',
      category: selectedCategory !== 'All' ? selectedCategory : 'AI & Technology',
      tags: ['AI', 'Enterprise', 'Digital Transformation'],
      author: 'Aryan Verma',
      readingTime: '6 min',
      status: 'Published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      category: post.category || 'AI & Technology',
      tags: post.tags || [],
      author: post.author || '',
      readingTime: post.readingTime || '5 min',
      status: post.status || 'Published',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedPost) {
        await api.put(`/blog/${selectedPost._id}`, formData);
        toast.success('Blog post updated successfully.');
      } else {
        await api.post('/blog', formData);
        toast.success('Blog post published successfully.');
      }
      setIsModalOpen(false);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setModalLoading(true);
    try {
      await api.delete(`/blog/${selectedPost._id}`);
      toast.success('Blog post deleted.');
      setIsDeleteOpen(false);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTag = (idx) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  const columns = [
    {
      header: 'Article Title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-[#1E2D4A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.featuredImage || '/orqiva_tech_logo.jpg'} alt={row.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.title}</p>
            <p className="text-xs text-slate-400">By {row.author || 'Team'} • {row.readingTime}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => <Badge variant="primary" size="sm">{row.category}</Badge>,
    },
    {
      header: 'Tags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.tags || []).slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-[#1E2D4A]">
              #{t}
            </span>
          ))}
          {(row.tags || []).length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge
          variant={row.status === 'Published' ? 'success' : row.status === 'Draft' ? 'warning' : 'default'}
          size="sm"
        >
          {row.status}
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
              setSelectedPost(row);
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
            <h1 className="text-2xl font-black text-white font-display">Blog &amp; Knowledge Base CMS</h1>
            <p className="text-xs text-slate-400 mt-1">
              Publish technical articles, tutorials, engineering updates, and company thought leadership.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Create Article</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={posts}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search blog posts by title, excerpt, tag..."
          filters={categoryFilters}
          pagination={pagination}
          onPageChange={(p) => fetchPosts(p)}
          emptyTitle="No Blog Posts Found"
          emptyMessage="Click Create Article to publish your first blog post."
        />

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedPost ? 'Edit Blog Article' : 'Create New Article'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. How AI is Revolutionizing Enterprise ERP Systems in 2025"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Aryan Verma"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="Published" className="bg-[#111C2E] text-white">Published</option>
                  <option value="Draft" className="bg-[#111C2E] text-white">Draft</option>
                  <option value="Archived" className="bg-[#111C2E] text-white">Archived</option>
                </select>
              </div>
            </div>

            <ImageUpload
              label="Featured Header Image"
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Excerpt / Summary *
              </label>
              <textarea
                rows={2}
                required
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief introductory summary..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Article Body Content *
              </label>
              <textarea
                rows={6}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full article content (Markdown or formatted text)..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tags &amp; Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-[#1E2D4A] text-xs font-semibold"
                  >
                    <span>#{tag}</span>
                    <button type="button" onClick={() => removeTag(idx)} className="hover:text-rose-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AI, ERP, Startups..."
                  value={tagInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Add Tag
                </button>
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
                <span>{selectedPost ? 'Update Article' : 'Publish Article'}</span>
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
          title="Delete Blog Post"
          message={`Are you sure you want to remove "${selectedPost?.title}"?`}
        />
      </div>
  );
}
