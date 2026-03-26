'use client';


import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Loader2,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ChevronRight,
  Ticket,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

import Logo from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredStore, setRegisteredStore] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== password_confirmation) {
      setError('Konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isStaffMode ? '/register/invite' : '/register';
      const payload: any = {
        name,
        username: username.toLowerCase().trim(),
        email,
        password,
        password_confirmation,
      };

      if (isStaffMode) {
        payload.invite_code = inviteCode;
      }

      const data: any = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (isStaffMode && data.store_name) {
          setRegisteredStore(data.store_name);
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100/50">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-[#0F172A]">Registrasi Berhasil!</h2>
            {isStaffMode ? (
              <p className="text-slate-400 font-medium leading-relaxed">
                Selamat bergabung di <span className="text-[#4F46E5] font-black">"{registeredStore}"</span>. Akun Anda telah aktif dan siap digunakan untuk transaksi.
              </p>
            ) : (
              <p className="text-slate-400 font-medium leading-relaxed">
                Akun Owner Anda telah aktif. Silakan langsung masuk ke Dashboard untuk membuat toko pertama Anda dan mulai berjualan!
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
            <Loader2 className="animate-spin" size={16} />
            Mengarahkan ke Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">

        {/* Left Info Panel (Identity & Mode Switch) */}
        <div className="md:w-5/12 bg-[#4F46E5] p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-10">
            <div>
              <div className="mb-2">
                <Logo dark />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter leading-[1.1]">
                {isStaffMode ? 'Gabung dengan Tim Toko' : 'Bangun Kerajaan Bisnis Anda'}
              </h2>
              <p className="text-indigo-100/70 text-sm font-medium leading-relaxed max-w-xs">
                {isStaffMode
                  ? 'Dapatkan akun langsung aktif dengan menggunakan kode undangan dari owner toko.'
                  : 'Kelola inventaris, pantau laporan penjualan, dan kembangkan bisnis Anda bersama kami.'}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsStaffMode(!isStaffMode);
                  setError(null);
                }}
                className="w-full h-16 bg-white text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20"
              >
                {isStaffMode ? <UserPlus size={18} /> : <Ticket size={18} />}
                {isStaffMode ? 'Daftar sebagai Owner' : 'Gunakan Kode Undangan'}
              </button>
              <p className="text-center text-[9px] font-bold text-indigo-200 uppercase tracking-widest opacity-60">
                Klik untuk berpindah mode registrasi
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs font-black text-indigo-300 uppercase tracking-widest">
            <Sparkles size={16} className="text-amber-400" />
            Start Your Journey
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tighter">
                {isStaffMode ? 'Registrasi Staf' : 'Registrasi Owner'}
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Lengkapi data autentikasi Anda.</p>
            </div>
            {isStaffMode && (
              <div className="px-4 py-2 bg-amber-50 rounded-xl flex items-center gap-2 border border-amber-100">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Auto Approve</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={18} className="rotate-180" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Optional Invite Code Field */}
              {isStaffMode && (
                <div className="space-y-2 sm:col-span-2 animate-in zoom-in-95 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1" htmlFor="inviteCode">
                    Kode Undangan Toko
                  </label>
                  <div className="relative">
                    <Ticket size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300" />
                    <input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 12))}
                      className="w-full h-14 pl-14 pr-6 bg-indigo-50 border-2 border-indigo-100 rounded-2xl font-black text-sm outline-none focus:ring-4 ring-indigo-100 transition-all placeholder:text-indigo-200"
                      placeholder="CONTOH: INV-12345"
                      maxLength={12}
                      required={isStaffMode}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="name">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all ${isStaffMode ? 'bg-indigo-50/20' : ''}`}
                    placeholder="Contoh: Jaka Purwoko"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="username">
                  UsernameID
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                    placeholder="jakapw"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                    placeholder="email@bisnis.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="password_confirmation">
                  Konfirmasi
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="password_confirmation"
                    type="password"
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-16 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.75rem] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 ${isStaffMode ? 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-100' : 'bg-[#0F172A] hover:bg-black shadow-slate-200'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isStaffMode ? 'Aktifkan Akun Staf' : 'Daftar sebagai Owner'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs font-bold text-slate-400">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
