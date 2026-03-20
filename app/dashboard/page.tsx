'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // We wrap everything in a small timeout or use immediate checks
    const checkAuth = () => {
      const userJson = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('--- DASHBOARD REDIRECT CHECK ---');
      console.log('Token exists:', !!token);
      console.log('User data:', userJson);

      if (!token) {
        console.warn('Redirecting to login: MISSING TOKEN');
        router.replace('/login');
        return;
      }

      let role = 'superadmin';
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          role = user.role?.toLowerCase() || 'superadmin';
          console.log('Parsed user role:', role);
        } catch (e) {
          console.error('JSON Parse error for user data, using default superadmin');
        }
      }

      // Map roles to their specific sub-dashboard paths
      const roleMap: Record<string, string> = {
        'superadmin': '/dashboard/superadmin',
        'owner': '/dashboard/owner',
        'manager': '/dashboard/manager',
        'kasir': '/dashboard/kasir',
      };

      const targetPath = roleMap[role] || '/dashboard/superadmin';
      console.log('REDIRECT TARGET:', targetPath);
      
      // Perform final redirection
      router.replace(targetPath);
    };

    // Tiny delay to ensure localStorage is hydrated in all browser engines if needed
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
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
