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
  X
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total_users: 0,
    total_stores: 0,
    total_transactions: 0,
    total_revenue: 0,
    recent_registrations: []
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    console.log('[Dashboard] Aggregating data from multiple production endpoints...');

    try {
      // Step 1: Fetch Users
      const usersRes: any = await apiFetch('/superadmin/users').catch(e => {
        console.warn('Users fetch failed:', e);
        return { data: [] };
      });

      // Step 2: Fetch Stores
      const storesRes: any = await apiFetch('/superadmin/stores').catch(e => {
        console.warn('Stores fetch failed:', e);
        return { data: [] };
      });

      // Step 3: Fetch Pending Registrations
      const pendingRes: any = await apiFetch('/superadmin/users/pending').catch(e => {
        console.warn('Pending users fetch failed:', e);
        return { data: [] };
      });

      const usersList = usersRes.data || (Array.isArray(usersRes) ? usersRes : []);
      const storesList = storesRes.data || (Array.isArray(storesRes) ? storesRes : []);
      const pendingList = pendingRes.data || (Array.isArray(pendingRes) ? pendingRes : []);

      // Manual aggregation for the dashboard
      setStats({
        total_users: usersList.length,
        total_stores: storesList.length,
        total_transactions: 0, // No production endpoint for aggregate transactions yet
        total_revenue: 0,      // No production endpoint for aggregate revenue yet
        recent_registrations: pendingList.map((u: any) => ({
          id: u.id,
          name: u.name,
          owner: u.username || u.email,
          date: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Baru',
          status: 'pending'
        }))
      });

    } catch (err: any) {
      console.error('[Dashboard] Critical aggregation error:', err);
      // We don't use simulation mode here as per user request
      setErrorMsg('Gagal melakukan sinkronisasi data dari beberapa endpoint.');
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#10B981]">Sistem Aktif & Terhubung</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="h-13 px-6 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={18} />
            Sinkron Ulang
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2.5rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-rose-900 mb-1">Kesalahan Sinkronisasi</p>
            <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Total Revenue', val: `Rp ${new Intl.NumberFormat('id-ID').format(stats.total_revenue)}`, icon: DollarSign, color: 'indigo', note: 'Global stats' },
          { title: 'Store Units', val: stats.total_stores, icon: Store, color: 'emerald', note: 'Data' },
          { title: 'Registered Users', val: stats.total_users, icon: Users, color: 'amber', note: 'Data' },
          { title: 'Transactions', val: stats.total_transactions, icon: CreditCard, color: 'rose', note: 'Global stats' }
        ].map((item, i) => (
          <div key={i} className="group relative bg-white p-8 rounded-[3rem] border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-700">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-700 flex items-center justify-center mb-8 shadow-sm`}>
              <item.icon size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{item.title}</p>
              <h3 className="text-2xl font-black tracking-tight text-[#0F172A] tabular-nums">{item.val}</h3>
              <p className="text-[8px] font-black uppercase text-slate-200 mt-2">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Activity Feed */}
        <div className="bg-white rounded-[4rem] border border-slate-200/60 p-10 shadow-2xl shadow-slate-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tighter text-[#0F172A]">Registrasi Pending</h3>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black text-xs border border-indigo-100">
              {stats.recent_registrations.length}
            </div>
          </div>

          <div className="space-y-8">
            {stats.recent_registrations.length === 0 ? (
              <p className="text-xs text-slate-300 text-center py-10">Tidak ada pendaftaran tertunda.</p>
            ) : (
              stats.recent_registrations.map((toko: any) => (
                <div key={toko.id} className="group flex gap-5 mb-3 animate-in fade-in duration-500">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-[#4F46E5] group-hover:border-indigo-100 transition-all duration-500">
                    <Users size={26} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">{toko.name}</p>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{toko.owner}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Calendar size={12} className="text-slate-200" />
                      <span className="text-[9px] font-bold text-slate-200 uppercase">{toko.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Placeholder for future global charts */}
        <div className="lg:col-span-2 bg-[#F1F5F9]/50 rounded-[4rem] border border-slate-200/60 p-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
          <BarChart4 size={48} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-black tracking-tighter text-slate-400 uppercase">Global Analytics Sync</h3>
          <p className="text-xs text-slate-300 font-medium mt-2">Grafik agregat akan muncul secara otomatis setelah backend <br /> mendukug endpoint agregasi transaksi.</p>
        </div>
      </div>
    </div>
  );
}

import { BarChart4 } from 'lucide-react';
