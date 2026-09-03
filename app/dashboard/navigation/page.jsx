'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Compass, ExternalLink } from 'lucide-react';

export default function NavigationManagerPage() {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    url: '/',
    order: 0,
    isExternal: false,
    isPublished: true,
  });

  const fetchNavigation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/navigation');
      if (res.success) {
        setNavItems(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load navigation items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      label: '',
      url: '/',
      order: navItems.length + 1,
      isExternal: false,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      label: item.label || '',
      url: item.url || '/',
      order: item.order || 0,
      isExternal: item.isExternal || false,
      isPublished: item.isPublished !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedItem) {
        await api.put(`/navigation/${selectedItem._id}`, formData);
        toast.success('Navigation item updated.');
      } else {
        await api.post('/navigation', formData);
        toast.success('Navigation item created.');
      }
      setIsModalOpen(false);
      fetchNavigation();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setModalLoading(true);
    try {
      await api.delete(`/navigation/${selectedItem._id}`);
      toast.success('Navigation item removed.');
      setIsDeleteOpen(false);
      fetchNavigation();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Menu Label',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-white font-display text-sm">{row.label}</span>
          {row.isExternal && <ExternalLink size={12} className="text-slate-400" />}
        </div>
      ),
    },
    {
      header: 'URL Destination',
      accessor: 'url',
      cell: (row) => <span className="text-xs font-mono text-[#FF8336]">{row.url}</span>,
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
          {row.isPublished ? 'Active' : 'Hidden'}
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
              setSelectedItem(row);
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
            <h1 className="text-2xl font-black text-white font-display">Navigation Menu Links</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure header navigation routes, order indices, and external destination URLs.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Menu Link</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={navItems}
          loading={loading}
          emptyTitle="No Navigation Items Found"
          emptyMessage="Click Add Menu Link to create website navigation routes."
        />

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem ? 'Edit Menu Link' : 'Add Menu Link'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Menu Label *
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Services or Portfolio"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Route URL *
              </label>
              <input
                type="text"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/services or /portfolio"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExternal}
                    onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>Opens External Tab</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>Published in Navbar</span>
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
                <span>{selectedItem ? 'Update Link' : 'Create Link'}</span>
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
          title="Delete Menu Link"
          message={`Are you sure you want to remove the navigation link "${selectedItem?.label}"?`}
        />
      </div>
  );
}
