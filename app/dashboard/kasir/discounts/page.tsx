'use client';

import {
   Tag,
   Ticket,
   Gift,
   Info,
   Percent,
   Banknote,
   Clock,
   ChevronRight,
   TrendingUp,
   AlertCircle,
   RefreshCcw,
   Copy,
   CheckCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function KasirDiscountsPage() {
   const [activeTab, setActiveTab] = useState<'promo' | 'kupon'>('promo');
   const [loading, setLoading] = useState(true);
   const [promotions, setPromotions] = useState<any[]>([]);
   const [coupons, setCoupons] = useState<any[]>([]);
   const [copiedId, setCopiedId] = useState<number | null>(null);

   useEffect(() => {
      fetchDiscounts();
   }, []);

   const fetchDiscounts = async () => {
      setLoading(true);
      try {
         const [pRes, cRes]: any = await Promise.all([
            apiFetch('/promotions'),
            apiFetch('/coupons')
         ]);
         console.log('[Discounts] Data:', { pRes, cRes });
         setPromotions(pRes.data || []);
         setCoupons(cRes.data || []);
      } catch (err) {
         console.error('[Discounts] Error:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleCopy = (code: string, id: number) => {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
   };

   return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-[#F1F5F9]/30 min-h-screen">

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase italic flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 italic">
                     <Tag size={32} />
                  </div>
                  Info Diskon & Promo
               </h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Katalog penawaran aktif untuk pelanggan</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
               <button
                  onClick={fetchDiscounts}
                  className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all flex items-center gap-2 group"
                  title="Refresh Data"
               >
                  <RefreshCcw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Perbarui</span>
               </button>
               <div className="flex p-1.5 bg-white rounded-[2rem] shadow-xl border border-slate-100 shrink-0">
                  <button
                     onClick={() => setActiveTab('promo')}
                     className={`px-10 h-14 rounded-3xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'promo' ? 'bg-[#4F46E5] text-white shadow-2xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                     Promosi Produk
                     {promotions.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">{promotions.length}</span>}
                  </button>
                  <button
                     onClick={() => setActiveTab('kupon')}
                     className={`px-10 h-14 rounded-3xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'kupon' ? 'bg-[#4F46E5] text-white shadow-2xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                     Kupon Belanja
                     {coupons.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">{coupons.length}</span>}
                  </button>
               </div>
            </div>
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
               [1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-white rounded-[3.5rem] border border-slate-50 animate-pulse shadow-xl shadow-slate-100" />
               ))
            ) : activeTab === 'promo' ? (
               promotions.length === 0 ? (
                  <div className="col-span-full py-40 text-center space-y-4 opacity-30">
                     <Gift size={80} className="mx-auto text-slate-200" />
                     <p className="text-xl font-black uppercase tracking-widest text-slate-400 italic">Tidak ada promo aktif saat ini</p>
                  </div>
               ) : (
                  promotions.map((p) => (
                     <div key={p.id} className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-200/50 hover:shadow-indigo-100/50 transition-all flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -z-0 group-hover:bg-indigo-600 transition-colors duration-500 opacity-30 group-hover:opacity-10" />

                        <div className="relative z-10 space-y-6">
                           <div className="flex items-start justify-between">
                              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
                                 {p.discount_type === 'percentage' ? <Percent size={28} /> : <Banknote size={28} />}
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                 {p.status === 'active' ? 'Online' : 'Draft'}
                              </span>
                           </div>

                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">{p.name}</h3>
                              <p className="text-indigo-600 font-black text-lg">
                                 {p.discount_type === 'percentage' ? `Diskon ${p.discount_value}%` : `Potongan Rp ${p.discount_value.toLocaleString('id-ID')}`}
                              </p>
                           </div>

                           <div className="pt-6 border-t border-slate-50 space-y-3">
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                 <TrendingUp size={16} className="text-indigo-300" />
                                 Min. Belanja: <span className="text-slate-700">Rp {p.min_purchase.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                 <AlertCircle size={16} className="text-indigo-300" />
                                 Berlaku: <span className="text-slate-700">Semua Produk*</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )
            ) : (
               coupons.length === 0 ? (
                  <div className="col-span-full py-40 text-center space-y-4 opacity-30">
                     <Ticket size={80} className="mx-auto text-slate-200" />
                     <p className="text-xl font-black uppercase tracking-widest text-slate-400 italic">Tidak ada kupon tersedia</p>
                  </div>
               ) : (
                  coupons.map((c) => (
                     <div key={c.id} className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-200/50 hover:shadow-rose-100/50 transition-all group relative overflow-hidden flex flex-col justify-between h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-12 -mt-12 group-hover:bg-rose-500 transition-colors duration-500 opacity-20 group-hover:opacity-10" />

                        <div className="relative z-10 space-y-8">
                           <div className="flex items-center gap-3">
                              <div className="h-10 px-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black tracking-widest text-xs uppercase shadow-xl group-hover:bg-rose-600 transition-colors">
                                 {c.code}
                              </div>
                              <button
                                 onClick={() => handleCopy(c.code, c.id)}
                                 className={`flex items-center gap-2 px-4 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedId === c.id ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-100'}`}
                              >
                                 {copiedId === c.id ? <CheckCheck size={14} /> : <Copy size={14} />}
                                 {copiedId === c.id ? 'Tersalin' : 'Salin'}
                              </button>
                           </div>

                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">{c.name}</h3>
                              <div className="flex items-center gap-4 text-emerald-600 font-black text-xl">
                                 <TrendingUp size={20} />
                                 {c.type === 'percentage'
                                    ? `${c.value}% OFF`
                                    : `Rp ${(c.value || 0).toLocaleString('id-ID')} OFF`}
                              </div>
                           </div>

                           <div className="pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Minimal</p>
                                 <p className="text-xs font-black text-slate-700 uppercase">Rp {(c.min_purchase || 0).toLocaleString('id-ID')}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sisa Kuota</p>
                                 <p className="text-xs font-black text-slate-700 uppercase">{(c.max_uses || 0) - (c.used_count || 0)} Pengguna</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )
            )}
         </div>

         <div className="mt-12 p-8 bg-white/50 rounded-[3rem] border border-slate-100 text-center space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed italic max-w-2xl mx-auto">
               Gunakan kode kupon atau beri tahu kasir tentang penawaran aktif. Harga total yang tertera di menu kasir sudah otomatis termasuk PPN 11% yang dihitung setelah potongan diskon diterapkan.
            </p>
         </div>

      </div>
   );
}
