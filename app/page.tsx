'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
   ArrowRight,
   Store,
   ShieldCheck,
   Zap,
   BarChart4,
   ChevronRight,
   Layers,
   Users,
   CheckCircle2,
   PlayCircle
} from 'lucide-react';

export default function LandingPage() {
   const [isLogged, setIsLogged] = useState(false);
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('token');
      setIsLogged(!!token);

      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <div className="min-h-screen bg-[#F8FAFC] font-inter selection:bg-indigo-100 selection:text-indigo-600">
         {/* Premium Navbar */}
         <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
               <div className={`flex items-center justify-between p-3 rounded-[2rem] transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-slate-200/50' : 'bg-transparent border-transparent'}`}>
                  <div className="flex items-center gap-4 px-4">
                     <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)]">
                        <Store size={22} strokeWidth={2.5} />
                     </div>
                     <span className="text-2xl font-black tracking-tighter text-[#0F172A] uppercase">Cashierin.</span>
                  </div>

                  <div className="hidden lg:flex items-center gap-10">
                     {['Product', 'Enterprise', 'Solution', 'Pricing'].map(nav => (
                        <Link key={nav} href="#" className="text-sm font-black text-[#94A3B8] hover:text-[#4F46E5] transition-all uppercase tracking-widest">{nav}</Link>
                     ))}
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                     {isLogged ? (
                        <Link href="/dashboard" className="h-12 px-6 bg-[#4F46E5] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100 active:scale-95 text-sm uppercase tracking-widest">
                           Dashboard
                           <ChevronRight size={18} />
                        </Link>
                     ) : (
                        <>
                           <Link href="/login" className="px-6 text-sm font-black text-[#64748B] hover:text-[#0F172A] transition-colors uppercase tracking-widest">Login</Link>
                           <Link href="/register" className="h-12 px-8 bg-[#0F172A] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm uppercase tracking-widest">
                              Get Started
                           </Link>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </nav>

         {/* Hero Section - High Contrast */}
         <section className="relative pt-48 pb-32 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
               <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20 mb-10 animate-in slide-in-from-bottom-5 duration-700">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Next-Gen POS Ecosystem</p>
               </div>

               <h1 className="text-7xl md:text-[92px] font-black text-[#0F172A] tracking-tighter leading-[0.9] mb-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  Manage Your <span className="text-[#4F46E5]">Retail</span> Business Like a Pro.
               </h1>

               <p className="text-xl md:text-2xl text-[#64748B] font-medium max-w-3xl mx-auto mb-16 leading-relaxed opacity-80 animate-in fade-in duration-1000 delay-150">
                  A complete ecosystem to manage transactions, inventories, and staff across multi-branch locations under a single high-performance platform.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <Link href="/register" className="h-20 px-12 bg-[#4F46E5] text-white font-black rounded-[2.5rem] flex items-center gap-4 hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 text-lg active:scale-95">
                     Scale Your Business Now
                     <ArrowRight size={24} />
                  </Link>
                  <button className="h-20 px-10 bg-white border border-slate-200 text-[#0F172A] font-black rounded-[2.5rem] flex items-center gap-4 hover:bg-slate-50 transition-all text-lg active:scale-95 shadow-sm group">
                     <PlayCircle size={24} className="text-[#4F46E5] group-hover:scale-110 transition-transform" />
                     Watch Demo
                  </button>
               </div>
            </div>
         </section>

         {/* Feature Grid - Deep Clean UI */}
         <section className="py-40 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-8">
               <div className="text-center mb-32 space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter text-[#0F172A]">Satu Sistem, Beribu Kemudahan.</h2>
                  <p className="text-lg text-[#64748B] font-medium max-w-2xl mx-auto">Kami merancang Cashierin khusus untuk performa tinggi dan keamanan data bisnis Anda.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                     { title: 'Multi-Role Access', desc: 'Sistem manajemen akses untuk SuperAdmin, Owner, Manager, hingga Kasir dalam satu aplikasi.', icon: Users, color: 'indigo' },
                     { title: 'Realtime POS', desc: 'Proses transaksi secepat kilat dengan antarmuka Point of Sale yang intuitif dan mudah dipelajari.', icon: Zap, color: 'amber' },
                     { title: 'Advanced Analytics', desc: 'Pantau performa penjualan harian, tren produk, dan laporan keuangan secara komprehensif.', icon: BarChart4, color: 'emerald' },
                     { title: 'Enterprise Security', desc: 'Data Anda dilindungi dengan enkripsi tingkat tinggi dan sistem approval yang ketat.', icon: ShieldCheck, color: 'rose' },
                     { title: 'Inventory Sync', desc: 'Sinkronisasi stok barang secara real-time untuk mencegah kehilangan data atau overload order.', icon: Layers, color: 'blue' },
                     { title: 'Cloud-Based', desc: 'Akses data bisnis Anda dari mana saja dan kapan saja secara aman melalui infrastruktur cloud.', icon: Store, color: 'violet' }
                  ].map((f, i) => (
                     <div key={i} className="group p-10 rounded-[3rem] bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                        <div className={`w-16 h-16 rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                           <f.icon size={32} />
                        </div>
                        <h3 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight">{f.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Footer / CTA - Final WOW */}
         <section className="py-40">
            <div className="max-w-7xl mx-auto px-8">
               <div className="bg-[#0F172A] rounded-[5rem] p-16 md:p-24 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#4F46E5] opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 opacity-20 blur-[150px] -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                     <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95]">Siap Mengembangkan Bisnis Anda Hari Ini?</h2>
                     <p className="text-xl text-slate-400 font-medium leading-relaxed">Bergabunglah dengan ribuan pengusaha ritel lainnya yang telah mendigitalisasi operasional kasir mereka bersama Cashierin.</p>

                     <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                        <Link href="/register" className="h-20 px-14 bg-[#4F46E5] text-white font-black rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 text-lg">
                           Mulai Sekarang
                           <ArrowRight size={24} />
                        </Link>
                        <div className="flex items-center gap-6">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                 <CheckCircle2 size={18} className="text-[#10B981]" />
                                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">Safe</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Store size={18} strokeWidth={2.5} />
                     </div>
                     <span className="text-xl font-black tracking-tighter text-[#0F172A] uppercase">Cashierin.</span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-300">© 2026 Cashierin Ecosystem. All rights reserved.</p>
                  <div className="flex items-center gap-8">
                     {['Privacy', 'Terms', 'Support'].map(f => (
                        <Link key={f} href="#" className="text-xs font-black uppercase tracking-widest text-[#94A3B8] hover:text-[#4F46E5] transition-colors">{f}</Link>
                     ))}
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
