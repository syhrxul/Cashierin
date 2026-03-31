import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingHero() {
  return (
    <section id="hero" className="relative pt-40 md:pt-48 pb-20 md:pb-32 overflow-hidden px-4">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20 mb-8 md:mb-10 animate-in slide-in-from-bottom-5 duration-700">
          <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Ekosistem POS Generasi Baru</p>
        </div>

        <h1 className="text-5xl md:text-[92px] font-black text-[#0F172A] tracking-tighter leading-[0.9] mb-8 md:mb-12 max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          Kelola Bisnis <span className="text-[#4F46E5]">Ritel</span> Anda dengan Lebih Profesional.
        </h1>

        <p className="text-xl md:text-2xl text-[#64748B] font-medium max-w-3xl mx-auto mb-16 leading-relaxed opacity-80 animate-in fade-in duration-1000 delay-150">
          Satu ekosistem lengkap untuk mengelola transaksi, inventaris, dan karyawan di berbagai cabang dalam satu platform yang cepat dan andal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/register" className="h-20 px-12 bg-[#4F46E5] text-white font-black rounded-[2.5rem] flex items-center gap-4 hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 text-lg active:scale-95">
            Mulai Kembangkan Bisnis Anda
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>
    </section>
  );
}
