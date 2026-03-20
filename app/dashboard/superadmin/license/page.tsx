'use client';

import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Search,
  Filter,
  TrendingUp,
  Zap,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Loader2,
  Calendar,
  X,
  CreditCard,
  Hash,
  Download,
  CalendarCheck,
  ShieldAlert
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface LicenseKey {
  id: number;
  key: string;
  type: string;
  duration_days: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  store_id: number | null;
  used_by: number | null;
  store?: {
    name: string;
  };
  user?: {
    name: string;
  };
  created_at: string;
}

export default function LicenseManagement() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [showModal, setShowModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Create Form State
  const [newLicense, setNewLicense] = useState({
    type: 'full',
    duration_days: 30,
    count: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await apiFetch('/superadmin/license-keys');
      setKeys(res.data || []);
    } catch (err) {
      console.error('Failed to fetch licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/superadmin/license-keys', {
        method: 'POST',
        body: JSON.stringify(newLicense)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Create failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus license key ini?')) return;
    try {
      await apiFetch(`/superadmin/license-keys/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.key.toLowerCase().includes(search.toLowerCase()) ||
      (k.store?.name || '').toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'used') return matchesSearch && k.is_used;
    if (statusFilter === 'unused') return matchesSearch && !k.is_used;
    return matchesSearch;
  });

  const stats = {
    total: keys.length,
    active: keys.filter(k => k.is_used).length,
    available: keys.filter(k => !k.is_used).length,
    expired: keys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#4F46E5] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Key size={24} className="text-slate-200" />
          </div>
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">Sinkronisasi Lisensi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500">Security & Authentication</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Audit Serial Lisensi</h1>
          <p className="text-sm text-slate-400 font-medium">Pantau status aktivasi dan masa berlaku kunci lisensi secara terperinci.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="h-14 px-8 bg-[#4F46E5] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#4338CA] transition-all active:scale-95 shadow-2xl shadow-indigo-100"
          >
            <Plus size={18} strokeWidth={3} />
            Generate Baru
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Serial', val: stats.total, icon: Hash, color: 'slate' },
          { label: 'Terpakai', val: stats.active, icon: CheckCircle2, color: 'emerald' },
          { label: 'Tersedia', val: stats.available, icon: Zap, color: 'amber' },
          { label: 'Expired', val: stats.expired, icon: AlertCircle, color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -bottom-4 opacity-5 text-slate-400 group-hover:scale-110 transition-transform duration-700`}>
              <stat.icon size={120} />
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-[#0F172A] tabular-nums">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Cari kunci serial atau nama toko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-6 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl outline-none font-bold text-sm transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'used', label: 'Sudah Dipakai' },
            { id: 'unused', label: 'Masih Kosong' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab.id
                ? 'bg-[#4F46E5] text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced License Data Grid */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Identity Key</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Konfigurasi</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Validitas Aktivasi</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Pengguna (Store)</th>
                <th className="px-10 py-8 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeys.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="font-black text-[#0F172A] tracking-wider font-mono text-sm bg-slate-100 px-4 py-2 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {item.key}
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.key)}
                        className={`p-2 rounded-lg transition-all ${copiedKey === item.key ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm'}`}
                      >
                        {copiedKey === item.key ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <div className={`text-xs font-black uppercase tracking-widest ${item.type === 'full' ? 'text-amber-500' : 'text-slate-400'}`}>
                        {item.type} Edition
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 uppercase">
                        Initial: {item.duration_days} Days
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-3">
                      {item.is_used ? (
                        <>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CalendarCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Aktif: {formatDate(item.used_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-rose-500">
                            <ShieldAlert size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tenggat: {formatDate(item.expires_at)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 w-fit">
                          <Clock size={14} />
                          Belum Diaktivasi
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {item.store ? (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                          {item.store.name}
                          <ExternalLink size={12} className="text-slate-300" />
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auth By: {item.user?.name || '-'}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-slate-200 uppercase tracking-widest">Menunggu Aktivasi</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-rose-300 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                        title="Musnahkan Key"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate License Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
              <Crown className="absolute -right-8 -top-8 text-white/10" size={160} />
              <h2 className="text-3xl font-black tracking-tighter relative z-10">Generate Key</h2>
              <p className="text-indigo-100 text-sm mt-2 relative z-10 font-medium opacity-80 uppercase tracking-widest text-[10px]">Penerbitan Multi-Licensing Baru</p>
            </div>

            <form onSubmit={handleCreate} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipe Lisensi</label>
                <div className="grid grid-cols-2 gap-4">
                  {['full', 'trial'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewLicense({ ...newLicense, type })}
                      className={`h-14 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${newLicense.type === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-100 text-slate-300 hover:border-slate-200'
                        }`}
                    >
                      {type === 'full' ? 'Enterprise Pack' : 'Limited Trial'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Durasi (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLicense.duration_days}
                    onChange={(e) => setNewLicense({ ...newLicense, duration_days: parseInt(e.target.value) })}
                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-black outline-none focus:ring-2 ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jumlah Key</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newLicense.count}
                    onChange={(e) => setNewLicense({ ...newLicense, count: parseInt(e.target.value) })}
                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-black outline-none focus:ring-2 ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-16 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-[1.75rem] hover:bg-slate-200 transition-all"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] h-16 bg-[#0F172A] text-white font-black uppercase tracking-widest text-[10px] rounded-[1.75rem] shadow-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                  Terbitkan Lisensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { Crown } from 'lucide-react';
