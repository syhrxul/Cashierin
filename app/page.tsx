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
   PlayCircle,
   Check,
   Menu,
   X
} from 'lucide-react';

export default function LandingPage() {
   const [isLogged, setIsLogged] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [stats, setStats] = useState({ stores: 12, users: 50 });

   useEffect(() => {
      const token = localStorage.getItem('token');
      setIsLogged(!!token);

      const handleScroll = () => {
         setScrolled(window.scrollY > 20);
         if (window.scrollY > 20) setMobileMenuOpen(false);
      };

      const fetchStats = async () => {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cashierin.syhrulimtkhan.my.id/api'}/public/stats`);
            const data = await res.json();
            if (data.status === 'success') setStats(data.data);
         } catch (err) { console.error(err); }
      };

      window.addEventListener('scroll', handleScroll);
      fetchStats();
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <div className="min-h-screen bg-[#F8FAFC] font-inter selection:bg-indigo-100 selection:text-indigo-600 relative overflow-x-hidden">
         <nav className={`fixed w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
               <div className={`flex items-center justify-between p-3 rounded-[2rem] transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-slate-200/50' : 'bg-transparent border-transparent'}`}>
                  <div className="flex items-center gap-3 md:gap-4 px-4">
                     <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)] shrink-0">
                        <Store size={22} strokeWidth={2.5} />
                     </div>
                     <span className="text-xl md:text-2xl font-black tracking-tighter text-[#0F172A] uppercase">Cashierin.</span>
                  </div>

                  <div className="hidden lg:flex items-center gap-10">
                     {['Product', 'Enterprise', 'Solution', 'Pricing'].map(nav => (
                        <Link key={nav} href={nav === 'Pricing' ? '#pricing' : '#'} className="text-sm font-black text-[#94A3B8] hover:text-[#4F46E5] transition-all uppercase tracking-widest">{nav}</Link>
                     ))}
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                     <div className="hidden sm:flex items-center gap-3">
                        {isLogged ? (
                           <Link href="/dashboard" className="h-12 px-6 bg-[#4F46E5] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100 text-sm uppercase tracking-widest">
                              Dashboard
                              <ChevronRight size={18} />
                           </Link>
                        ) : (
                           <>
                              <Link href="/login" className="px-6 text-sm font-black text-[#64748B] hover:text-[#0F172A] transition-colors uppercase tracking-widest">Login</Link>
                              <Link href="/register" className="h-12 px-8 bg-[#0F172A] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest">
                                 Get Started
                              </Link>
                           </>
                        )}
                     </div>

                     <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-12 h-12 flex lg:hidden items-center justify-center rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                     >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                     </button>
                  </div>
               </div>
            </div>

            <div className={`lg:hidden absolute top-full left-4 right-4 mt-4 p-8 bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-3xl transition-all duration-500 origin-top ${mobileMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
               <div className="flex flex-col gap-6">
                  {['Product', 'Enterprise', 'Solution', 'Pricing'].map(nav => (
                     <Link key={nav} onClick={() => setMobileMenuOpen(false)} href={nav === 'Pricing' ? '#pricing' : '#'} className="text-lg font-black text-[#0F172A] hover:text-[#4F46E5] transition-all uppercase tracking-widest border-b border-slate-50 pb-4">{nav}</Link>
                  ))}
                  <div className="flex flex-col gap-4 pt-4 sm:hidden">
                     {isLogged ? (
                        <Link href="/dashboard" className="h-16 w-full bg-[#4F46E5] text-white font-black rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 text-sm uppercase tracking-widest">
                           Go to Dashboard
                           <ChevronRight size={18} />
                        </Link>
                     ) : (
                        <>
                           <Link href="/login" className="h-16 w-full bg-slate-50 text-slate-900 font-black rounded-3xl flex items-center justify-center uppercase tracking-widest border border-slate-100">Login</Link>
                           <Link href="/register" className="h-16 w-full bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center uppercase tracking-widest shadow-xl shadow-slate-200">Get Started</Link>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </nav>

         <section className="relative pt-40 md:pt-48 pb-20 md:pb-32 overflow-hidden px-4">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />

            <div className="max-w-7xl mx-auto relative z-10 text-center">
               <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-indigo-100 bg-white shadow-xl shadow-indigo-200/20 mb-8 md:mb-10 animate-in slide-in-from-bottom-5 duration-700">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Next-Gen POS Ecosystem</p>
               </div>

               <h1 className="text-5xl md:text-[92px] font-black text-[#0F172A] tracking-tighter leading-[0.9] mb-8 md:mb-12 max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
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
               </div>
            </div>
         </section>

         <section className="py-40 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-8">
               <div className="text-center mb-32 space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter text-[#0F172A]">Satu Sistem, Beribu Kemudahan.</h2>
                  <p className="text-lg text-[#64748B] font-medium max-w-2xl mx-auto">Kami merancang Cashierin khusus untuk performa tinggi dan keamanan data bisnis Anda.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                     { title: 'Multi-Role Access', desc: 'Sistem manajemen akses untuk  Owner, Manager, hingga Kasir dalam satu aplikasi.', icon: Users, color: 'indigo' },
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

         <section id="pricing" className="py-40 relative backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30" />
            <div className="max-w-7xl mx-auto px-8 relative z-10">
               <div className="text-center mb-32 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-2">
                     <Zap size={14} className="animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Subscription Plan</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter text-[#0F172A]">Pilih Partner Bisnis Anda.</h2>
                  <p className="text-lg text-[#64748B] font-medium max-w-2xl mx-auto italic">Pilih paket yang paling efisien untuk pertumbuhan toko Anda.</p>

                  <div className="flex items-center justify-center gap-4 mt-12">
                     <div className="px-6 py-3 bg-emerald-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 flex items-center gap-3 animate-bounce">
                        <Check size={14} strokeWidth={4} />
                        Trial Gratis Selama 30 Hari
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                     {
                        name: 'Starter',
                        period: '30 Hari',
                        price: '20k',
                        desc: 'Cocok untuk toko yang baru memulai digitalisasi.',
                        features: ['Multi-Role Access', 'Realtime POS', 'Basic Analytics', '1 Branch Store'],
                        popular: false
                     },
                     {
                        name: 'Standard',
                        period: '90 Hari',
                        price: '40k',
                        desc: 'Pilihan paling populer bagi pemilik toko aktif.',
                        features: ['Includes Starter features', 'Priority Support', 'Advanced Analytics', 'Unlimited Products'],
                        popular: true
                     },
                     {
                        name: 'Professional',
                        period: '1 Tahun',
                        price: '50k',
                        desc: 'Investasi terbaik untuk operasional jangka panjang.',
                        features: ['Includes Standard features', 'Custom Domain', 'Export Data Excel/PDF', 'Private Cloud Storage'],
                        popular: false
                     }
                  ].map((plan, i) => (
                     <div key={i} className={`group p-12 rounded-[3.5rem] bg-white border transition-all duration-500 hover:scale-[1.03] relative ${plan.popular ? 'border-2 border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                        {plan.popular && (
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 px-6 bg-indigo-600 text-white flex items-center justify-center rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-indigo-200">
                              Paling Populer
                           </div>
                        )}
                        <div className="mb-10 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.name}</span>
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                              <CheckCircle2 size={20} />
                           </div>
                        </div>
                        <div className="mb-8">
                           <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black text-slate-400 uppercase">Rp</span>
                              <span className="text-6xl font-black text-[#0F172A] tracking-tighter">{plan.price}</span>
                              <span className="text-xs font-bold text-slate-300 uppercase">/ {plan.period}</span>
                           </div>
                           <p className="mt-6 text-slate-400 text-sm font-medium leading-relaxed italic">{plan.desc}</p>
                        </div>

                        <div className="space-y-4 mb-12">
                           {plan.features.map(f => (
                              <div key={f} className="flex items-center gap-3">
                                 <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Check size={10} />
                                 </div>
                                 <span className="text-xs font-bold text-slate-600 tracking-tight">{f}</span>
                              </div>
                           ))}
                        </div>

                        <Link
                           href="/register"
                           className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 ${plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                           Mulai Berlangganan
                           <ChevronRight size={14} />
                        </Link>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Footer / CTA - Final WOW */}
         <section className="py-24 md:py-40 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
               <div className="bg-[#0F172A] rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#4F46E5] opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 opacity-20 blur-[150px] -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 max-w-4xl mx-auto space-y-10 md:space-y-12">
                     <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] md:leading-[0.95]">Siap Mengembangkan Bisnis Anda Hari Ini?</h2>
                     <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed px-4 md:px-0">Bergabunglah dengan <span className="text-white font-black">{stats.stores}+ Toko</span> & <span className="text-white font-black">{stats.users.toLocaleString()}+ Pengguna</span> yang telah mendigitalisasi operasional mereka bersama <span className="text-indigo-400">Cashierin.</span></p>

                     <div className="flex flex-col lg:flex-row items-center justify-center gap-8 pt-6">
                        <Link href="/register" className="h-16 md:h-20 w-full md:w-auto px-10 md:px-14 bg-[#4F46E5] text-white font-black rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 text-base md:text-lg">
                           Mulai Sekarang
                           <ArrowRight size={24} />
                        </Link>
                        <div className="flex items-center gap-4 md:gap-8 px-6 py-4 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                           {[
                              { label: 'Verified', color: '#10B981' },
                              { label: 'Secure', color: '#6366F1' },
                              { label: 'Reliable', color: '#F59E0B' }
                           ].map((s, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                 <CheckCircle2 size={18} style={{ color: s.color }} />
                                 <span className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-none">{s.label}</span>
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
