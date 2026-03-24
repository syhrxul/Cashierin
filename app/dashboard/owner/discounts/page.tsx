'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Loader2,
  Edit3,
  Trash2,
  Ticket,
  Sparkles,
  Calendar,
  Users,
  Package,
  ChevronRight,
  Info
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import CouponModal from './components/CouponModal';
import PromotionModal from './components/PromotionModal';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  // Handle ISO format (contains T) or Laravel default (contains space)
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
  try {
    const d = new Date(dateOnly);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateOnly;
  }
};

export default function OwnerDiscountsPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'promotions'>('coupons');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [couponRes, promoRes]: any = await Promise.all([
        apiFetch('/coupons'),
        apiFetch('/promotions')
      ]);
      setCoupons(couponRes.data || []);
      setPromotions(promoRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: 'coupon' | 'promotion', id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await apiFetch(`/${type}s/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Tag size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Diskon</h1>
            <p className="text-slate-400 font-medium">Buat promo paket atau kupon belanja ala minimarket</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              if (activeTab === 'coupons') {
                setSelectedCoupon(null);
                setIsCouponModalOpen(true);
              } else {
                setSelectedPromotion(null);
                setIsPromotionModalOpen(true);
              }
            }}
            className="h-14 px-8 bg-indigo-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Tambah {activeTab === 'coupons' ? 'Kupon' : 'Promo'}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex p-1.5 bg-white rounded-3xl shadow-sm border border-slate-100 shrink-0">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'coupons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Ticket size={16} /> Kupon & Kode
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'promotions' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Sparkles size={16} /> Promosi Toko
          </button>
        </div>

        <div className="flex-1 relative group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
            <Search size={22} />
          </span>
          <input
            type="text"
            placeholder={`Cari nama ${activeTab === 'coupons' ? 'kupon' : 'promo'}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-16 pl-16 pr-6 bg-white border border-slate-100 focus:border-indigo-100 rounded-3xl outline-none transition-all font-bold text-slate-700 shadow-sm shadow-slate-100/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white rounded-[2.5rem] p-8 border border-slate-50 animate-pulse flex flex-col gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl" />
              <div className="h-6 bg-slate-50 rounded w-2/3" />
            </div>
          ))
        ) : (
          activeTab === 'coupons' ? (
            filteredCoupons.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40">
                <Ticket size={64} className="text-slate-300 mb-6" />
                <p className="font-black uppercase tracking-widest text-slate-400">Belum ada kupon</p>
              </div>
            ) : (
              filteredCoupons.map(coupon => (
                <div key={coupon.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-indigo-100 transition-all flex flex-col gap-6 relative overflow-hidden">
                  {/* Status Badge */}
                  <div className={`absolute top-0 right-10 px-4 py-2 rounded-b-2xl font-black text-[8px] uppercase tracking-widest ${coupon.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {coupon.is_active ? '● Aktif' : '○ Non-Aktif'}
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                      <Tag size={36} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate uppercase leading-none mb-2">{coupon.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-black tracking-widest text-xs">
                          {coupon.code}
                        </div>
                        {coupon.products?.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <Package size={10} />
                            {coupon.products.length} Produk
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Benefit</p>
                      <p className="text-sm font-black text-[#0F172A]">
                        {coupon.type === 'percentage' ? `${coupon.value}% Off` : `Rp${coupon.value.toLocaleString('id-ID')}`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Sisa Kuota</p>
                      <p className="text-sm font-black text-[#0F172A] flex items-center gap-1">
                        <Users size={14} className="text-slate-300" />
                        {coupon.max_uses ? (coupon.max_uses - (coupon.used_count || 0)) : 'Unlimited'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Min. Belanja</p>
                      <p className="text-sm font-black text-[#0F172A]">
                        Rp{coupon.min_purchase.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-6 border-t border-slate-50">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold">Mulai: {formatDate(coupon.starts_at) || 'Terbuka'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Info size={12} />
                        <span className="text-[10px] font-bold">Sampai: {formatDate(coupon.expires_at) || 'Tentukan'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedCoupon(coupon); setIsCouponModalOpen(true); }} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm shadow-slate-200">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete('coupon', coupon.id)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-slate-200">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredPromotions.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40">
                <Sparkles size={64} className="text-slate-300 mb-6" />
                <p className="font-black uppercase tracking-widest text-slate-400">Belum ada promo aktif</p>
              </div>
            ) : (
              filteredPromotions.map(promo => (
                <div key={promo.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-rose-100/50 transition-all flex flex-col gap-6 relative overflow-hidden">
                  {/* Promo Style Ribbon */}
                  <div className="absolute top-6 -right-12 rotate-45 bg-rose-500 text-white px-12 py-1 font-black text-[8px] uppercase tracking-widest shadow-lg">
                    PROMO BARU
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform relative">
                      <Sparkles size={36} />
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white border border-rose-100 flex items-center justify-center shadow-lg text-[10px] font-black">
                        {promo.type === 'bundle' ? 'B' : promo.type === 'buy_x_get_y' ? 'XY' : 'MB'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <h3 className="text-xl font-black text-rose-600 tracking-tight leading-none mb-3">{promo.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter italic">
                        {promo.description || 'Syarat dan ketentuan berlaku'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-3">
                        {promo.items?.slice(0, 3).map((it: any, idx: number) => (
                          <div key={idx} className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center text-slate-300 shadow-sm" title={it.product?.name}>
                            <Package size={16} />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-black text-slate-900 tracking-tighter">
                        {promo.items?.length || 0} Produk Terlibat
                        <span className="text-slate-300 ml-2">→</span>
                      </p>
                    </div>

                    <div className="bg-rose-50/50 p-4 rounded-2xl flex items-center justify-between border border-rose-100/20">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Benefit</p>
                        <p className="text-lg font-black text-rose-600 leading-none mt-1">
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}%` :
                            promo.discount_type === 'fixed' ? `Rp${promo.discount_value.toLocaleString('id-ID')}` :
                              `Gratis ${promo.free_product_qty} ${promo.free_product?.name || 'Item'}`}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-6 border-t border-slate-50">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold">Periode: {formatDate(promo.starts_at) || 'Seketika'} s/d {formatDate(promo.expires_at) || '∞'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedPromotion(promo); setIsPromotionModalOpen(true); }} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm shadow-slate-200">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete('promotion', promo.id)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-slate-200">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )
        )}
      </div>

      {/* Modals */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSuccess={fetchData}
        coupon={selectedCoupon}
      />
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onSuccess={fetchData}
        promotion={selectedPromotion}
      />
    </div>
  );
}
