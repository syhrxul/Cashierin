import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import Logo from '@/components/Logo';

interface LandingFooterCtaProps {
  stores: number;
  users: number;
  footerLinks: string[];
  trustItems: { label: string; color: string }[];
}

export default function LandingFooterCta({
  stores,
  users,
  footerLinks,
  trustItems,
}: LandingFooterCtaProps) {
  return (
    <section id="cta" className="pt-24 md:pt-40 pb-10 md:pb-14 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0F172A] rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 text-center relative overflow-hidden group shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[#4F46E5] opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 opacity-20 blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-10 md:space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Solusi POS Modern untuk Bisnis Bertumbuh
            </div>

            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] md:leading-[0.95]">
              Siap Membawa Operasional Toko Anda ke Level Berikutnya?
            </h2>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed px-4 md:px-0 max-w-3xl mx-auto">
              Bergabunglah dengan <span className="text-white font-black">{stores}+ toko</span> dan <span className="text-white font-black">{users.toLocaleString()}+ pengguna</span> yang telah mempercayakan operasional bisnis mereka bersama <span className="text-indigo-300 font-black">Cashierin</span>.
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 pt-6">
              <Link href="/register" className="h-16 md:h-20 w-full md:w-auto px-10 md:px-14 bg-[#4F46E5] text-white font-black rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 text-base md:text-lg">
                Mulai Sekarang
                <ArrowRight size={24} />
              </Link>
              <div className="flex items-center justify-center gap-4 md:gap-8 px-6 py-4 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 w-full md:w-auto">
                {trustItems.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <CheckCircle2 size={18} style={{ color: item.color }} />
                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-none">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 md:mt-16">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-[2rem] md:rounded-[2.5rem] px-6 md:px-10 py-6 md:py-8 shadow-lg shadow-slate-200/40">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <Logo />
                <div className="hidden sm:block w-px h-10 bg-slate-200" />
                <p className="text-sm text-slate-500 font-medium max-w-md">
                  Platform kasir modern untuk transaksi, inventaris, laporan penjualan, dan manajemen tim dalam satu sistem.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5 md:gap-8">
                {footerLinks.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="text-xs font-black uppercase tracking-widest text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-xs font-bold tracking-wide text-slate-400">
                © 2026 Cashierin Ecosystem. Seluruh hak cipta dilindungi.
              </p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                Built for retail, F&B, and growing local business
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
