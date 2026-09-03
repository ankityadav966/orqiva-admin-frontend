'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MailCheck, Download, Trash2, Mail } from 'lucide-react';

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedSub, setSelectedSub] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscribers = useCallback(async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/newsletter?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setSubscribers(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      fetchSubscribers(1, '');
      return;
    }
    const timer = setTimeout(() => {
      fetchSubscribers(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchSubscribers]);

  const handleDelete = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      await api.delete(`/newsletter/${selectedSub._id}`);
      toast.success('Subscriber removed.');
      setIsDeleteOpen(false);
      fetchSubscribers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.get('/newsletter/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Subscribers CSV exported.');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const columns = [
    {
      header: 'Subscriber Email',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 flex-shrink-0">
            <MailCheck size={16} />
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'Subscribed' ? 'success' : 'default'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Subscribed Date',
      accessor: 'subscribedAt',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.subscribedAt || row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              setSelectedSub(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition"
            title="Remove subscriber"
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
            <h1 className="text-2xl font-black text-white font-display">Newsletter Subscribers</h1>
            <p className="text-xs text-slate-400 mt-1">
              List of email newsletter audience members captured from the public website footer.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-[#1E2D4A] flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Download size={14} />
            <span>Export Subscribers CSV</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={subscribers}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search subscribers by email address..."
          pagination={pagination}
          onPageChange={(p) => fetchSubscribers(p)}
          emptyTitle="No Newsletter Subscribers"
          emptyMessage="Subscribed audience members from the website footer will be listed here."
        />

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={actionLoading}
          title="Remove Subscriber"
          message={`Are you sure you want to remove "${selectedSub?.email}" from the newsletter list?`}
        />
      </div>
  );
}
