'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Shield,
  Zap,
  Key,
  CheckCircle2,
  AlertCircle,
  Package,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
  MapPin,
  ChevronRight,
  Loader2,
  Crown,
  Settings
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OwnerSettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Store Form State
  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    business_hours: '',
    business_category: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [infoRes, statsRes]: any = await Promise.all([
        apiFetch('/store/info'),
        apiFetch('/owner/stats')
      ]);

      const info = infoRes.data;
      setStoreInfo(info);
      setStats(statsRes.data);

      setStoreForm({
        name: info.name || '',
        address: info.address || '',
        business_hours: info.business_hours || '08:00 - 22:00',
        business_category: info.business_category || 'F&B'
      });
    } catch (err) {
      console.error('Failed to fetch settings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);
    try {
      await apiFetch('/store/update', {
        method: 'POST',
        body: JSON.stringify(storeForm)
      });
      setMessage({ type: 'success', text: 'Informasi toko berhasil diperbarui.' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui toko.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize the key: remove spaces, dashes, and ensure it's all uppercase
    const sanitizedKey = licenseKey.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (!sanitizedKey) return;
    setSubmitLoading(true);
    setMessage(null);
    try {
      await apiFetch('/license-keys/activate', {
        method: 'POST',
        body: JSON.stringify({ key: sanitizedKey })
      });
      setMessage({ type: 'success', text: 'Lisensi berhasil diaktifkan! Toko Anda kini dalam mode Full Akses.' });
      setLicenseKey('');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Serial Key tidak valid atau sudah digunakan.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menyiapkan Pengaturan Toko...</p>
      </div>
    );
  }

  const isTrial = storeInfo?.license_type === 'trial';
  const prodLimit = 10;
  const userLimit = 2;
  const currentProds = stats?.total_products || 0;
  const currentUsers = stats?.total_employees || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-lg border border-indigo-100 mb-2">
            <Settings size={12} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-widest">Configuration Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Setup Toko</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola identitas bisnis, keamanan, dan paket berlangganan Anda.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          {[
            { id: 'store', label: 'Profil Toko', icon: Building },
            { id: 'security', label: 'Keamanan', icon: Shield },
            { id: 'license', label: 'Lisensi & Paket', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-white text-[#4F46E5] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-500 flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Main Form Area */}
        <div className="lg:col-span-8">
          {activeTab === 'store' && (
            <div className="bg-white rounded-[3.5rem] border border-slate-200/60 shadow-sm overflow-hidden animate-in fade-in duration-700">
              <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight text-[#0F172A]">Identitas Bisnis</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-wide italic">Detail ini akan muncul pada struk belanja pelanggan Anda.</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm"><Store size={24} /></div>
              </div>

              <form onSubmit={handleUpdateStore} className="p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Nama Toko</label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full h-14 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 outline-none transition-all text-sm font-bold shadow-inner"
                      placeholder="Contoh: Kedai Kopi Mantap"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Kategori Bisnis</label>
                    <select
                      value={storeForm.business_category}
                      onChange={e => setStoreForm({ ...storeForm, business_category: e.target.value })}
                      className="w-full h-14 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 outline-none transition-all text-sm font-bold shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="F&B">F&B (Makanan & Minuman)</option>
                      <option value="Retail">Retail / Toko Klontong</option>
                      <option value="Service">Service / Layanan</option>
                      <option value="Others">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Alamat Lengkap Cabang</label>
                  <textarea
                    rows={3}
                    value={storeForm.address}
                    onChange={e => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-[2rem] p-6 outline-none transition-all text-sm font-bold shadow-inner resize-none"
                    placeholder="Masukkan alamat fisik toko Anda..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Jam Operasional</label>
                  <div className="relative group">
                    <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={storeForm.business_hours}
                      onChange={e => setStoreForm({ ...storeForm, business_hours: e.target.value })}
                      className="w-full h-14 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl pl-14 pr-6 outline-none transition-all text-sm font-bold shadow-inner"
                      placeholder="08:00 - 22:00"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    disabled={submitLoading}
                    className="h-16 px-12 bg-[#4F46E5] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-[#4338CA] transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                  >
                    {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              {/* License Status Card - Full/Premium Style */}
              <div className={`relative overflow-hidden p-12 rounded-[3.5rem] border shadow-2xl flex flex-col md:flex-row justify-between gap-12 ${isTrial ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-white/5 text-white'
                }`}>
                <div className="relative z-10 flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-xl ${isTrial ? 'bg-white text-amber-600' : 'bg-[#4F46E5] text-white animate-pulse'}`}>
                      {isTrial ? <Zap size={28} /> : <Crown size={28} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Paket Saat Ini</p>
                      <h3 className="text-3xl font-black uppercase tracking-tighter">{storeInfo?.license_type || 'TRIAL'} VERSION</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60 px-1">
                      <span>Masa Berlaku</span>
                      <span className="text-right">Sisa {storeInfo?.license_days_remaining || 0} Hari</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isTrial ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (storeInfo?.license_days_remaining || 0) * 3)}%` }}
                      ></div>
                    </div>
                    {!isTrial && (
                      <div className="flex items-center gap-2 text-[10px] font-bold opacity-60">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Status: Lisensi Terproteksi & Aktif
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 md:w-64 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="opacity-40" size={18} />
                      <div>
                        <p className="text-[8px] font-black uppercase opacity-50">Tenggat Akhir</p>
                        <p className="text-xs font-black">{storeInfo?.license_expires_at ? new Date(storeInfo.license_expires_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="opacity-40" size={18} />
                      <div>
                        <p className="text-[8px] font-black uppercase opacity-50">Grace Period</p>
                        <p className="text-xs font-black">7 Hari Ekstra</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activation Form */}
              <div className="bg-white rounded-[3.5rem] border border-slate-200/60 shadow-sm p-12">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Key size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-[#0F172A]">Aktivasi Serial Key</h3>
                    <p className="text-sm text-slate-400 font-medium">Masukkan kunci lisensi yang Anda beli dari Admin untuk upgrade/perpanjang.</p>
                  </div>
                </div>

                <form onSubmit={handleActivateLicense} className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 relative group">
                    <Zap size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                      className="w-full h-16 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl pl-16 pr-6 outline-none transition-all text-sm font-black tracking-[0.2em] shadow-inner"
                      placeholder="XXXX - XXXX - XXXX - XXXX"
                    />
                  </div>
                  <button
                    disabled={submitLoading || !licenseKey}
                    className="h-16 px-12 bg-[#0F172A] text-white font-black uppercase tracking-[0.1em] text-[11px] rounded-[2rem] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-30"
                  >
                    {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Upgrade Sekarang
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Usage Limits & Stats */}
        <div className="lg:col-span-4 space-y-10">
          {/* Usage Limit Cards */}
          <div className="bg-white rounded-[3.5rem] border border-slate-200/60 shadow-sm p-10 space-y-10">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight text-[#0F172A]">Limit Penggunaan</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Berdasarkan Lisensi Anda</p>
            </div>

            <div className="space-y-10">
              {/* Product Limit */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><Package size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase leading-none">Produk</p>
                      <p className="text-sm font-black text-[#0F172A] mt-1">{currentProds} <span className="text-slate-300 font-bold">/ {isTrial ? prodLimit : '∞'}</span></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                    {Math.round((currentProds / (isTrial ? prodLimit : currentProds)) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${currentProds >= prodLimit && isTrial ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, (currentProds / (isTrial ? prodLimit : currentProds || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* User Limit */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><Users size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase leading-none">Karyawan</p>
                      <p className="text-sm font-black text-[#0F172A] mt-1">{currentUsers} <span className="text-slate-300 font-bold">/ {isTrial ? userLimit : '∞'}</span></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">
                    {Math.round((currentUsers / (isTrial ? userLimit : currentUsers)) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${currentUsers >= userLimit && isTrial ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min(100, (currentUsers / (isTrial ? userLimit : currentUsers || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {isTrial && (
              <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertCircle size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Limit Mode Aktif</p>
                </div>
                <p className="text-xs text-rose-500/80 font-medium leading-relaxed">
                  Akun Anda dibatasi karena masih menggunakan mode Percobaan. Update lisensi ke Full untuk membuka akses User & Produk tanpa batas.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
