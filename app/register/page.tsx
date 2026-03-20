'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const data = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
        }),
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Daftar Akun</h1>
          <p className="text-[#4B5563] mt-1">Gabung dengan Cashierin untuk kelola tokomu</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#111827] mb-1.5" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Jaka Purwoko"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#111827] mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full focus:ring-2 focus:ring-indigo-500/20"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5" htmlFor="password_confirmation">
              Konfirmasi Password
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 py-2.5 bg-[#4F46E5] text-white font-medium hover:bg-[#4338CA] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Daftar sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-[#4B5563]">Sudah punya akun? </span>
          <Link href="/login" className="text-[#4F46E5] font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
