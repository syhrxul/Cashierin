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
        console.log('Fetching latest user data to verify role...');
        const user = await apiFetch('/user');

        // Update local storage with fresh data including latest role
        localStorage.setItem('user', JSON.stringify(user));

        const role = user.role?.toLowerCase() || 'superadmin';
        console.log('Latest user role from server:', role);

        const targetPath = roleMap[role] || '/dashboard/superadmin';
        console.log('REDIRECT TARGET (FRESH):', targetPath);
        router.replace(targetPath);
      } catch (err) {
        console.error('Failed to fetch fresh user data, falling back to localStorage:', err);

        // Fallback to localStorage if API is down
        const userJson = localStorage.getItem('user');
        let role = 'superadmin';

        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            role = user.role?.toLowerCase() || 'superadmin';
          } catch (e) { }
        }

        const targetPath = roleMap[role] || '/dashboard/superadmin';
        console.log('REDIRECT TARGET (FALLBACK):', targetPath);
        router.replace(targetPath);
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
