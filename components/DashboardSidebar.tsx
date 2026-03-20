'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Store,
  Key,
  Users,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  FileText,
  UserCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

type Role = 'superadmin' | 'owner' | 'manager' | 'kasir';

const menuByRole: Record<Role, any[]> = {
  superadmin: [
    {
      label: 'Menu Utama', items: [
        { icon: LayoutDashboard, label: 'Ringkasan', href: '/dashboard/superadmin' },
        { icon: Store, label: 'Daftar Toko', href: '/dashboard/superadmin/toko' },
        { icon: Key, label: 'Serial License', href: '/dashboard/superadmin/license' },
        { icon: Users, label: 'Semua Pengguna', href: '/dashboard/superadmin/users' },
      ]
    },
    {
      label: 'Sistem', items: [
        { icon: Activity, label: 'Log Aktivitas', href: '/dashboard/superadmin/activity' },
        { icon: BarChart3, label: 'Statistik Global', href: '/dashboard/superadmin/stats' },
        { icon: Settings, label: 'Pengaturan', href: '/dashboard/superadmin/settings' },
      ]
    },
  ],
  owner: [
    {
      label: 'Menu Toko', items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/owner' },
        { icon: ShoppingCart, label: 'Kasir (POS)', href: '/dashboard/kasir' },
        { icon: Users, label: 'Karyawan', href: '/dashboard/owner/employees' },
      ]
    },
    {
      label: 'Inventaris', items: [
        { icon: Package, label: 'Stok Barang', href: '/dashboard/owner/inventory' },
        { icon: FileText, label: 'Laporan Penjualan', href: '/dashboard/owner/reports' },
        { icon: Settings, label: 'Setup Toko', href: '/dashboard/owner/settings' },
      ]
    },
  ],
  manager: [
    {
      label: 'Menu', items: [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard/manager' },
        { icon: Package, label: 'Manajemen Stok', href: '/dashboard/manager/inventory' },
        { icon: FileText, label: 'Reports', href: '/dashboard/manager/reports' },
      ]
    },
  ],
  kasir: [
    {
      label: 'Point of Sale', items: [
        { icon: ShoppingCart, label: 'Jual (POS)', href: '/dashboard/kasir' },
        { icon: FileText, label: 'Riwayat Bill', href: '/dashboard/kasir/history' },
        { icon: UserCircle, label: 'Profile', href: '/dashboard/kasir/profile' },
      ]
    },
  ],
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<Role>('superadmin');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setRole((user.role?.toLowerCase() || 'superadmin') as Role);
    }
  }, []);

  const groups = menuByRole[role] || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className={`flex flex-col bg-white border-r border-[#E2E8F0] h-screen transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            <Store size={20} />
          </div>
          {!isCollapsed && (
            <h2 className="text-xl font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap overflow-hidden animate-in fade-in duration-500">
              Cashierin
            </h2>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            {!isCollapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] px-4 mb-3">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item: any) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 font-bold'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                  >
                    <item.icon size={20} className={`${isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#4F46E5] transition-colors'}`} />
                    {!isCollapsed && <span className="text-[13px] whitespace-nowrap truncate">{item.label}</span>}
                    {isActive && !isCollapsed && <div className="ml-auto w-1 h-1 rounded-full bg-white/40" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#F1F5F9]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="text-[13px]">Keluar Aplikasi</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#4F46E5] hover:border-[#4F46E5] transition-all z-10 shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
