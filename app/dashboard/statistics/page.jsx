'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, BarChart3, ArrowUpDown } from 'lucide-react';

export default function StatisticsManagerPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    value: 100,
    suffix: '+',
    order: 0,
    isActive: true,
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/statistics');
      if (res.success) {
        setStats(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenCreate = () => {
    setSelectedStat(null);
    setFormData({
      label: '',
      value: 100,
      suffix: '+',
      order: stats.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stat) => {
    setSelectedStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix || '+',
      order: stat.order || 0,
      isActive: stat.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedStat) {
        await api.put(`/statistics/${selectedStat._id}`, formData);
        toast.success('Statistic counter updated successfully.');
      } else {
        await api.post('/statistics', formData);
        toast.success('Statistic counter created successfully.');
      }
      setIsModalOpen(false);
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStat) return;
    setModalLoading(true);
    try {
      await api.delete(`/statistics/${selectedStat._id}`);
      toast.success('Statistic counter removed.');
      setIsDeleteOpen(false);
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Counter Value',
      cell: (row) => (
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black text-white font-display">{row.value}</span>
          <span className="text-base font-extrabold text-[#FF6A21]">{row.suffix}</span>
        </div>
      ),
    },
    {
      header: 'Label',
      accessor: 'label',
      cell: (row) => <span className="font-semibold text-slate-200">{row.label}</span>,
    },
    {
      header: 'Display Order',
      accessor: 'order',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 border border-[#1E2D4A]">
          #{row.order}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'} size="sm">
          {row.isActive ? 'Active on Public Site' : 'Hidden'}
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
              setSelectedStat(row);
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
            <h1 className="text-2xl font-black text-white font-display">Company Statistics &amp; Counters</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage the trust numbers displayed on the homepage (e.g. 100+ Clients, 500+ Projects, 99% Satisfaction).
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Statistic</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={stats}
          loading={loading}
          emptyTitle="No Statistics Found"
          emptyMessage="Click Add Statistic to configure your first counter."
        />

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedStat ? 'Edit Statistic Counter' : 'Create Statistic Counter'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Metric Label *
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Clients or Projects Delivered"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Numeric Value *
                </label>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value, 10) || 0 })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Suffix Symbol
                </label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="e.g. + or % or K"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Order Index
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A21]" />
                </label>
                <span className="text-xs font-semibold text-slate-300">Active / Visible</span>
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
                <span>{selectedStat ? 'Update Counter' : 'Create Counter'}</span>
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
          title="Delete Statistic"
          message={`Are you sure you want to remove the counter "${selectedStat?.label}" (${selectedStat?.value}${selectedStat?.suffix})?`}
        />
      </div>
  );
}
