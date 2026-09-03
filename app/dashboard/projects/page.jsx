'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Briefcase, ExternalLink, X } from 'lucide-react';

export default function ProjectsManagerPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Web App',
    industry: 'Healthcare',
    client: '',
    image: '',
    shortDescription: '',
    description: '',
    results: '',
    projectUrl: '',
    technologies: [],
    isFeatured: true,
    isPublished: true,
    order: 0,
  });

  const [techInput, setTechInput] = useState('');

  const categories = ['All', 'Web App', 'ERP', 'E-Commerce', 'Mobile App', 'AI', 'CRM', 'Cloud / DevOps', 'Other'];

  const fetchProjects = useCallback(async (page = 1, searchQuery = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const res = await api.get(`/projects?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}${catParam}`);
      if (res.success) {
        setProjects(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load portfolio projects.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    if (!search) {
      fetchProjects(1, '', selectedCategory);
      return;
    }
    const timer = setTimeout(() => {
      fetchProjects(1, search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, fetchProjects]);

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Web App',
      industry: 'Healthcare',
      client: '',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=380&fit=crop&auto=format',
      shortDescription: '',
      description: '',
      results: '',
      projectUrl: '',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      isFeatured: true,
      isPublished: true,
      order: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      category: project.category || 'Web App',
      industry: project.industry || '',
      client: project.client || '',
      image: project.image || '',
      shortDescription: project.shortDescription || '',
      description: project.description || '',
      results: project.results || '',
      projectUrl: project.projectUrl || '',
      technologies: project.technologies || [],
      isFeatured: project.isFeatured !== false,
      isPublished: project.isPublished !== false,
      order: project.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject._id}`, formData);
        toast.success('Project updated successfully.');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created successfully.');
      }
      setIsModalOpen(false);
      fetchProjects(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setModalLoading(true);
    try {
      await api.delete(`/projects/${selectedProject._id}`);
      toast.success('Project deleted.');
      setIsDeleteOpen(false);
      fetchProjects(pagination.page);
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

  const columns = [
    {
      header: 'Project / Deliverable',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-[#1E2D4A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.image || '/orqiva_tech_logo.jpg'} alt={row.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.title}</p>
            <p className="text-xs text-slate-400 truncate max-w-xs">{row.client || row.industry}</p>
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
      header: 'Technologies',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.technologies || []).map((t, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-[#1E2D4A]">
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Results / Impact',
      accessor: 'results',
      cell: (row) => <span className="text-xs text-emerald-400 font-medium truncate max-w-xs block">{row.results || 'Delivered'}</span>,
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
              setSelectedProject(row);
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
            <h1 className="text-2xl font-black text-white font-display">Portfolio Projects &amp; Case Studies</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage client success stories, ERP software implementations, mobile apps, and e-commerce platforms.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects by name, client, tech..."
          filters={categoryFilters}
          pagination={pagination}
          onPageChange={(p) => fetchProjects(p)}
          emptyTitle="No Projects Found"
          emptyMessage="Click Add Project to publish a new portfolio item."
        />

        {/* Modal CRUD Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedProject ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. MediCare Pro ERP"
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
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Healthcare or Education"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <ImageUpload
              label="Featured Project Image"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Short Summary *
              </label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief high-level summary..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Detailed Scope / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive project scope and key modules delivered..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Results / Deliverable Metric
                </label>
                <input
                  type="text"
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="e.g. 40% cost reduction, 15,000+ active students"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Live Project URL
                </label>
                <input
                  type="text"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Technologies Used
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-[#1E2D4A] text-xs font-semibold"
                  >
                    <span>{t}</span>
                    <button type="button" onClick={() => removeTech(idx)} className="hover:text-rose-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, PostgreSQL, Docker..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Featured Showcase</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Published on Website</span>
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
                <span>{selectedProject ? 'Update Project' : 'Create Project'}</span>
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
          title="Delete Project"
          message={`Are you sure you want to delete "${selectedProject?.title}"?`}
        />
      </div>
  );
}
