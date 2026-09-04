'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, BriefcaseBusiness, Users, Mail, Phone, ExternalLink, FileText } from 'lucide-react';

export default function CareersManagerPage() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote / Jaipur',
    employmentType: 'Full-time',
    experience: '2–4 Years',
    salary: '₹8,00,000 – ₹14,00,000 / annum',
    description: '',
    requirements: ['React, Next.js, Node.js', 'State management', 'REST APIs'],
    responsibilities: ['Architect scalable components', 'Code reviews', 'Sprint delivery'],
    applicationEmail: 'careers@orqivatech.com',
    isPublished: true,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/careers/jobs?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/careers/applications');
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    } else {
      fetchApplications();
    }
  }, [activeTab, search, fetchJobs, fetchApplications]);

  const handleOpenCreate = () => {
    setSelectedJob(null);
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote / Jaipur / Mumbai',
      employmentType: 'Full-time',
      experience: '2–4 Years',
      salary: 'Competitive',
      description: '',
      requirements: ['Proven technical experience', 'Clean coding standards'],
      responsibilities: ['Deliver features on schedule', 'Work with agile team'],
      applicationEmail: 'careers@orqivatech.com',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || 'Remote',
      employmentType: job.employmentType || 'Full-time',
      experience: job.experience || '',
      salary: job.salary || '',
      description: job.description || '',
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      applicationEmail: job.applicationEmail || 'careers@orqivatech.com',
      isPublished: job.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedJob) {
        await api.put(`/careers/jobs/${selectedJob._id}`, formData);
        toast.success('Job vacancy updated successfully.');
      } else {
        await api.post('/careers/jobs', formData);
        toast.success('Job vacancy created successfully.');
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setModalLoading(true);
    try {
      await api.delete(`/careers/jobs/${selectedJob._id}`);
      toast.success('Job vacancy deleted.');
      setIsDeleteOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await api.put(`/careers/applications/${appId}/status`, { status });
      toast.success(`Application marked as ${status}.`);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const jobColumns = [
    {
      header: 'Job Title',
      cell: (row) => (
        <div>
          <p className="font-bold text-white font-display text-sm">{row.title}</p>
          <p className="text-xs text-slate-400">{row.department} • {row.experience}</p>
        </div>
      ),
    },
    {
      header: 'Location / Type',
      cell: (row) => (
        <div>
          <p className="text-xs text-slate-200 font-medium">{row.location}</p>
          <Badge variant="info" size="sm" className="mt-1">{row.employmentType}</Badge>
        </div>
      ),
    },
    {
      header: 'Salary Package',
      accessor: 'salary',
      cell: (row) => <span className="text-xs text-emerald-400 font-semibold">{row.salary || 'Competitive'}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'} size="sm">
          {row.isPublished ? 'Active Opening' : 'Draft / Closed'}
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
              setSelectedJob(row);
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

  const [selectedApp, setSelectedApp] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isDeleteAppOpen, setIsDeleteAppOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const handleOpenAppDetails = (app) => {
    setSelectedApp(app);
    setIsAppModalOpen(true);
  };

  const handleOpenDeleteApp = (app) => {
    setAppToDelete(app);
    setIsDeleteAppOpen(true);
  };

  const handleDeleteAppConfirm = async () => {
    if (!appToDelete) return;
    setModalLoading(true);
    try {
      await api.delete(`/careers/applications/${appToDelete._id}`);
      toast.success('Application deleted successfully.');
      setIsDeleteAppOpen(false);
      if (isAppModalOpen && selectedApp?._id === appToDelete._id) {
        setIsAppModalOpen(false);
      }
      setAppToDelete(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete application.');
    } finally {
      setModalLoading(false);
    }
  };

  const resolveFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.orqivatech.com/api/v1';
    const serverOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${serverOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const appColumns = [
    {
      header: 'Candidate',
      cell: (row) => (
        <div>
          <button
            type="button"
            onClick={() => handleOpenAppDetails(row)}
            className="font-bold text-white font-display text-sm hover:text-[#FF8336] transition text-left"
          >
            {row.candidateName}
          </button>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1"><Mail size={11} /> {row.email}</span>
            {row.phone && <span className="flex items-center gap-1"><Phone size={11} /> {row.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Position Applied',
      cell: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-200">
            {row.jobId?.title || row.jobTitle || 'Open Application'}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {row.experience ? `Exp: ${row.experience}` : ''}
            {row.noticePeriod ? ` • ${row.noticePeriod}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Compensation (CTC)',
      cell: (row) => (
        <div className="text-xs">
          {row.expectedCtc || row.currentCtc ? (
            <>
              {row.currentCtc && <p className="text-slate-400">Curr: <span className="text-slate-200 font-medium">{row.currentCtc}</span></p>}
              {row.expectedCtc && <p className="text-emerald-400 font-semibold">Exp: {row.expectedCtc}</p>}
            </>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Resume / Links',
      cell: (row) => (
        <div>
          {row.coverLetter && <p className="text-xs text-slate-300 italic line-clamp-1 max-w-xs mb-1">&ldquo;{row.coverLetter}&rdquo;</p>}
          <div className="flex items-center gap-3">
            {row.resumeUrl ? (
              <a
                href={resolveFileUrl(row.resumeUrl)}
                target="_blank"
                rel="noreferrer"
                download={row.resumeUrl.startsWith('data:') ? `${row.candidateName.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
                className="text-xs text-[#FF8336] bg-[#FF6A21]/10 border border-[#FF6A21]/30 hover:bg-[#FF6A21]/20 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition"
              >
                <FileText size={12} />
                <span>Download / View Resume</span>
                <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-xs text-slate-500 italic">No Resume</span>
            )}
            {row.portfolioUrl && (
              <a
                href={resolveFileUrl(row.portfolioUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Portfolio</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Review Stage',
      cell: (row) => (
        <select
          value={row.status || 'Applied'}
          onChange={(e) => handleUpdateAppStatus(row._id, e.target.value)}
          className="glass-input rounded-xl px-2.5 py-1 text-xs font-semibold text-white focus:outline-none"
        >
          <option value="Applied" className="bg-[#111C2E]">Applied</option>
          <option value="Reviewing" className="bg-[#111C2E]">Reviewing</option>
          <option value="Shortlisted" className="bg-[#111C2E]">Shortlisted</option>
          <option value="Interviewed" className="bg-[#111C2E]">Interviewed</option>
          <option value="Hired" className="bg-[#111C2E]">Hired</option>
          <option value="Rejected" className="bg-[#111C2E]">Rejected</option>
        </select>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenAppDetails(row)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            View Profile
          </button>
          <button
            type="button"
            onClick={() => handleOpenDeleteApp(row)}
            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition"
            title="Delete Application"
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
            <h1 className="text-2xl font-black text-white font-display">Careers &amp; Talent Acquisition</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage published job vacancies and track applicant review pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Tab Switcher */}
            <div className="p-1 bg-[#111C2E] border border-[#1E2D4A] rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'jobs'
                    ? 'bg-[#FF6A21] text-white shadow-md shadow-[#FF6A21]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BriefcaseBusiness size={14} />
                <span>Job Openings ({jobs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'applications'
                    ? 'bg-[#FF6A21] text-white shadow-md shadow-[#FF6A21]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Applications ({applications.length})</span>
              </button>
            </div>

            {activeTab === 'jobs' && (
              <button
                onClick={handleOpenCreate}
                className="btn-brand px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Post Job</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'jobs' ? (
          <DataTable
            columns={jobColumns}
            data={jobs}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search jobs by title, department, location..."
            emptyTitle="No Job Openings Found"
            emptyMessage="Click Post Job to create your first career opportunity."
          />
        ) : (
          <DataTable
            columns={appColumns}
            data={applications}
            loading={loading}
            emptyTitle="No Applications Yet"
            emptyMessage="Incoming candidate applications from the Careers page will appear here."
          />
        )}

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedJob ? 'Edit Job Opening' : 'Post New Job Vacancy'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior React Developer"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering or Mobile"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Remote / Jaipur"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="Full-time" className="bg-[#111C2E] text-white">Full-time</option>
                  <option value="Part-time" className="bg-[#111C2E] text-white">Part-time</option>
                  <option value="Contract" className="bg-[#111C2E] text-white">Contract</option>
                  <option value="Internship" className="bg-[#111C2E] text-white">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Experience Required
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 2–4 Years"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Salary / Compensation
                </label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. ₹10,00,000 – ₹16,00,000 / annum"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Application Email
                </label>
                <input
                  type="email"
                  value={formData.applicationEmail}
                  onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
                  placeholder="careers@orqivatech.com"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Job Overview &amp; Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Role summary and impact..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Active &amp; Accepting Applications</span>
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
                <span>{selectedJob ? 'Update Vacancy' : 'Post Opening'}</span>
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
          title="Delete Job Opening"
          message={`Are you sure you want to delete "${selectedJob?.title}"?`}
        />

        {/* Candidate Detail Modal */}
        <Modal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          title="Candidate Profile &amp; Application Details"
          size="lg"
        >
          {selectedApp && (
            <div className="space-y-5">
              {/* Header Profile Summary */}
              <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E2D4A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white font-display">{selectedApp.candidateName}</h3>
                  <p className="text-xs text-[#FF8336] font-semibold mt-0.5">
                    Position Applied: {selectedApp.jobId?.title || selectedApp.jobTitle || 'General Application'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Applied on: {new Date(selectedApp.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Stage:</span>
                  <select
                    value={selectedApp.status || 'Applied'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleUpdateAppStatus(selectedApp._id, newStatus);
                      setSelectedApp({ ...selectedApp, status: newStatus });
                    }}
                    className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Applied" className="bg-[#111C2E]">Applied</option>
                    <option value="Reviewing" className="bg-[#111C2E]">Reviewing</option>
                    <option value="Shortlisted" className="bg-[#111C2E]">Shortlisted</option>
                    <option value="Interviewed" className="bg-[#111C2E]">Interviewed</option>
                    <option value="Hired" className="bg-[#111C2E]">Hired</option>
                    <option value="Rejected" className="bg-[#111C2E]">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Contact & Professional Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <a href={`mailto:${selectedApp.email}`} className="text-sm font-semibold text-white hover:text-[#FF8336] transition mt-1 block">
                    {selectedApp.email}
                  </a>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedApp.phone || 'Not provided'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedApp.experience || 'Not specified'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notice Period</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedApp.noticePeriod || 'Immediate / Not specified'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current CTC</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    {selectedApp.currentCtc || 'Not disclosed'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected CTC</p>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                    {selectedApp.expectedCtc || 'Negotiable'}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {selectedApp.resumeUrl ? (
                  <a
                    href={resolveFileUrl(selectedApp.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-[#FF6A21]/10 border border-[#FF6A21]/30 hover:bg-[#FF6A21]/20 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#FF8336]">Candidate Resume / CV</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{selectedApp.resumeUrl}</p>
                    </div>
                    <ExternalLink size={16} className="text-[#FF8336] group-hover:translate-x-0.5 transition" />
                  </a>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A] text-slate-500 text-xs flex items-center justify-center">
                    No Resume URL Attached
                  </div>
                )}

                {selectedApp.portfolioUrl ? (
                  <a
                    href={resolveFileUrl(selectedApp.portfolioUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-cyan-400">Portfolio / LinkedIn</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{selectedApp.portfolioUrl}</p>
                    </div>
                    <ExternalLink size={16} className="text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </a>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#111C2E] border border-[#1E2D4A] text-slate-500 text-xs flex items-center justify-center">
                    No Portfolio / LinkedIn Provided
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1E2D4A]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Candidate Cover Note</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#1E2D4A]">
                <button
                  type="button"
                  onClick={() => handleOpenDeleteApp(selectedApp)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Application Confirm Dialog */}
        <ConfirmDialog
          isOpen={isDeleteAppOpen}
          onClose={() => setIsDeleteAppOpen(false)}
          onConfirm={handleDeleteAppConfirm}
          loading={modalLoading}
          title="Delete Candidate Application"
          message={`Are you sure you want to delete the application submitted by "${appToDelete?.candidateName}"? This action cannot be undone.`}
        />
      </div>
  );
}
