'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, Store, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [login_id, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Silent check for token to avoid loops while still helping legitimate users
    const token = localStorage.getItem('token');
    if (token && window.location.pathname === '/login') {
      // Don't auto-redirect if there's an error message showing
      if (!error) {
        router.replace('/dashboard');
      }
    }
  }, [router, error]);

  if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    setIsRedirecting(false);

    try {
      console.log('[Login] Attempting login for:', login_id);

      const res: any = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ login_id, password }),
      });

      console.log('[Login] Response received:', res);

      // Robust data normalization
      const data = res.data || res;
      let token = data.token || data.access_token;

      if (token) {
        // Strip 'Bearer ' prefix if the backend accidentally provides it
        if (typeof token === 'string' && token.startsWith('Bearer ')) {
          token = token.replace('Bearer ', '');
        }

        // 1. Storage - Selective clear to avoid disrupting other app state
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Ensure write is synchronous before continuing
        localStorage.setItem('token', token);

        // Unwrap user data
        const rawUser = data.user?.data || data.user;
        const userData = rawUser || {
          name: login_id.split('@')[0],
          role: data.role || 'superadmin',
          approval_status: data.approval_status || 'approved'
        };

        localStorage.setItem('user', JSON.stringify(userData));

        // 2. Visual Feedback - Important for slow redirects
        setIsRedirecting(true);
        console.log('[Login] Storage sync complete. Redirecting...');

        // 3. Redirection - Safari specific handling
        // We use window.location.href for a clean state, and wrapped in a tiny timeout
        // to ensure the browser has finished writing to localStorage and closing the fetch.
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 150);

        return;
      } else {
        console.error('[Login] Missing token in response:', data);
        throw new Error('Server tidak memberikan token akses yang valid.');
      }
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || 'Login gagal. Sila periksa kembali kredensial Anda.');
      setLoading(false);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex min-h-screen font-inter text-[#0F172A]">
      {/* Left Decoration - Minimalist Professional */}
      <div className="hidden lg:flex w-1/2 bg-[#4F46E5] p-24 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-md text-white relative z-10">
          <div className="mb-12">
            <Logo dark className="mb-8" />
            <p className="text-xl text-indigo-100 font-medium leading-relaxed opacity-90">
              Satu sistem untuk mengelola seluruh aspek bisnis ritel dan restoran Anda dengan performa tinggi.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="h-0.5 w-12 bg-white/30 rounded-full" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Enterprise Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Area */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-8 md:p-16">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="mb-12">
            <div className="lg:hidden mb-6">
              <Logo />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-3">Selamat Datang</h2>
            <p className="text-[#64748B] font-medium">Masuklah dengan akun yang sudah didaftarkan.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRedirecting && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl font-bold flex items-center gap-3 animate-pulse">
              <Loader2 size={20} className="animate-spin" />
              <span>Login berhasil! Mengarahkan ke dashboard...</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2 group">
              <label
                htmlFor="login_id"
                className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] group-focus-within:text-[#4F46E5] transition-colors inline-block ml-1"
              >
                ID Login (Email/Username)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#4F46E5] transition-colors">
                  <User size={19} />
                </div>
                <input
                  id="login_id"
                  type="text"
                  autoComplete="username"
                  value={login_id}
                  onChange={(e) => setLoginId(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-[#4F46E5] outline-none transition-all text-sm font-bold placeholder:text-[#CBD5E1] placeholder:font-normal text-[#0F172A]"
                  placeholder="user@cashierin.com"
                  disabled={loading || isRedirecting}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] group-focus-within:text-[#4F46E5] transition-colors"
                >
                  Password
                </label>
                <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] hover:text-[#4338CA]">Lupa Password?</Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#4F46E5] transition-colors">
                  <Lock size={19} />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-[#4F46E5] outline-none transition-all text-sm font-bold placeholder:text-[#CBD5E1] placeholder:font-normal text-[#0F172A]"
                  placeholder="••••••••"
                  disabled={loading || isRedirecting}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || isRedirecting}
              className="w-full h-14 bg-[#4F46E5] text-white font-black rounded-2xl hover:bg-[#4338CA] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 disabled:bg-indigo-300 disabled:shadow-none text-lg mt-8"
            >
              {(loading || isRedirecting) ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>{isRedirecting ? 'Mengarahkan...' : 'Memverifikasi...'}</span>
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </div>

          <p className="mt-12 text-center text-sm text-[#64748B] font-medium">
            Belum punya akun bisnis?{' '}
            <Link href="/register" className="text-[#4F46E5] font-black hover:underline underline-offset-8 transition-all">
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
