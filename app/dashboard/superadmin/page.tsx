'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Store,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  MoreVertical,
  Activity,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  Zap,
  BarChart4,
  User as UserIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AnnouncementOverlay from '@/components/announcements/AnnouncementOverlay';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total_users: 0,
    total_stores: 0,
    total_transactions: 0,
    total_revenue: 0,
    recent_registrations: [],
    latest_stores: []
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Parallel fetch for overview data
      const [usersRes, storesRes, pendingRes, statsRes]: any = await Promise.all([
        apiFetch('/superadmin/users').catch(() => ({ data: [] })),
        apiFetch('/superadmin/stores').catch(() => ({ data: [] })),
        apiFetch('/superadmin/users/pending').catch(() => ({ data: [] })),
        apiFetch('/superadmin/dashboard').catch(() => ({ data: { stats: {}, latest_stores: [] } }))
      ]);

      const usersList = usersRes.data || [];
      const storesList = storesRes.data || [];
      const pendingList = pendingRes.data || [];
      const remoteStats = statsRes.data?.stats || {};
      const latestStores = statsRes.data?.latest_stores || [];

      setStats({
        total_users: usersList.length,
        total_stores: storesList.length,
        total_rejected: remoteStats.users?.total_rejected ?? 0,
        total_pending_approval: pendingList.length,
        total_transactions: remoteStats.volume?.transactions || 0,
        total_revenue: remoteStats.volume?.revenue || 0,
        recent_registrations: pendingList.slice(0, 5).map((u: any) => ({
          id: u.id,
          name: u.name,
          owner: u.username || u.email,
          date: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Baru',
        })),
        latest_stores: latestStores.map((s: any) => ({
          id: s.id,
          name: s.name,
          owner: s.owner?.username || 'System',
          status: s.status,
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Baru'
        }))
      });

    } catch (err: any) {
      console.error('[Dashboard] Critical aggregation error:', err);
      setErrorMsg('Gagal melakukan sinkronisasi data seluruh metrik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#4F46E5] animate-spin shadow-sm" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <AnnouncementOverlay />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-12 rounded-[4rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Activity size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#10B981]/10 text-[#10B981] rounded-2xl border border-[#10B981]/20">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Terminal Status: Operational</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0F172A]">Superadmin Centre</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg italic">Pusat kendali seluruh operasional sistem Cashierin secara global.</p>
        </div>

        <button
          onClick={fetchData}
          className="relative z-10 h-16 px-8 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw size={18} /> Sinkronisasi Metrik
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-[3rem] flex items-center gap-6 animate-in slide-in-from-top-4">
          <AlertCircle size={32} className="text-rose-600" />
          <p className="text-sm font-bold text-rose-900">{errorMsg}</p>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { title: 'Total Toko', val: stats.total_stores, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/superadmin/stores' },
          { title: 'Total User', val: stats.total_users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/dashboard/superadmin/users' },
          { title: 'Approval Antri', val: stats.total_pending_approval, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/superadmin/users?status=pending' },
          { title: 'Owner Rejected', val: stats.total_rejected, icon: X, color: 'text-rose-600', bg: 'bg-rose-50', href: '/dashboard/superadmin/users?status=rejected' },
          { title: 'Global Revenue', val: `Rp ${stats.total_revenue.toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', href: null },
          { title: 'Transaksi Trans.', val: stats.total_transactions, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', href: null }
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => item.href && router.push(item.href)}
            className={`group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 ${item.href ? 'cursor-pointer hover:-translate-y-1' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
              <item.icon size={22} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{item.title}</p>
            <h3 className="text-2xl font-black tracking-tighter text-[#0F172A] mt-1">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Latest Stores - New feature requested */}
        <div className="lg:col-span-12 xl:col-span-8 bg-white rounded-[4rem] border border-slate-100 p-12 shadow-xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-[#0F172A] uppercase">Registrasi Toko Terbaru</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Toko yang baru saja setup Trial 30 Hari</p>
            </div>
            <button onClick={() => router.push('/dashboard/superadmin/stores')} className="h-12 px-6 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 hover:text-indigo-600 transition-all">Lihat Semua</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.latest_stores.length === 0 ? (
              <div className="col-span-2 py-20 text-center opacity-30 italic"><Store size={48} className="mx-auto mb-4" /> Belum ada toko baru.</div>
            ) : stats.latest_stores.map((s: any) => (
              <div key={s.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 font-black text-xl">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[#0F172A] uppercase truncate leading-none mb-2">{s.name}</h4>
                    <p className="text-[11px] font-medium text-slate-400">Owner: <span className="text-indigo-600">@{s.owner}</span></p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Trial Active</div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">{s.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Side Feed */}
        <div className="lg:col-span-12 xl:col-span-4 bg-[#0F172A] rounded-[4rem] p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tighter">Approval Queue</h3>
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black animate-pulse shadow-lg shadow-amber-500/30">
              {stats.recent_registrations.length}
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {stats.recent_registrations.length === 0 ? (
              <div className="py-20 text-center opacity-20"><Users size={48} className="mx-auto mb-4" /> Kosong</div>
            ) : stats.recent_registrations.map((u: any) => (
              <div key={u.id} className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => router.push('/dashboard/superadmin/users?status=pending')}>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><UserIcon className="text-slate-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">@{u.owner}</p>
                </div>
                <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all"><ArrowUpRight size={18} /></button>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard/superadmin/users?status=pending')}
            className="w-full h-16 bg-white text-[#0F172A] rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] mt-10 hover:bg-slate-50 transition-all relative z-10"
          >
            Buka System Approval
          </button>
        </div>
      </div>
    </div>
  );
}

