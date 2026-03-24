'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileText,
  Clock,
  LogOut,
  ChevronDown,
  Lock,
  Calendar,
  Zap,
  Tag,
  Store,
  CreditCard,
  ShieldCheck,
  Megaphone,
  Key,
  XCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight
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
        { icon: Megaphone, label: 'Pengumuman', href: '/dashboard/superadmin/announcements' },
        {
          icon: Users,
          label: 'Semua Pengguna',
          href: '/dashboard/superadmin/users',
          subItems: [
            { label: 'Daftar Semua', href: '/dashboard/superadmin/users', icon: Users },
            { label: 'Menunggu Approval', href: '/dashboard/superadmin/users?status=pending', icon: Clock },
            { label: 'Daftar Penolakan', href: '/dashboard/superadmin/users?status=rejected', icon: XCircle },
          ]
        },
      ]
    },
    {
      label: 'Sistem', items: [
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
        { icon: Megaphone, label: 'Pengumuman', href: '/dashboard/owner/announcements' },
        {
          icon: Clock,
          label: 'Manajemen Shift',
          href: '/dashboard/owner/shifts',
          subItems: [
            { label: 'Jadwal & Master', href: '/dashboard/owner/shifts', icon: Clock },
            { label: 'Riwayat Tukar', href: '/dashboard/owner/shifts/requests', icon: FileText },
          ]
        },
        { icon: FileText, label: 'Riwayat Bill', href: '/dashboard/kasir/history' },
      ]
    },
    {
      label: 'Inventaris', items: [
        { icon: Package, label: 'Nama & Stok Barang', href: '/dashboard/owner/products' },
        { icon: Tag, label: 'Diskon & Promo', href: '/dashboard/owner/discounts' },
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
        { icon: FileText, label: 'Riwayat Bill', href: '/dashboard/kasir/history' },
        { icon: FileText, label: 'Reports', href: '/dashboard/manager/reports' },
        { icon: Megaphone, label: 'Pengumuman', href: '/dashboard/manager/announcements' },
      ]
    },
  ],
  kasir: [
    {
      label: 'Point of Sale', items: [
        { icon: ShoppingCart, label: 'Jual (POS)', href: '/dashboard/kasir' },
        { icon: Megaphone, label: 'Pengumuman', href: '/dashboard/kasir/announcements' },
        { icon: Tag, label: 'Info Diskon', href: '/dashboard/kasir/discounts' },
        { icon: FileText, label: 'Riwayat Bill', href: '/dashboard/kasir/history' },
        { icon: Clock, label: 'Jadwal & Shift', href: '/dashboard/kasir/profile' },
      ]
    },
  ],
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>('superadmin');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Semua Pengguna']);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const u = JSON.parse(userJson);
      setUser(u);
      setRole((u.role?.toLowerCase() || 'superadmin') as Role);
      fetchUnreadCount();
    }

    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('announcementCountUpdate', handleUpdate);
    return () => window.removeEventListener('announcementCountUpdate', handleUpdate);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res: any = await apiFetch('/announcements/unread-count');
      setUnreadCount(res.count || 0);
    } catch (err) { console.error(err); }
  };

  const groups = menuByRole[role] || [];
  const isPending = user?.approval_status === 'pending';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const toggleExpand = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <aside className={`flex flex-col bg-white border-r border-[#E2E8F0] h-screen transition-all duration-300 relative z-50 ${isCollapsed ? 'w-20' : 'w-72'}`}>
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
                const isSubMenuActive = item.subItems?.some((sub: any) => pathname === sub.href);
                const isActive = pathname === item.href || isSubMenuActive;
                const isExpanded = expandedMenus.includes(item.label);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                // Special "Locked" logic for Pending Owners
                const isLocked = isPending && item.label !== 'Dashboard' && item.href !== '/dashboard/owner';

                return (
                  <div key={item.label} className="space-y-1">
                    {hasSubItems && !isCollapsed ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group w-full ${isActive && !isExpanded
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 font-bold'
                            : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                            }`}
                        >
                          <item.icon size={20} className={`${isActive && !isExpanded ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#4F46E5]'}`} />
                          <span className="text-[13.5px] whitespace-nowrap truncate">{item.label}</span>

                          {/* Announcement Badge */}
                          {item.label === 'Pengumuman' && unreadCount > 0 && (
                            <span className="absolute right-4 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-rose-200">
                              {unreadCount}
                            </span>
                          )}

                          <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-50 space-y-1 animate-in slide-in-from-top-2 duration-300">
                            {item.subItems.map((sub: any) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${isSubActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                  {sub.icon && <sub.icon size={14} />}
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.href}
                        href={isLocked ? '#' : item.href}
                        onClick={(e) => isLocked && e.preventDefault()}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 font-bold'
                          : isLocked ? 'opacity-40 cursor-not-allowed' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                          }`}
                      >
                        <item.icon size={20} className={`${isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#4F46E5] transition-colors'} ${isLocked ? 'blur-[0.5px]' : ''}`} />
                        {!isCollapsed && (
                          <>
                            <span className="text-[13px] whitespace-nowrap truncate">{item.label}</span>
                            {item.label === 'Pengumuman' && unreadCount > 0 && (
                              <span className="absolute right-4 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-rose-200">
                                {unreadCount}
                              </span>
                            )}
                          </>
                        )}
                        {isLocked && !isCollapsed && <Lock size={12} className="ml-auto text-slate-300" />}
                        {isActive && !isLocked && unreadCount === 0 && <div className="ml-auto w-1 h-1 rounded-full bg-white/40" />}
                      </Link>
                    )}
                  </div>
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
