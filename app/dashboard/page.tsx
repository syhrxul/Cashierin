'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      console.log('--- DASHBOARD REDIRECT CHECK ---');
      console.log('Token exists:', !!token);

      if (!token) {
        console.warn('Redirecting to login: MISSING TOKEN');
        router.replace('/login');
        return;
      }

      // Map roles to their specific sub-dashboard paths
      const roleMap: Record<string, string> = {
        'superadmin': '/dashboard/superadmin',
        'owner': '/dashboard/owner',
        'manager': '/dashboard/owner', // Manager maps to owner in directory structure if not separate
        'kasir': '/dashboard/kasir',
      };

      try {
        const user = await apiFetch('/user');
        localStorage.setItem('user', JSON.stringify(user));

        const role = user.role?.toLowerCase() || 'kasir';

        // 1. Superadmin Area
        if (role === 'superadmin') {
          router.replace('/dashboard/superadmin');
          return;
        }

        // 2. Owner Area
        if (role === 'owner') {
          router.replace('/dashboard/owner');
          return;
        }

        // 3. For ALL other roles (kasir, manager, or any custom role), go to KASIR dashboard
        router.replace('/dashboard/kasir');

      } catch (err) {
        console.error('Auth verification failed:', err);
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          const role = user.role?.toLowerCase() || 'kasir';
          if (role === 'superadmin') router.replace('/dashboard/superadmin');
          else if (role === 'owner') router.replace('/dashboard/owner');
          else router.replace('/dashboard/kasir');
        } else {
          router.replace('/login');
        }
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-[80vh] items-center justify-center bg-white rounded-3xl border border-[#F1F5F9] shadow-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-black text-[#0F172A] tracking-tighter">Memproses Akses Anda</p>
          <p className="text-sm text-[#64748B] font-medium">Menyesuaikan dashboard dengan hak akses Anda...</p>
        </div>
      </div>
    </div>
  );
}
