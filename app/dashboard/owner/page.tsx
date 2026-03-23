'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Activity,
  Box,
  Clock,
  ChevronRight,
  Lock,
  ShieldCheck,
  Store,
  MapPin,
  Briefcase,
  Sparkles,
  Zap,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  // Store Form State
  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    business_hours: '08:00 - 22:00',
    business_category: 'F&B'
  });
  const [submitting, setSubmitting] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes: any = await apiFetch('/user');
        setUser(userRes);

        if (userRes.approval_status === 'approved' && userRes.store_id) {
          try {
            // Fetch stats and info. If it fails with 404, the store is likely deleted.
            const statsData: any = await apiFetch('/owner/dashboard');
            const infoRes: any = await apiFetch('/store/info');

            setStats(statsData.data || statsData);
            if (infoRes) setStoreInfo(infoRes.data || infoRes);
          } catch (err: any) {
            console.warn('Store access failed, likely deleted:', err);
            // If store is 404, we reset store_id so the setup UI shows up
            if (err.message?.includes('404') || err.message?.includes('tidak ditemukan')) {
              const updatedUser = { ...userRes, store_id: null };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Fallback stats
            setStats({
              today_revenue: 0,
              total_inventory: 0,
              active_employees: 0,
              popular_products: []
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res: any = await apiFetch('/stores', {
        method: 'POST',
        body: JSON.stringify({
          ...storeForm,
          user_id: user.id
        })
      });

      const updatedUser = { ...user, store_id: res.data.id };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Success Animation
      setCreationSuccess(true);

      // Redirect after animation
      setTimeout(() => {
        window.location.href = '/dashboard/owner';
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Menyiapkan Workspace Anda...</p>
      </div>
    );
  }

  // SUCCESS SCREEN
  if (creationSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl p-16 text-center space-y-10 animate-in zoom-in-95 duration-500 border border-slate-50">
          <div className="relative">
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100/50">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
            <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-bounce" size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tighter text-[#0F172A]">Toko Berhasil Berdiri!</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              Unit bisnis <span className="text-indigo-600 font-black">"{storeForm.name}"</span> Anda telah resmi terdaftar dalam sistem. Selamat memulai perjalanan bisnis Anda!
            </p>
          </div>
          <div className="pt-4 flex items-center justify-center gap-3 text-indigo-600 font-black uppercase tracking-[0.25em] text-[10px]">
            <Loader2 className="animate-spin" size={16} />
            Mengaktifkan Dashboard...
          </div>
        </div>
      </div>
    );
  }

  // PHASE 1: PENDING APPROVAL
  if (user?.approval_status === 'pending') {
    return (
      <div className="space-y-10 animate-in fade-in duration-1000">
        <div className="bg-white rounded-[4rem] border border-slate-200/60 p-12 lg:p-20 shadow-2xl shadow-indigo-100/20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 opacity-50 blur-[120px] -translate-y-48 translate-x-48" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50">
              <Lock size={48} strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Akses Dashboard Terkunci</h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Halo <span className="text-[#4F46E5] font-black">{user.name}</span>! Pendaftaran Anda telah kami terima. Saat ini akun Owner Anda sedang menunggu tinjauan dari **Administrator (SuperAdmin)**.
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Apa yang Harus Saya Lakukan?</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">Anda tidak perlu melakukan apapun. Kami akan segera mengaktifkan akun Anda dalam waktu maksimal 24 jam. Silakan cek halaman ini secara berkala.</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />
                Waiting for System Approval
              </div>
            </div>
          </div>
        </div>

        {/* Locked Feature Mock (Grayed out) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 opacity-40 grayscale pointer-events-none">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 h-40 flex flex-col justify-end">
              <div className="w-8 h-8 rounded-lg bg-slate-200 mb-4" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PHASE 2: APPROVED BUT NO STORE
  if (user?.approval_status === 'approved' && !user.store_id) {
    return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Akun Anda Aktif!</h1>
            <p className="text-slate-400 font-medium text-lg">Hanya satu langkah terakhir: Daftarkan toko Anda untuk mulai berjualan.</p>
          </div>

          <div className="bg-white rounded-[4rem] border border-slate-200/60 p-12 lg:p-16 shadow-2xl shadow-indigo-100/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Store size={200} />
            </div>

            <form onSubmit={handleCreateStore} className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Bisnis / Toko</label>
                  <div className="relative">
                    <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      required
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 rounded-3xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 border-none transition-all"
                      placeholder="Contoh: Kedai Kopi Nikmat"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori Bisnis</label>
                  <div className="relative">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select
                      value={storeForm.business_category}
                      onChange={(e) => setStoreForm({ ...storeForm, business_category: e.target.value })}
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 rounded-3xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 border-none transition-all appearance-none"
                    >
                      <option value="F&B">Kuliner (F&B)</option>
                      <option value="Retail">Toko Kelontong / Retail</option>
                      <option value="Fashion">Pakaian / Fashion</option>
                      <option value="Services">Jasa / Services</option>
                      <option value="Other">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jam Operasional</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      required
                      value={storeForm.business_hours}
                      onChange={(e) => setStoreForm({ ...storeForm, business_hours: e.target.value })}
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 rounded-3xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 border-none transition-all"
                      placeholder="08:00 - 22:00"
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-6 text-slate-300" size={18} />
                    <textarea
                      required
                      rows={3}
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      className="w-full p-6 pl-14 bg-slate-50 rounded-3xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 border-none transition-all resize-none"
                      placeholder="Jl. Merdeka No. 123, Bandung"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-18 bg-[#4F46E5] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] hover:bg-[#4338CA] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <Zap size={18} />
                    Inisialisasi Toko Anda
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: MAIN VIEW
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* License Warning Banner */}
      {(() => {
        const days = storeInfo?.license_days_remaining;
        const expiresAt = storeInfo?.license_expires_at;
        const status = storeInfo?.status;

        // Calculate days if missing but we have expires_at
        let effectiveDays = days;
        if ((effectiveDays === null || effectiveDays === undefined) && expiresAt) {
          const diff = new Date(expiresAt).getTime() - new Date().getTime();
          effectiveDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        const shouldShow = effectiveDays !== null && effectiveDays !== undefined && effectiveDays < 7 && status !== 'frozen';

        if (!shouldShow) return null;

        return effectiveDays > 0 ? (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-200/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <Clock size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-amber-900 tracking-tight">Lisensi Hampir Berakhir!</h4>
                <p className="text-sm text-amber-700 font-medium font-outfit">Sisa waktu trial/lisensi Anda tinggal <span className="font-black underline">{effectiveDays} hari</span> lagi. Segera perbarui sebelum toko dibekukan.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/owner/settings?tab=license')}
              className="h-12 px-8 bg-amber-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
            >
              Aktivasi Lisensi
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-rose-500/10 to-rose-600/5 border border-rose-200/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-dashed border-2 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                <AlertCircle size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-rose-900 tracking-tight">Lisensi Telah Berakhir!</h4>
                <p className="text-sm text-rose-700 font-medium font-outfit">Anda berada dalam <span className="font-black underline italic">Masa Tenggang (Grace Period)</span>. Segera perbarui lisensi Anda sebelum seluruh akses dashboard dibekukan secara otomatis!</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/owner/settings?tab=license')}
              className="h-12 px-8 bg-rose-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-100 scale-105"
            >
              Perbarui Sekarang
            </button>
          </div>
        );
      })()}

      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <Store size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F46E5] mb-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg inline-block">
              Store Analysis
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Halo, {user?.name}</h1>
            <p className="text-sm text-slate-400 font-medium italic mt-1">Status operasional toko Anda hari ini sangat memuaskan.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/kasir')}
            className="h-14 px-8 bg-[#4F46E5] text-white font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all active:scale-95"
          >
            <ShoppingCart size={19} />
            Buka Kasir (POS)
          </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Revenue (Hari Ini)', val: `Rp ${stats?.today_revenue?.toLocaleString('id-ID')}`, icon: DollarSign, color: 'emerald' },
          { title: 'Total Inventory', val: stats?.total_inventory, icon: Box, color: 'indigo' },
          { title: 'Aktif Staff', val: stats?.active_employees, icon: Users, color: 'amber' },
          { title: 'Pending Order', val: stats?.pending_orders, icon: Clock, color: 'rose' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
              <item.icon size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{item.title}</p>
            <h3 className="text-2xl font-black tracking-tight text-[#0F172A] tabular-nums">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-200/60 p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-2xl font-black tracking-tighter">Penjualan 24 Jam</h3>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#4F46E5] transition-colors cursor-pointer"><Activity size={18} /></div>
            </div>
          </div>
          {/* Simple Graphic Mock */}
          <div className="h-64 flex items-end gap-3 pb-4 relative z-10">
            {[60, 40, 80, 50, 90, 70, 45, 85, 30, 75, 55, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group relative" style={{ height: `${h}%` }}>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300 relative z-10">
            <span>08:00 AM</span>
            <span>12:00 PM</span>
            <span>04:00 PM</span>
            <span>08:00 PM</span>
          </div>
        </div>

      </div>
    </div>
  );
}

