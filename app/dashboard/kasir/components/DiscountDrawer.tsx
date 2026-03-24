'use client';

import {
   X,
   Tag,
   Ticket,
   Gift,
   ChevronRight,
   Info,
   Percent,
   Banknote,
   Package,
   Clock,
   CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface DiscountDrawerProps {
   isOpen: boolean;
   onClose: () => void;
}

export default function DiscountDrawer({ isOpen, onClose }: DiscountDrawerProps) {
   const [activeTab, setActiveTab] = useState<'promo' | 'kupon'>('promo');
   const [loading, setLoading] = useState(false);
   const [promotions, setPromotions] = useState<any[]>([]);
   const [coupons, setCoupons] = useState<any[]>([]);

   useEffect(() => {
      if (isOpen) {
         fetchDiscounts();
      }
   }, [isOpen]);

   const fetchDiscounts = async () => {
      setLoading(true);
      try {
         const [pRes, cRes]: any = await Promise.all([
            apiFetch('/promotions'),
            apiFetch('/coupons')
         ]);
         setPromotions(pRes.data || []);
         setCoupons(cRes.data || []);
      } catch (err) {
         console.error('[Discounts] Failed to fetch:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         {/* Backdrop */}
         <div
            className={`fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
         />

         {/* Drawer */}
         <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[201] shadow-2xl transition-transform duration-500 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Header */}
            <div className="p-8 border-b border-slate-100 shrink-0">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Tag size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Info Diskon</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Katalog Promo & Kupon</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-rose-500"><X size={24} /></button>
               </div>

               {/* Tabs */}
               <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <button
                     onClick={() => setActiveTab('promo')}
                     className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'promo' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     Promosi
                  </button>
                  <button
                     onClick={() => setActiveTab('kupon')}
                     className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'kupon' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     Kupon Toko
                  </button>
               </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
               {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-300">
                     <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Mencari Promo...</p>
                  </div>
               ) : activeTab === 'promo' ? (
                  promotions.length === 0 ? (
                     <div className="py-20 text-center space-y-2 text-slate-300 italic opacity-50">
                        <Gift size={48} className="mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">Belum Ada Promo Aktif</p>
                     </div>
                  ) : promotions.map((p) => (
                     <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-[3rem] -z-0 group-hover:bg-indigo-50/50 transition-colors" />

                        <div className="relative z-10 flex items-start gap-4">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                              {p.discount_type === 'percentage' ? <Percent size={18} /> : <Banknote size={18} />}
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</h4>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest leading-none mt-1 inline-block italic">
                                 {p.discount_type === 'percentage' ? `Diskon ${p.discount_value}%` : `Potongan Rp ${p.discount_value.toLocaleString()}`}
                              </span>
                           </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-50">
                           <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                              <Info size={12} className="shrink-0 mt-0.5 text-slate-300" />
                              <span>Syarat: Minimal belanja Rp {p.min_purchase.toLocaleString()}</span>
                           </div>
                           <div className="flex items-start gap-2 text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                              <Clock size={12} className="shrink-0 mt-0.5 text-slate-300" />
                              <span>Status: {p.status === 'active' ? 'AKTIF' : 'NON-AKTIF'}</span>
                           </div>
                        </div>
                     </div>
                  ))
               ) : (
                  coupons.length === 0 ? (
                     <div className="py-20 text-center space-y-2 text-slate-300 italic opacity-50">
                        <Ticket size={48} className="mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">Belum Ada Kupon Aktif</p>
                     </div>
                  ) : coupons.map((c) => (
                     <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/30 rounded-bl-[4rem] flex items-center justify-end p-4 -z-0">
                           <Ticket size={40} className="text-rose-100 rotate-12" />
                        </div>

                        <div className="relative z-10 space-y-4">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black px-2 py-1 bg-slate-900 text-white rounded-lg tracking-widest group-hover:bg-indigo-600 transition-colors uppercase">{c.code}</span>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-50 py-1 px-2 rounded-lg">KODE KUPON</span>
                              </div>
                              <h4 className="text-base font-black text-slate-800 uppercase tracking-tighter pt-1">{c.name}</h4>
                           </div>

                           <div className="space-y-2 pt-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                 <span>Potongan</span>
                                 <span className="text-emerald-600">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rp ${c.discount_value.toLocaleString()}`}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                 <span>Sisa Kuota</span>
                                 <span className="text-slate-800">{c.usage_limit - c.used_count} x Pakai</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest border-t border-slate-50 pt-2">
                                 <span>Minimal Belanja</span>
                                 <span className="text-slate-900 border-b border-indigo-100">Rp {c.min_purchase.toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 shrink-0 bg-slate-50/50">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-loose italic">Gunakan Diskon Sebelum Selesaikan Pembayaran Untuk Mendapatkan Potongan Harga PPN Tetap 11% Dari Nilai Setelah Diskon.</p>
            </div>

         </div>
      </>
   );
}
