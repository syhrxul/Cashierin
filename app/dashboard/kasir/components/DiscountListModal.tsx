'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Tag, CheckCircle2, AlertCircle, ShoppingCart, Percent, DollarSign, Wallet } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface DiscountItem {
  id: number;
  type: 'coupon' | 'promotion';
  name: string;
  code?: string;
  description: string;
  promoType?: 'bundle' | 'minimum_purchase' | 'buy_x_get_y';
  discountType: 'percentage' | 'fixed' | 'free_product';
  value: number;
  min_purchase: number;
  starts_at: string;
  expires_at: string;
  items?: { product_id: number; quantity: number }[];
  free_product?: { name: string };
  free_product_qty?: number;
  products?: { id: number }[]; // For Coupons targeting products
  is_active: boolean;
}

interface DiscountListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { id: number; price: number; quantity: number }[];
  subtotal: number;
  onApply: (item: DiscountItem, force?: boolean) => void;
  appliedItem?: any;
}

export default function DiscountListModal({ isOpen, onClose, cart, subtotal, onApply, appliedItem }: DiscountListModalProps) {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscounts() {
      if (!isOpen) return;
      setLoading(true);
      try {
        const storeJson = typeof window !== 'undefined' ? localStorage.getItem('store') : null;
        const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const store = storeJson ? JSON.parse(storeJson) : null;
        const user = userJson ? JSON.parse(userJson) : null;
        const storeId = store?.id || user?.store_id;
        const query = storeId ? `?store_id=${storeId}` : '';

        const [promoRes, couponRes]: any = await Promise.all([
          apiFetch(`/promotions${query}`),
          apiFetch(`/coupons${query}`)
        ]);

        const extractData = (res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          if (res.data && Array.isArray(res.data.data)) return res.data.data;
          if (Array.isArray(res.coupons)) return res.coupons;
          if (Array.isArray(res.promotions)) return res.promotions;
          return [];
        };

        const mappedPromos = extractData(promoRes).map((p: any) => ({
          id: p.id,
          type: 'promotion',
          name: p.name,
          description: p.description,
          promoType: p.type,
          discountType: p.discount_type,
          value: parseFloat(p.discount_value) || 0,
          min_purchase: parseFloat(p.min_purchase) || 0,
          starts_at: p.starts_at,
          expires_at: p.expires_at,
          items: p.items,
          free_product: p.free_product || p.freeProduct, // Support both
          free_product_qty: p.free_product_qty,
          is_active: !!p.is_active
        }));

        const mappedCoupons = extractData(couponRes).map((c: any) => ({
          id: c.id,
          type: 'coupon',
          name: c.name,
          code: c.code,
          description: parseFloat(c.min_purchase) > 0 ? `Min. Belanja Rp${parseFloat(c.min_purchase).toLocaleString('id-ID')}` : 'Berlaku untuk semua pembelian',
          discountType: c.type,
          value: parseFloat(c.value) || 0,
          min_purchase: parseFloat(c.min_purchase) || 0,
          starts_at: c.starts_at,
          expires_at: c.expires_at,
          products: c.products,
          is_active: !!c.is_active
        }));

        setDiscounts([...mappedPromos, ...mappedCoupons]);
      } catch (err) {
        console.error('Failed to load discounts', err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscounts();
  }, [isOpen]);

  const checkEligibility = (d: DiscountItem) => {
    // Check Date
    const now = new Date();
    if (d.starts_at && new Date(d.starts_at) > now) return false;
    if (d.expires_at && new Date(d.expires_at) < now) return false;

    // Check Min Purchase
    if (subtotal < d.min_purchase) return false;

    // Check Items (Promotions only for now in this eligibility check)
    if (d.type === 'promotion' && (d.promoType === 'bundle' || d.promoType === 'buy_x_get_y')) {
      if (!d.items) return false;
      return d.items.every(req => {
        const cartItem = cart.find(item => item.id === req.product_id);
        return cartItem && cartItem.quantity >= req.quantity;
      });
    }

    // Check Coupon Product targeting
    if (d.type === 'coupon' && d.products && d.products.length > 0) {
      // Must have at least one of the target products in cart
      const targetIds = d.products.map(p => p.id);
      return cart.some(item => targetIds.includes(item.id));
    }

    return true;
  };

  const handleManualSelect = (d: DiscountItem) => {
    const isEligible = checkEligibility(d);

    if (!isEligible) {
      if (confirm(`Pesan: Syarat kupon/promo "${d.name}" belum terpenuhi.\n\nApakah anda (Kasir) ingin tetap memasangkan diskon ini secara PAKSA?`)) {
        onApply(d, true); // Force apply
      }
    } else {
      onApply(d, false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Diskon</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Pilih kupon/promo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Memeriksa Database...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <ShoppingCart size={48} className="text-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Belum ada promo aktif</p>
            </div>
          ) : (
            discounts.map(d => {
              const isEligible = checkEligibility(d);
              const isApplied = appliedItem?.id === d.id && appliedItem?.type === d.type;

              return (
                <button
                  key={`${d.type}-${d.id}`}
                  onClick={() => handleManualSelect(d)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${isApplied ? 'bg-indigo-600 border-indigo-700 ring-4 ring-indigo-100 scale-[1.03] z-10' : (isEligible ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 shadow-md' : 'bg-slate-50 border-slate-100 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70')}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {d.type === 'promotion' && (
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[8px] font-black text-rose-500">
                          {d.promoType === 'bundle' ? 'B' : d.promoType === 'buy_x_get_y' ? 'XY' : 'MB'}
                        </div>
                      )}
                      <div className="space-y-1">
                        <h4 className={`text-sm font-black uppercase tracking-tight ${isApplied ? 'text-white' : (isEligible ? 'text-slate-900' : 'text-slate-500')}`}>
                          {d.name} {d.code && <span className={`ml-2 px-2 py-0.5 rounded text-[10px] ${isApplied ? 'bg-indigo-500/50 text-white' : 'bg-indigo-600 text-white'}`}>{d.code}</span>}
                        </h4>
                        <p className={`text-[10px] font-bold ${isApplied ? 'text-indigo-100' : 'text-slate-400'}`}>{d.description}</p>
                      </div>
                    </div>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isApplied ? 'bg-white text-indigo-600' : (isEligible ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400')}`}>
                      {isApplied ? <CheckCircle2 size={18} /> : (isEligible ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />)}
                    </div>
                  </div>

                  <div className={`mt-4 pt-4 border-t ${isApplied ? 'border-white/10' : 'border-slate-200/50'} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${isApplied ? 'text-indigo-200' : 'text-slate-400'}`}>Benefit</p>
                      <p className={`text-xs font-black ${isApplied ? 'text-white' : (isEligible ? 'text-rose-600' : 'text-slate-500')}`}>
                        {d.discountType === 'percentage' ? `${d.value}% Off` :
                          d.discountType === 'fixed' ? `Rp${d.value.toLocaleString('id-ID')}` :
                            `Gratis ${d.free_product_qty} ${d.free_product?.name || 'Item'}`}
                      </p>
                    </div>
                  </div>

                  {isApplied && (
                    <div className="absolute top-2 right-12 px-2 py-0.5 bg-indigo-500 rounded text-[8px] font-black text-white uppercase tracking-widest">Terpasang</div>
                  )}
                  {d.is_active === false && (
                    <div className="absolute top-2 right-12 px-2 py-0.5 bg-slate-400 rounded text-[8px] font-black text-white uppercase tracking-widest">Non-Aktif</div>
                  )}
                  {d.expires_at && new Date(d.expires_at) < new Date() && (
                    <div className="absolute top-2 right-12 px-2 py-0.5 bg-rose-500 rounded text-[8px] font-black text-white uppercase tracking-widest">Kadaluarsa</div>
                  )}
                  {!isEligible && !isApplied && d.is_active !== false && (!d.expires_at || new Date(d.expires_at) >= new Date()) && (
                    <div className="absolute top-2 right-12 px-2 py-0.5 bg-slate-200 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest">Syarat Belum Pas</div>
                  )}
                  {!isEligible && !isApplied && new Date(d.expires_at) >= new Date() && (
                    <div className="absolute top-2 right-12 px-2 py-0.5 bg-slate-200 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest">Syarat Belum Pas</div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Tutup Menu</button>
        </div>
      </div>
    </div>
  );
}
