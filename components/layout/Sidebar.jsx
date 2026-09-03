'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Rocket,
  Layers,
  Building2,
  Briefcase,
  Cpu,
  Users2,
  MessageSquareQuote,
  BookOpen,
  HelpCircle,
  BriefcaseBusiness,
  Compass,
  Inbox,
  Mail,
  MailCheck,
  Image as ImageIcon,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Website CMS',
      items: [
        { label: 'Hero Section', href: '/dashboard/homepage', icon: Sparkles },
        { label: 'Statistics', href: '/dashboard/statistics', icon: BarChart3 },
        { label: 'Currently Building', href: '/dashboard/featured-project', icon: Rocket },
        { label: 'Services', href: '/dashboard/services', icon: Layers },
        { label: 'Industries', href: '/dashboard/industries', icon: Building2 },
        { label: 'Portfolio / Projects', href: '/dashboard/projects', icon: Briefcase },
        { label: 'Technologies', href: '/dashboard/technologies', icon: Cpu },
        { label: 'Clients', href: '/dashboard/clients', icon: Users2 },
        { label: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquareQuote },
        { label: 'Blog Posts', href: '/dashboard/blog', icon: BookOpen },
        { label: 'FAQs', href: '/dashboard/faqs', icon: HelpCircle },
        { label: 'Careers & Jobs', href: '/dashboard/careers', icon: BriefcaseBusiness },
        { label: 'Navigation Menu', href: '/dashboard/navigation', icon: Compass },
      ],
    },
    {
      group: 'Commercial & Leads',
      items: [
        { label: 'Quote & Demo Leads', href: '/dashboard/leads', icon: Inbox },
        { label: 'Contact Inquiries', href: '/dashboard/contact', icon: Mail },
        { label: 'Newsletter Subscribers', href: '/dashboard/newsletter', icon: MailCheck },
      ],
    },
    {
      group: 'System & Assets',
      items: [
        { label: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
        { label: 'Website Settings', href: '/dashboard/settings', icon: Settings },
        { label: 'Admin Profile', href: '/dashboard/profile', icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 bg-[#0A0F1D] border-r border-slate-800/80 flex flex-col transition-all duration-300',
          isCollapsed ? 'w-[72px]' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#080C14]/90">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8336] via-[#FF5A1F] to-[#D9520D] flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-tight">O</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-white tracking-wider block font-display">
                  ORQIVA <span className="text-[#FF6A21]">TECH</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase block -mt-0.5">
                  CMS Control Center
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx}>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 select-none">
                  {grp.group}
                </p>
              )}
              <div className="space-y-0.5">
                {grp.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative',
                        isActive
                          ? 'bg-[#FF6A21]/12 text-white font-bold border border-[#FF6A21]/25 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#121A2C] border border-transparent'
                      )}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#FF6A21] rounded-r-full" />
                      )}

                      <Icon
                        size={17}
                        className={clsx(
                          'flex-shrink-0 transition-all duration-150',
                          isActive ? 'text-[#FF6A21]' : 'text-slate-400 group-hover:text-slate-200'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status & User Profile Footer */}
        <div className="p-3  border-slate-800/80 bg-[#080C14]/90 space-y-2">
          {/* Quick View Live Website Link */}


          {/* User Profile Bar */}
          {!isCollapsed && user && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#0E1524] border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-[#FF6A21]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face&q=80'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {/* Collapsed logout fallback */}
          {isCollapsed && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
