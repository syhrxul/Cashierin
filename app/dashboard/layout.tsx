'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { User, Bell, Search, Menu, X, ChevronDown, CheckCircle, Lock, Zap } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isSettingsPage = pathname === '/dashboard/owner/settings';
  const isFrozen = (storeInfo?.status === 'frozen' || storeInfo?.is_manual_frozen) && !isSettingsPage;

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    // Initial load from localStorage for responsiveness
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Always fetch latest data to sync role
    apiFetch('/user')
      .then((userData: any) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Fetch store info if owner/kasir/manager to check lock status globally
        if (userData.role !== 'superadmin' && userData.store_id) {
          apiFetch('/store/info')
            .then((res: any) => {
              const data = res.data || res;
              setStoreInfo(data);
              localStorage.setItem('store', JSON.stringify(data));
            })
            .catch(() => null);
        }
      })
      .catch((err) => {
        console.error('Profile sync failed:', err);
      });
  }, [router]);

  // Separate effect for route guard to avoid dependency issues and ensure consistency
  useEffect(() => {
    if (!mounted || !user) return;

    const userRole = user.role?.toLowerCase();
    const pathParts = pathname.split('/');

    // Ensure user is accessing their designated dashboard area
    if (pathParts[1] === 'dashboard' && pathParts[2]) {
      const targetSection = pathParts[2];

      // 1. Superadmin area
      if (targetSection === 'superadmin' && userRole !== 'superadmin') {
        router.replace(`/dashboard/${userRole === 'kasir' ? 'kasir' : (userRole === 'owner' || userRole === 'manager') ? 'owner' : 'superadmin'}`);
      }

      // 2. Owner area
      if (targetSection === 'owner' && userRole !== 'owner' && userRole !== 'manager' && userRole !== 'superadmin') {
        router.replace(`/dashboard/${userRole}`);
      }

      // 3. Manager area
      if (targetSection === 'manager' && userRole !== 'manager' && userRole !== 'superadmin') {
        router.replace(`/dashboard/${userRole}`);
      }

      // 4. Kasir area (POS)
      if (targetSection === 'kasir' && !['kasir', 'owner', 'manager', 'superadmin'].includes(userRole)) {
        router.replace('/login');
      }

      // 5. Special Case: Kasir role TRYING to access other things
      if (userRole === 'kasir' && targetSection !== 'kasir') {
        router.replace('/dashboard/kasir');
      }
    }
  }, [pathname, user, mounted, router]);

  if (!mounted || !user) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E2E8F0] border-t-[#4F46E5] shadow-sm"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex shrink-0 shadow-2xl shadow-indigo-100/20 z-40">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Top Header - Glass Effect */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 lg:hidden text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center flex-1 max-w-xl">
              <div className="relative w-full group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#4F46E5]">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Cari transaksi, produk, SKU, atau data toko..."
                  className="w-full h-11 pl-12 pr-4 bg-[#F1F5F9]/50 border-none focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:text-[#0F172A] transition-all text-sm font-medium rounded-xl placeholder:text-[#94A3B8] placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] relative transition-colors">
              <Bell size={19} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-10 w-[1px] bg-[#E2E8F0] mx-1" />

            <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-[#F8FAFC] p-2 rounded-xl transition-colors">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-sm font-black text-[#0F172A] truncate max-w-[150px] leading-tight capitalize">{user.name || 'Admin'}</p>
                  {user.approval_status === 'approved' && <CheckCircle size={12} className="text-emerald-500" />}
                </div>
                <p className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest mt-0.5">{user.role || 'Admin'}</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] font-black text-sm shadow-sm group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-300">
                  {user.name?.charAt(0).toUpperCase() || <User size={18} />}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 p-0.5 bg-white rounded-md border border-[#E2E8F0] text-[#94A3B8] group-hover:rotate-180 transition-transform duration-500">
                  <ChevronDown size={10} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="bg-white w-72 shadow-2xl relative animate-in slide-in-from-left duration-300">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-5 -right-12 p-2 bg-indigo-600 text-white rounded-r-xl"
              >
                <X size={22} />
              </button>
              <DashboardSidebar />
            </div>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-300"
            />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar scroll-smooth relative">
          {/* Global Frozen Blocker Overlay */}
          {isFrozen && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-500 rounded-[3rem]">
              {/* Blurred Background Layer */}
              <div className="absolute inset-0 bg-slate-100/10 backdrop-blur-xl pointer-events-none" />

              <div className="relative z-10 w-full max-w-xl bg-white rounded-[3.5rem] border border-[#E2E8F0] shadow-2xl p-12 lg:p-16 text-center space-y-10 overflow-hidden">
                {/* Visual indicator */}
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50">
                  <Lock size={40} />
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tighter text-[#0F172A]">Sistem Dibekukan</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {user?.role === 'kasir'
                      ? 'Operasional kasir dihentikan sementara karena masa aktif lisensi toko telah berakhir. Silakan hubungi Owner untuk proses perpanjangan.'
                      : 'Lisensi toko Anda telah berakhir atau dibekukan oleh Admin. Silakan masukkan Serial Key baru melalui menu Pengaturan Lisensi untuk mengaktifkan kembali seluruh fitur secara instan.'}
                  </p>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#4F46E5] shrink-0 shadow-sm"><Zap size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tindakan Diperlukan</p>
                    <p className="text-xs text-slate-600 font-bold mt-1 leading-relaxed">Status Toko: <span className="text-rose-500 uppercase">Frozen</span>. Hubungi Admin/Owner segera agar sistem dapat digunakan kembali.</p>
                  </div>
                </div>

                {user?.role === 'owner' && (
                  <button
                    onClick={() => router.push('/dashboard/owner/settings?tab=license')}
                    className="w-full h-16 bg-[#4F46E5] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#4338CA] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
                  >
                    <Zap size={18} /> Update Lisensi
                  </button>
                )}
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pusat Bantuan Cashierin: support@cashierin.id</p>
              </div>
            </div>
          )}

          <div className={`mx-auto max-w-7xl relative ${isFrozen ? 'blur-2xl opacity-40 grayscale pointer-events-none select-none overflow-hidden h-[70vh]' : 'animate-in slide-in-from-bottom-4 duration-500'}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
