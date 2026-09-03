'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Layers,
  Briefcase,
  Users2,
  MessageSquareQuote,
  BookOpen,
  Inbox,
  Mail,
  MailCheck,
  Building2,
  Cpu,
  ArrowRight,
  Sparkles,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  Globe,
  Settings,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const overview = stats?.overview || {};
  const homepageStats = stats?.homepageStats || [];
  const recentLeads = stats?.recentLeads || [];
  const recentEnquiries = stats?.recentEnquiries || [];

  const quickActions = [
    { label: 'Add Service', href: '/dashboard/services', icon: Layers, color: '#FF6A21' },
    { label: 'Add Technology', href: '/dashboard/technologies', icon: Cpu, color: '#10B981' },
    { label: 'Add Project', href: '/dashboard/projects', icon: Briefcase, color: '#3B82F6' },
    { label: 'Write Blog', href: '/dashboard/blog', icon: BookOpen, color: '#8B5CF6' },
    { label: 'Live Settings', href: '/dashboard/settings', icon: Settings, color: '#EC4899' },
    { label: 'Add FAQ', href: '/dashboard/faqs', icon: HelpCircle, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
        {/* Welcome Command Banner */}
        <div className="relative admin-card rounded-3xl p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-orange-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6A21] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} />
                <span>Enterprise CMS • Live System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                ORQIVA Tech Command Center
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Manage your services, client portfolios, technology stack, company settings, and inbound leads in real time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={fetchStats}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Refresh Metrics"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-[#FF6A21]' : ''} />
              </button>
              <a
                href={process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.orqivatech.com/'}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Globe size={14} className="text-[#FF6A21]" />
                <span>View Public Site</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>
              <Link
                href="/dashboard/services"
                className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Add Service</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Quick Action Shortcuts
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((qa, idx) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={idx}
                  href={qa.href}
                  className="admin-card admin-card-hover rounded-2xl p-3.5 flex items-center gap-3 group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${qa.color}15`, color: qa.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {qa.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 8 Primary KPI Metric Cards */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Live Website Modules &amp; Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Services"
              value={overview.totalServices || 0}
              icon={Layers}
              color="#FF6A21"
              trend={12}
              trendLabel="this month"
              description="Click to manage services catalog"
              href="/dashboard/services"
            />
            <StatCard
              title="Portfolio Projects"
              value={overview.totalProjects || 0}
              icon={Briefcase}
              color="#3B82F6"
              trend={8}
              trendLabel="active"
              description="Click to manage case studies"
              href="/dashboard/projects"
            />
            <StatCard
              title="Industries Served"
              value={overview.totalIndustries || 0}
              icon={Building2}
              color="#8B5CF6"
              description="Click to manage domains & solutions"
              href="/dashboard/industries"
            />
            <StatCard
              title="Technology Stack"
              value={overview.totalTechnologies || 0}
              icon={Cpu}
              color="#10B981"
              description="Click to manage stacks & tools"
              href="/dashboard/technologies"
            />
            <StatCard
              title="Client Testimonials"
              value={overview.totalTestimonials || 0}
              icon={MessageSquareQuote}
              color="#F59E0B"
              description="Click to manage verified reviews"
              href="/dashboard/testimonials"
            />
            <StatCard
              title="Published Blogs"
              value={overview.totalBlogPosts || 0}
              icon={BookOpen}
              color="#06B6D4"
              description="Click to manage articles & insights"
              href="/dashboard/blog"
            />
            <StatCard
              title="Commercial Leads"
              value={overview.totalLeads || 0}
              icon={Inbox}
              color="#F43F5E"
              trend={overview.newLeads ? 100 : 0}
              trendLabel="inbound"
              description={`${overview.newLeads || 0} new quote/demo inquiries`}
              href="/dashboard/leads"
            />
            <StatCard
              title="Contact Messages"
              value={overview.totalContactEnquiries || 0}
              icon={Mail}
              color="#10B981"
              description={`${overview.unreadContactEnquiries || 0} unread customer messages`}
              href="/dashboard/contact"
            />
          </div>
        </div>

        {/* Homepage Live Statistics Display Section */}
        <div className="admin-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Live Website Statistics Counters</h3>
              <p className="text-xs text-slate-400 mt-0.5">Showcased dynamically across Homepage &amp; About page</p>
            </div>
            <Link
              href="/dashboard/statistics"
              className="text-xs font-bold text-[#FF6A21] hover:text-[#FF8336] flex items-center gap-1"
            >
              <span>Manage Counters</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {homepageStats.map((st) => (
              <Link
                key={st._id}
                href="/dashboard/statistics"
                className="bg-[#0B111D] border border-slate-800 rounded-2xl p-4 text-center hover:border-orange-500/40 hover:bg-[#0E1626] transition block group"
              >
                <div className="text-2xl font-black text-white font-display tracking-tight text-[#FF6A21] group-hover:scale-105 transition-transform">
                  {st.value}
                  {st.suffix}
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1 truncate group-hover:text-slate-200">
                  {st.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Recent Leads & Recent Contact Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads Feed */}
          <div className="admin-card rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Inbox size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Quote &amp; Demo Leads</h3>
                  <p className="text-[11px] text-slate-400">Inbound business opportunities</p>
                </div>
              </div>
              <Link
                href="/dashboard/leads"
                className="text-xs font-bold text-[#FF6A21] hover:text-[#FF8336] flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5 flex-1">
              {recentLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No leads received yet.</div>
              ) : (
                recentLeads.map((lead) => (
                  <Link
                    key={lead._id}
                    href="/dashboard/leads"
                    className="p-3.5 rounded-2xl bg-[#0B111D] border border-slate-800 hover:border-orange-500/40 hover:bg-[#0E1626] transition flex items-center justify-between gap-3 block group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white group-hover:text-[#FF6A21] transition-colors truncate">
                          {lead.name}
                        </p>
                        <Badge
                          variant={
                            lead.status === 'New'
                              ? 'danger'
                              : lead.status === 'Converted'
                              ? 'success'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {lead.service || lead.company || lead.email} • {lead.source || 'Website'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Contact Enquiries Feed */}
          <div className="admin-card rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Contact Us Messages</h3>
                  <p className="text-[11px] text-slate-400">Direct inquiries from website contact form</p>
                </div>
              </div>
              <Link
                href="/dashboard/contact"
                className="text-xs font-bold text-[#FF6A21] hover:text-[#FF8336] flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5 flex-1">
              {recentEnquiries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No contact inquiries yet.</div>
              ) : (
                recentEnquiries.map((enq) => (
                  <Link
                    key={enq._id}
                    href="/dashboard/contact"
                    className="p-3.5 rounded-2xl bg-[#0B111D] border border-slate-800 hover:border-emerald-500/40 hover:bg-[#0E1626] transition flex items-center justify-between gap-3 block group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {enq.name}
                        </p>
                        <Badge
                          variant={enq.status === 'New' || enq.status === 'Unread' ? 'danger' : 'success'}
                          size="sm"
                        >
                          {enq.status || 'New'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {enq.message || enq.subject || enq.email}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
