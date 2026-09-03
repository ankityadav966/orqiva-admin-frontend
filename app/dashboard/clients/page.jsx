'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Users2, ExternalLink } from 'lucide-react';

export default function ClientsManagerPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    logo: '',
    website: '',
    description: '',
    isFeatured: true,
    isPublished: true,
    order: 0,
  });

  const fetchClients = useCallback(async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/clients?search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      fetchClients('');
      return;
    }
    const timer = setTimeout(() => {
      fetchClients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchClients]);

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setFormData({
      companyName: '',
      industry: 'Enterprise',
      logo: '',
      website: 'https://',
      description: '',
      isFeatured: true,
      isPublished: true,
      order: clients.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      companyName: client.companyName || '',
      industry: client.industry || '',
      logo: client.logo || '',
      website: client.website || '',
      description: client.description || '',
      isFeatured: client.isFeatured !== false,
      isPublished: client.isPublished !== false,
      order: client.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedClient) {
        await api.put(`/clients/${selectedClient._id}`, formData);
        toast.success('Client updated successfully.');
      } else {
        await api.post('/clients', formData);
        toast.success('Client added successfully.');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    setModalLoading(true);
    try {
      await api.delete(`/clients/${selectedClient._id}`);
      toast.success('Client deleted.');
      setIsDeleteOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Company Client',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-[#1E2D4A] flex items-center justify-center font-bold text-white text-xs overflow-hidden flex-shrink-0">
            {row.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.logo} alt={row.companyName} className="w-full h-full object-contain p-1" />
            ) : (
              row.companyName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-white font-display text-sm">{row.companyName}</p>
            <p className="text-xs text-slate-400">{row.industry || 'Enterprise'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Website Link',
      accessor: 'website',
      cell: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#FF8336] hover:underline flex items-center gap-1"
          >
            <span>{row.website.replace('https://', '')}</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        ),
    },
    {
      header: 'Featured',
      cell: (row) => (
        <Badge variant={row.isFeatured ? 'primary' : 'default'} size="sm">
          {row.isFeatured ? 'Featured Logo' : 'Standard'}
        </Badge>
      ),
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
              setSelectedClient(row);
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
            <h1 className="text-2xl font-black text-white font-display">Client Companies &amp; Partners</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage client brand logos, websites, and trust partners featured across the ORQIVA Tech website.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-brand px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Client</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search clients by name, industry..."
          emptyTitle="No Clients Found"
          emptyMessage="Click Add Client to create your first client company."
        />

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedClient ? 'Edit Client' : 'Add New Client'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. MediCare Group"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Healthcare"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://client.com"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <ImageUpload
              label="Company Logo (PNG/SVG recommended)"
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
            />

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6A21] bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>Featured Logo Bar</span>
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
                <span>{selectedClient ? 'Update Client' : 'Add Client'}</span>
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
          title="Delete Client"
          message={`Are you sure you want to remove "${selectedClient?.companyName}"?`}
        />
      </div>
  );
}
