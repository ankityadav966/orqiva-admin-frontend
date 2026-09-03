'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Phone, Trash2, Eye, MailOpen, User, Calendar, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = ['All', 'New', 'Read', 'Responded', 'Archived'];

  const fetchSubmissions = useCallback(async (page = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const statusParam = status !== 'All' ? `&status=${encodeURIComponent(status)}` : '';
      const res = await api.get(`/contact?page=${page}&limit=15&search=${encodeURIComponent(searchQuery)}${statusParam}`);
      if (res.success) {
        setSubmissions(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load contact submissions.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (!search) {
      fetchSubmissions(1, '', statusFilter);
      return;
    }
    const timer = setTimeout(() => {
      fetchSubmissions(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchSubmissions]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/contact/${id}/status`, { status });
      if (res.success) {
        toast.success(`Marked as ${status}`);
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission(res.data);
        }
        fetchSubmissions(pagination.page);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleOpenDetail = (sub) => {
    setSelectedSubmission(sub);
    setIsDetailOpen(true);
    if (sub.status === 'Unread' || sub.status === 'New') {
      handleUpdateStatus(sub._id, 'Read');
    }
  };

  const handleDelete = async () => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      await api.delete(`/contact/${selectedSubmission._id}`);
      toast.success('Inquiry deleted.');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Sender Information',
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
      header: 'Message Preview',
      cell: (row) => (
        <div className="max-w-xs sm:max-w-sm">
          <p className="text-xs text-slate-200 line-clamp-1 font-medium">{row.message || row.subject}</p>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.subject ? `Subject: ${row.subject}` : 'General Inquiry'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const isUnread = row.status === 'Unread' || row.status === 'New';
        return (
          <select
            value={row.status || 'New'}
            onChange={(e) => handleUpdateStatus(row._id, e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition ${
              isUnread
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : row.status === 'Responded'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <option value="New" className="bg-[#0E1524] text-white">New</option>
            <option value="Read" className="bg-[#0E1524] text-white">Read</option>
            <option value="Responded" className="bg-[#0E1524] text-white">Responded</option>
            <option value="Archived" className="bg-[#0E1524] text-white">Archived</option>
          </select>
        );
      },
    },
    {
      header: 'Received At',
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
          <button
            onClick={() => handleOpenDetail(row)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Read Message"
          >
            <Eye size={13} />
          </button>
          <a
            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.subject || 'ORQIVA Tech Inquiry')}`}
            className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-[#FF6A21] transition"
            title="Reply via Email"
          >
            <MailOpen size={13} />
          </a>
          <button
            onClick={() => {
              setSelectedSubmission(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
            title="Delete Inquiry"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const filterTabs = (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-md custom-scrollbar">
      {statusOptions.map((st) => (
        <button
          key={st}
          type="button"
          onClick={() => setStatusFilter(st)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === st
              ? 'bg-[#FF6A21] text-white shadow-sm font-bold'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          {st}
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
                <Mail size={16} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Contact Inquiries
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Customer submissions from the public website Contact Us form.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              {pagination.total} Inquiries Total
            </span>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={submissions}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by sender, email, message..."
          filters={filterTabs}
          pagination={pagination}
          onPageChange={(p) => fetchSubmissions(p)}
          emptyTitle="No Inquiries Found"
          emptyMessage="No customer messages match your current search or filter."
        />

        {/* Message Detail Modal */}
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Message from ${selectedSubmission?.name || 'Customer'}`}
          subtitle={`Received on ${selectedSubmission ? new Date(selectedSubmission.createdAt).toLocaleString() : ''}`}
          icon={Mail}
          size="md"
        >
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#090E18] border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">Email Address:</span>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-[#FF6A21] hover:underline font-bold">
                    {selectedSubmission.email}
                  </a>
                </div>
                {selectedSubmission.phone && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Phone:</span>
                    <span className="text-slate-200 font-mono">{selectedSubmission.phone}</span>
                  </div>
                )}
                {selectedSubmission.company && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Company:</span>
                    <span className="text-slate-200 font-bold">{selectedSubmission.company}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Message Content
                </span>
                <div className="p-4 rounded-2xl bg-[#090E18] border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Status:</span>
                  <select
                    value={selectedSubmission.status || 'New'}
                    onChange={(e) => handleUpdateStatus(selectedSubmission._id, e.target.value)}
                    className="admin-input rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="New" className="bg-[#0E1524]">New</option>
                    <option value="Read" className="bg-[#0E1524]">Read</option>
                    <option value="Responded" className="bg-[#0E1524]">Responded</option>
                    <option value="Archived" className="bg-[#0E1524]">Archived</option>
                  </select>
                </div>

                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(selectedSubmission.subject || 'ORQIVA Tech Inquiry')}`}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <MailOpen size={13} />
                  <span>Reply via Email</span>
                </a>
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
          title="Delete Inquiry"
          message={`Are you sure you want to remove the message from "${selectedSubmission?.name}"?`}
          confirmText="Yes, Delete"
          variant="danger"
        />
      </div>
  );
}
