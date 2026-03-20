'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Store,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ArrowUpDown,
  Download,
  Loader2,
  X,
  Mail,
  User,
  Clock,
  MapPin,
  ShieldCheck,
  Calendar,
  Activity,
  Crown,
  Zap,
  CalendarDays,
  ShieldAlert,
  ArrowUpRight,
  Coffee,
  Store as StoreIcon,
  Tag,
  Hash,
  Copy,
  Users as UsersIcon,
  Package,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface StoreData {
  id: number;
  user_id: number;
  name: string;
  address?: string;
  business_hours?: string;
  business_category?: string;
  invite_code?: string;
  license_type?: string;
  license_expires_at?: string;
  grace_period_ends_at?: string;
  owner?: {
    id: number;
    name: string;
    email: string;
    username: string;
  };
  status: string;
  created_at: string;
  active_shifts_count?: number;
  products_count?: number;
  users_count?: number;
  transactions_count?: number;
}

export default function StoreListPage() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        console.log('[StoreListPage] Syncing full metrics from server...');
        const response: any = await apiFetch('/superadmin/stores');
        const storesList = response.data || (Array.isArray(response) ? response : []);
        setStores(storesList);
      } catch (err: any) {
        console.error('[StoreListPage] Load failed:', err);
        setErrorMsg(err.message || 'Gagal memuat daftar toko dari server.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.owner?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#4F46E5] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <StoreIcon size={24} className="text-slate-200" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0F172A] mb-1">Menarik Data Metrik</p>
          <p className="text-xs text-slate-400 font-medium">Informasi produk, karyawan, dan transaksi sedang dikalkulasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-auto">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#4F46E5] mb-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="w-1 h-1 rounded-full bg-indigo-600 animate-pulse" />
            Full Audit System
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Monitor Seluruh Toko</h1>
          <p className="text-sm text-slate-400 font-medium">Analisis mendalam terhadap operasional, inventaris, dan tim di setiap cabang.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-12 px-6 border border-slate-200 bg-white text-slate-700 font-bold rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all text-sm shadow-sm">
            <Download size={19} />
            Export
          </button>
          <button className="h-12 px-6 bg-[#4F46E5] text-white font-bold rounded-2xl flex items-center gap-3 hover:bg-[#4338CA] transition-all text-sm shadow-xl shadow-indigo-100">
            <Plus size={19} />
            Daftarkan Toko
          </button>
        </div>
      </div>

      {/* Modern Filter Shell */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4F46E5] transition-colors">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Cari toko berdasarkan nama, pemilik, atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-13 pl-12 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl outline-none transition-all text-sm font-semibold placeholder:text-slate-300 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-[3rem] border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Nama Toko</th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Operasional</th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Overview</th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Lisensi</th>
                <th className="px-8 py-6 text-center w-28 text-[11px] font-black uppercase tracking-widest text-slate-400">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStores.map((toko) => {
                const isOpen = (toko.active_shifts_count || 0) > 0;
                return (
                  <tr key={toko.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                          {toko.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">{toko.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: CS-{toko.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isOpen ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}>
                          <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          {isOpen ? 'Store Open' : 'Store Closed'}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{toko.business_hours || 'Schedule Pending'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center min-w-[3rem] px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[8px] font-black text-slate-300 uppercase">Prods</span>
                          <span className="text-xs font-black text-slate-600">{toko.products_count}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[3rem] px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[8px] font-black text-slate-300 uppercase">Users</span>
                          <span className="text-xs font-black text-slate-600">{toko.users_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${toko.status === 'active' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'
                        }`}>
                        {toko.status === 'active' ? <Crown size={13} /> : <XCircle size={13} />}
                        {toko.license_type || 'None'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => setSelectedStore(toko)}
                        className="w-10 h-10 flex items-center justify-center bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-all shadow-lg active:scale-95"
                      >
                        <Activity size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expansion Detail Modal with Multi-Metrics */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
          <div
            className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-2xl animate-in fade-in duration-300"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[4rem] border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">

            {/* Modal Header */}
            <div className="p-12 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-[#4F46E5] text-white flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0">
                  <StoreIcon size={48} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{selectedStore.name}</h2>
                  <div className="flex items-center gap-4 mt-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border ${(selectedStore.active_shifts_count || 0) > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${(selectedStore.active_shifts_count || 0) > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      {(selectedStore.active_shifts_count || 0) > 0 ? 'Beroperasi (Kasir On)' : 'Toko Tutup'}
                    </div>
                    <span className="text-xs font-bold text-slate-300">|</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedStore.business_hours || 'Schedule Unknown'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-12 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Section: Core Profile & Identity */}
                <div className="lg:col-span-1 space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#4F46E5]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Kepemilikan & Lokasi</p>
                    </div>
                    <div className="bg-slate-50/70 p-8 rounded-[3rem] border border-slate-100 space-y-10">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#4F46E5] shadow-sm"><User size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Owner Name</p>
                          <p className="text-sm font-black text-[#0F172A]">{selectedStore.owner?.name || 'Unassigned'}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">{selectedStore.owner?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-teal-600 shadow-sm"><Hash size={24} /></div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Invite Code</p>
                          <div className="flex items-center gap-3 group/copy">
                            <p className="text-sm font-black text-teal-600">{selectedStore.invite_code || '-'}</p>
                            <button
                              onClick={() => copyToClipboard(selectedStore.invite_code)}
                              className="p-1 bg-slate-100 text-slate-400 hover:text-teal-600 rounded-md transition-all opacity-0 group-hover/copy:opacity-100"
                            >
                              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm"><MapPin size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Physical Location</p>
                          <p className="text-sm font-black text-[#0F172A]">{selectedStore.address || 'Alamat Cabang Belum Didaftarkan'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Section: Productivity Metrics */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Produktivitas & Skala</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { label: 'Total Inventaris', val: `${selectedStore.products_count} Produk`, icon: Package, color: 'indigo' },
                      { label: 'Karyawan Aktif', val: `${selectedStore.users_count} Orang`, icon: UsersIcon, color: 'sky' },
                      { label: 'Volume Transaksi', val: `${selectedStore.transactions_count} TX`, icon: ShoppingCart, color: 'emerald' },
                      { label: 'Aktivitas Hari Ini', val: (selectedStore.active_shifts_count || 0) > 0 ? 'Cashier Active' : 'Offline', icon: Activity, color: (selectedStore.active_shifts_count || 0) > 0 ? 'rose' : 'slate' }
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-lg transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl bg-${metric.color}-50 text-${metric.color}-600 flex items-center justify-center`}>
                            <metric.icon size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase">{metric.label}</p>
                            <p className="text-sm font-black text-[#0F172A]">{metric.val}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Section: Licensing Status */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-amber-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Berlangganan & Lisensi</p>
                  </div>
                  <div className={`relative overflow-hidden p-10 rounded-[3.5rem] border shadow-2xl flex flex-col justify-between h-fit min-h-[400px] ${selectedStore.license_type === 'full'
                    ? 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-slate-700 text-white'
                    : 'bg-amber-50/50 border-amber-100 text-amber-900'
                    }`}>
                    <div className="absolute -right-10 -bottom-10 opacity-5">
                      <Crown size={200} />
                    </div>

                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-xl ${selectedStore.license_type === 'full' ? 'bg-amber-500 text-white' : 'bg-white text-amber-600'}`}>
                        <Crown size={32} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">LICENSE PASS</h4>
                      <h3 className="text-3xl font-black uppercase">{selectedStore.license_type || 'TRIAL'}</h3>
                    </div>

                    <div className="relative z-10 pt-10 mt-10 border-t border-white/10 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 opacity-60">
                          <CalendarDays size={18} />
                          <span className="text-[10px] font-black uppercase">Aktivasi</span>
                        </div>
                        <p className="text-sm font-bold">{formatDate(selectedStore.created_at)}</p>
                      </div>
                      <div className="flex justify-between items-center text-rose-400">
                        <div className="flex items-center gap-3 opacity-60 text-white">
                          <ShieldAlert size={18} />
                          <span className="text-[10px] font-black uppercase">Tenggat</span>
                        </div>
                        <p className="text-sm font-bold">{formatDate(selectedStore.license_expires_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Control Center */}
            <div className="p-12 pt-0 flex gap-6 mt-auto bg-white/50 backdrop-blur-sm">
              <button
                onClick={() => setSelectedStore(null)}
                className="flex-1 h-18 bg-white text-[#4F46E5] font-black uppercase tracking-[0.25em] text-[11px] rounded-[2rem] border-2 border-indigo-50 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
              >
                Tutup Panel Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
