'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Loader2, Inbox, X } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  pagination = null,
  onPageChange,
  onLimitChange,
  actions = null,
  filters = null,
  emptyMessage = 'No records found matching your filters.',
  emptyTitle = 'No Records Found',
  emptyAction = null,
}) => {
  return (
    <div className="admin-card rounded-2xl overflow-hidden flex flex-col">
      {/* Top Filter and Action Bar */}
      {(onSearchChange || actions || filters) && (
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0B111D]/60">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {onSearchChange && (
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full admin-input rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm"
                />
                {search && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
            {filters}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/90 bg-[#090E18]/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 select-none ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown size={12} className="text-slate-500 cursor-pointer hover:text-slate-200 transition-colors" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 size={26} className="animate-spin text-[#FF6A21]" />
                    <span className="text-xs font-semibold text-slate-300">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto p-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 border border-slate-700/60">
                      <Inbox size={22} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">{emptyTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{emptyMessage}</p>
                    </div>
                    {emptyAction && <div className="mt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="hover:bg-[#131E33]/70 transition-colors group"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-3.5 text-slate-200 ${col.className || ''}`}>
                      {col.cell ? col.cell(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#0B111D]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-semibold">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong className="text-white font-semibold">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-white font-semibold">{pagination.total}</strong> results
          </div>

          <div className="flex items-center gap-2">
            {onLimitChange && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-slate-500 text-[11px]">Per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#FF6A21]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange && onPageChange(1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition"
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-3 py-1 font-semibold text-white bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
                {pagination.page} / {pagination.pages}
              </span>

              <button
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => onPageChange && onPageChange(pagination.pages)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition"
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
