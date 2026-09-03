'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Inbox,
  Download,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  MessageSquare,
  Trash2,
  Eye,
  Plus,
  Loader2,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

// ─── Auto-Generate Proposal Email based on Source CTA ──────────────────────
function generateProposalEmail(lead) {
  const name = lead.name || 'Valued Client';
  const service = lead.service || 'your project';
  const company = lead.company ? ` at ${lead.company}` : '';
  const budget = lead.budget ? `\n\nRegarding your mentioned budget of ${lead.budget}, we are confident we can deliver exceptional value within your investment.` : '';
  const from = 'Team ORQIVA Tech';
  const fromEmail = 'contact@orqivatech.com';

  let subject = '';
  let body = '';

  switch (lead.source) {
    case 'Quote':
      subject = `Custom Quote for ${service} — ORQIVA Tech`;
      body = `Dear ${name},\n\nThank you for reaching out to ORQIVA Tech${company} and requesting a quote for ${service}.\n\nWe have reviewed your requirements and are excited to present a tailored proposal for your project. Our team specializes in delivering high-quality ${service} solutions that are scalable, secure, and built to grow with your business.${budget}\n\nHere's what we propose:\n• Discovery & Requirement Analysis — Understanding your exact needs\n• Custom Solution Design — Tailored architecture for your use case\n• Agile Development & Delivery — Milestone-based transparent delivery\n• Post-Launch Support — Dedicated support after go-live\n\nCould we schedule a 30-minute call this week to walk you through the detailed proposal and answer any questions?\n\nLooking forward to partnering with you.\n\nWarm regards,\n${from}\n${fromEmail}\nhttps://www.orqivatech.com`;
      break;

    case 'Demo':
      subject = `Your ORQIVA Tech Demo is Ready — Let's Connect`;
      body = `Dear ${name},\n\nThank you for your interest in a product demo${company ? ` for ${company}` : ''}! We're thrilled to show you what ORQIVA Tech can do for ${service}.\n\nOur demo will cover:\n• Live walkthrough of the solution tailored to your needs\n• Key features relevant to ${service}\n• Q&A session with our technical team\n• Roadmap & pricing discussion${budget}\n\nPlease let us know your preferred time slot and we'll get it confirmed immediately.\n\nAvailable slots this week:\n• Morning: 10:00 AM – 12:00 PM\n• Afternoon: 2:00 PM – 5:00 PM\n\nJust reply to this email or call us directly to book your demo.\n\nExcited to meet you!\n\nBest regards,\n${from}\n${fromEmail}\nhttps://www.orqivatech.com`;
      break;

    case 'Consultation':
      subject = `Free Consultation Booked — ORQIVA Tech`;
      body = `Dear ${name},\n\nThank you for requesting a consultation with ORQIVA Tech${company}. We're delighted to connect with you regarding ${service}.\n\nDuring our consultation, we will:\n• Understand your business goals and technical challenges\n• Explore the best technology approach for ${service}\n• Provide expert recommendations and a clear action plan\n• Answer all your questions with complete transparency${budget}\n\nThis is a completely free, no-obligation session designed to give you clear direction on your project.\n\nWhen would you be available for a 45-minute consultation call? Please suggest 2–3 convenient time slots and we'll confirm promptly.\n\nLooking forward to speaking with you.\n\nKind regards,\n${from}\n${fromEmail}\nhttps://www.orqivatech.com`;
      break;

    case 'Contact Form':
      subject = `Re: Your Inquiry — ORQIVA Tech`;
      body = `Dear ${name},\n\nThank you for getting in touch with ORQIVA Tech${company}. We've received your inquiry regarding ${service} and our team has carefully reviewed your requirements.\n\nWe'd love to understand your needs better and explore how we can help. ORQIVA Tech has successfully delivered 200+ projects across healthcare, fintech, e-commerce, and enterprise domains.${budget}\n\nWould you be available for a quick 20-minute introductory call this week? We'd like to:\n• Understand your exact requirements\n• Share relevant case studies\n• Provide an initial project scope and timeline\n\nPlease reply to this email with your preferred time or call us directly.\n\nLooking forward to your response.\n\nBest regards,\n${from}\n${fromEmail}\nhttps://www.orqivatech.com`;
      break;

    default:
      subject = `ORQIVA Tech — Project Proposal for ${service}`;
      body = `Dear ${name},\n\nThank you for your interest in ORQIVA Tech${company}. We are excited to explore how we can support your vision for ${service}.\n\nORQIVA Tech is a full-stack technology company specializing in custom software, mobile apps, enterprise platforms, and digital transformation solutions. We work with startups, SMEs, and large enterprises to build products that scale.${budget}\n\nWe'd love to schedule a discovery call to:\n• Understand your project requirements in detail\n• Share our expertise and relevant portfolio\n• Provide a transparent proposal with timeline and investment\n\nAre you available for a 30-minute call this week? Just reply with a preferred time and we'll make it happen.\n\nLooking forward to connecting!\n\nWarm regards,\n${from}\n${fromEmail}\nhttps://www.orqivatech.com`;
  }

  return {
    subject,
    body,
    mailto: `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

export default function LeadsCRMPage() {

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const sources = ['All', 'Quote', 'Demo', 'Consultation', 'Contact Form', 'Other'];
  const statuses = ['All', 'New', 'Contacted', 'In Progress', 'Converted', 'Closed'];

  const fetchLeads = useCallback(async (page = 1, searchQuery = search, src = selectedSource, st = selectedStatus) => {
    setLoading(true);
    try {
      const srcParam = src !== 'All' ? `&source=${encodeURIComponent(src)}` : '';
      const stParam = st !== 'All' ? `&status=${encodeURIComponent(st)}` : '';
      const res = await api.get(`/leads?page=${page}&limit=15&search=${encodeURIComponent(searchQuery)}${srcParam}${stParam}`);
      if (res.success) {
        setLeads(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedSource, selectedStatus]);

  useEffect(() => {
    if (!search) {
      fetchLeads(1, '', selectedSource, selectedStatus);
      return;
    }
    const timer = setTimeout(() => {
      fetchLeads(1, search, selectedSource, selectedStatus);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedSource, selectedStatus, fetchLeads]);

  const handleUpdateStatus = async (leadId, status) => {
    try {
      const res = await api.put(`/leads/${leadId}/status`, { status });
      if (res.success) {
        toast.success(`Lead marked as ${status}`);
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(res.data);
        }
        fetchLeads(pagination.page);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedLead) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/leads/${selectedLead._id}/notes`, { content: noteContent });
      if (res.success) {
        toast.success('Internal note added.');
        setSelectedLead(res.data);
        setNoteContent('');
        fetchLeads(pagination.page);
      }
    } catch (err) {
      toast.error('Failed to add note.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      await api.delete(`/leads/${selectedLead._id}`);
      toast.success('Lead deleted.');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      fetchLeads(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const srcParam = selectedSource !== 'All' ? `?source=${encodeURIComponent(selectedSource)}` : '';
      const stParam = selectedStatus !== 'All' ? `${srcParam ? '&' : '?'}status=${encodeURIComponent(selectedStatus)}` : '';
      const blob = await api.get(`/leads/export/csv${srcParam}${stParam}`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orqiva_leads_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Leads CSV exported successfully.');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const columns = [
    {
      header: 'Customer Prospect',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-orange-400 flex-shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white font-display text-xs sm:text-sm truncate">{row.name}</p>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
              <a href={`mailto:${row.email}`} className="flex items-center gap-1 hover:text-[#FF6A21] transition-colors truncate">
                <Mail size={11} className="flex-shrink-0" />
                <span>{row.email}</span>
              </a>
              {row.phone && (
                <a href={`tel:${row.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Phone size={11} className="flex-shrink-0" />
                  <span>{row.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Company / Project',
      cell: (row) => (
        <div>
          <p className="text-xs text-slate-200 font-semibold">{row.company || 'Direct Client'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{row.service || 'General Consulting'}</p>
        </div>
      ),
    },
    {
      header: 'Source CTA',
      accessor: 'source',
      cell: (row) => (
        <Badge
          variant={row.source === 'Quote' ? 'primary' : row.source === 'Demo' ? 'info' : 'purple'}
          size="sm"
        >
          {row.source}
        </Badge>
      ),
    },
    {
      header: 'Budget Range',
      accessor: 'budget',
      cell: (row) => <span className="text-xs text-emerald-400 font-semibold">{row.budget || 'Not specified'}</span>,
    },
    {
      header: 'Pipeline Stage',
      cell: (row) => (
        <select
          value={row.status || 'New'}
          onChange={(e) => handleUpdateStatus(row._id, e.target.value)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition ${
            row.status === 'New'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : row.status === 'Converted'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          {statuses.filter((s) => s !== 'All').map((s) => (
            <option key={s} value={s} className="bg-[#0E1524] text-white">
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={generateProposalEmail(row).mailto}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 transition"
            title={`Send ${row.source || 'Proposal'} email to ${row.email}`}
          >
            <Mail size={13} />
          </a>
          <button
            onClick={() => {
              setSelectedLead(row);
              setIsDetailOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="View Lead CRM"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => {
              setSelectedLead(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
            title="Delete Lead"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },

  ];

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selectedSource}
        onChange={(e) => setSelectedSource(e.target.value)}
        className="admin-input rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300"
      >
        <option value="All" className="bg-[#0E1524]">All Sources</option>
        {sources.filter((s) => s !== 'All').map((s) => (
          <option key={s} value={s} className="bg-[#0E1524]">Source: {s}</option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="admin-input rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300"
      >
        <option value="All" className="bg-[#0E1524]">All Pipeline Stages</option>
        {statuses.filter((s) => s !== 'All').map((s) => (
          <option key={s} value={s} className="bg-[#0E1524]">Status: {s}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6A21] flex items-center justify-center">
                <Inbox size={16} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Leads &amp; Quote Inquiries
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage incoming commercial consultation requests, demo bookings, and project proposals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={leads}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search leads by name, email, company, service..."
          filters={filterBar}
          pagination={pagination}
          onPageChange={(p) => fetchLeads(p)}
          emptyTitle="No Leads Found"
          emptyMessage="No customer leads match your current search or pipeline filters."
        />

        {/* Lead CRM Detail & Timeline Modal */}
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Lead CRM: ${selectedLead?.name || 'Prospect'}`}
          subtitle={`Received on ${selectedLead ? new Date(selectedLead.createdAt).toLocaleString() : ''}`}
          icon={Inbox}
          size="lg"
        >
          {selectedLead && (
            <div className="space-y-6">
              {/* Prospect Key Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#090E18] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Email:</span>
                    <a href={`mailto:${selectedLead.email}`} className="text-[#FF6A21] hover:underline font-bold">
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Phone:</span>
                      <span className="text-slate-200 font-mono">{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Company:</span>
                      <span className="text-slate-200 font-bold">{selectedLead.company}</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#090E18] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Source CTA:</span>
                    <Badge variant="primary" size="sm">{selectedLead.source}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Service:</span>
                    <span className="text-slate-200">{selectedLead.service || 'General Consulting'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Budget:</span>
                    <span className="text-emerald-400 font-bold">{selectedLead.budget || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Message / Project Scope */}
              {selectedLead.message && (
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Project Requirements / Notes
                  </span>
                  <div className="p-4 rounded-2xl bg-[#090E18] border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              {/* Status Update & Internal Notes */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pipeline Stage:
                    </span>
                    <select
                      value={selectedLead.status || 'New'}
                      onChange={(e) => handleUpdateStatus(selectedLead._id, e.target.value)}
                      className="admin-input rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      {statuses.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s} className="bg-[#0E1524]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <a
                    href={generateProposalEmail(selectedLead).mailto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    title={`Send ${selectedLead.source || 'Proposal'} email to ${selectedLead.email}`}
                  >
                    <Mail size={13} />
                    <span>Send Proposal Email</span>
                  </a>

                </div>

                {/* Internal CRM Notes Section */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Internal Sales Notes ({selectedLead.notes?.length || 0})
                  </span>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal note or call summary..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="flex-1 admin-input rounded-xl px-3.5 py-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !noteContent.trim()}
                      className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                    >
                      Add Note
                    </button>
                  </form>

                  {selectedLead.notes && selectedLead.notes.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedLead.notes.map((n, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#090E18] border border-slate-800 text-xs">
                          <p className="text-slate-200">{n.content}</p>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
          title="Delete Lead"
          message={`Are you sure you want to remove the lead record for "${selectedLead?.name}"?`}
          confirmText="Yes, Delete"
          variant="danger"
        />
      </div>
  );
}

