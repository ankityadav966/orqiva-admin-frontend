'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Globe, ExternalLink, Sparkles, ChevronRight, User, Layers, Cpu, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Header = ({ onMobileMenuClick }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Generate breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);
  const formattedSegments = segments.map((seg) => {
    return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  });

  return (
    <header className="h-16 bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors flex-shrink-0"
          title="Open menu"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 overflow-hidden">
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors flex-shrink-0 font-medium text-slate-400"
          >
            CMS Dashboard
          </Link>

          {formattedSegments.length > 1 && (
            <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />
          )}

          {formattedSegments.slice(1).map((seg, idx, arr) => {
            const isLast = idx === arr.length - 1;
            return (
              <React.Fragment key={idx}>
                <span className={isLast ? 'text-white font-bold truncate max-w-[140px] sm:max-w-[200px]' : 'text-slate-400 hover:text-slate-200 transition'}>
                  {seg}
                </span>
                {!isLast && <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right section: Quick actions + System Status + User */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
        {/* Public Website Preview Link */}
        <a
          href={process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.orqivatech.com/'}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-orange-500/40"
        >
          <Globe size={13} className="text-[#FF6A21]" />
          {/* <span className="hidden sm:inline">View Public Website</span> */}
          <span className="sm:hidden">Website</span>
          <ExternalLink size={11} className="text-slate-400" />
        </a>

        {/* Live Backend Connection Status */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* User Profile Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-800/70 transition-colors border border-transparent hover:border-slate-800"
          title="Account Profile"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5A1F] to-[#D9520D] flex items-center justify-center text-white overflow-hidden shadow-sm flex-shrink-0">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={14} />
            )}
          </div>
          <span className="text-xs font-bold text-slate-200 hidden lg:inline max-w-[100px] truncate">
            {user?.name?.split(' ')[0] || 'Admin'}
          </span>
        </Link>
      </div>
    </header>
  );
};
