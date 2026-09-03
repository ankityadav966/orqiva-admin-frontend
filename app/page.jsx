'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF6A21] border-t-transparent animate-spin" />
    </div>
  );
}
