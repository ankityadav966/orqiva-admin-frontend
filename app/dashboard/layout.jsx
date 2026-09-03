'use client';
 
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function DashboardLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
