'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Receipt,
  Tag,
  Loader2,
  Package,
  X,
  ChevronRight,
  User,
  History,
  Info,
  Lock,
  Ticket,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import DiscountListModal from './components/DiscountListModal';
import PaymentModal from './components/PaymentModal';
import ShiftOpeningOverlay from './components/ShiftOpeningOverlay';
import ShiftClosingModal from './components/ShiftClosingModal';
import AnnouncementOverlay from '@/components/announcements/AnnouncementOverlay';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id?: number | string;
  category_name?: string;
  is_active?: boolean;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function KasirPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>('Semua');
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [orderId, setOrderId] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [isShiftOverlayOpen, setIsShiftOverlayOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = (subtotal - discount) * 0.11;
  const total = (subtotal - discount) + tax;

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const infoRes: any = await apiFetch('/store/info').catch((err) => {
        if (err.message?.includes('terdaftar')) throw err;
        return null;
      });
      if (infoRes) setStoreInfo(infoRes.data || infoRes);

      const [productsRes, categoriesRes, couponRes, promoRes]: any = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
        apiFetch('/coupons?is_active=1'),
        apiFetch('/promotions?is_active=1')
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setAvailableDiscounts([
        ...(promoRes.data || []).map((p: any) => ({ ...p, type: 'promotion' })),
        ...(couponRes.data || []).map((c: any) => ({ ...c, type: 'coupon' }))
      ]);

      // Check Active Shift
      try {
        console.log('[POS] Checking active shift...');
        const shiftRes: any = await apiFetch('/shifts/active');
        console.log('[POS] Active shift found:', shiftRes.data);
        setActiveShift(shiftRes.data);
        setIsShiftOverlayOpen(false);
      } catch (err: any) {
        console.warn('[POS] No active shift or error:', err);
        // If 404 or any error, we show the overlay
        setIsShiftOverlayOpen(true);
      }

      // Check Schedule
      const schedRes: any = await apiFetch('/shift-schedules/current-and-next');
      setScheduleData(schedRes);

    } catch (err: any) {
      console.error('[POS] Load failed:', err);
      setErrorMsg(err.message || 'Respons sistem gagal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    setOrderId(Math.floor(Math.random() * 899) + 100);

    // Refresh schedule every 5 minutes
    const interval = setInterval(() => {
      apiFetch('/shift-schedules/current-and-next').then(res => setScheduleData(res)).catch(() => { });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    setIsJoining(true);
    try {
      await apiFetch('/stores/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode })
      });
      alert('Berhasil bergabung ke toko! Silakan refresh halaman.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal bergabung ke toko.');
    } finally {
      setIsJoining(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    if (newCart.length === 0) setOrderId(Math.floor(Math.random() * 899) + 100);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscount(0);
    setOrderId(Math.floor(Math.random() * 899) + 100);
  };

  const applyCoupon = async (code?: string, force: boolean = false) => {
    const targetCode = code || couponCode;
    if (!targetCode) return;
    try {
      const res: any = await apiFetch(`/coupons/check`, {
        method: 'POST',
        body: JSON.stringify({
          code: targetCode,
          cart_total: subtotal,
          items: cart.map(item => ({
            product_id: item.id,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });
      setAppliedCoupon({ ...res.data, type: 'coupon' });
      setDiscount(res.discount_amount);
      if (!code) alert('Kupon berhasil dipasang!');
    } catch (err: any) {
      if (force) {
        const coupon = availableDiscounts.find(d => d.type === 'coupon' && d.code === targetCode);
        if (coupon) {
          const forceDiscount = coupon.type === 'percentage'
            ? subtotal * (coupon.value / 100)
            : coupon.value;
          setAppliedCoupon({ ...coupon, type: 'coupon', is_forced: true });
          setDiscount(forceDiscount);
          alert('Kupon dipasang secara PAKSA oleh kasir.');
        }
      } else {
        if (!code) alert(err.message || 'Kupon tidak valid.');
      }
    } finally {
      setCouponCode('');
    }
  };

  const handleApplyDiscount = async (item: any, force: boolean = false) => {
    if (item.type === 'coupon') {
      applyCoupon(item.code, force);
    } else {
      const promoDiscount = item.discount_type === 'percentage'
        ? subtotal * (item.discount_value / 100)
        : item.discount_value;

      setAppliedCoupon({ ...item, type: 'promotion', is_forced: force });
      setDiscount(promoDiscount);
      if (force) alert('Promo dipasang secara PAKSA oleh kasir.');
    }
  };

  // Auto-Apply Logic
  useEffect(() => {
    if (cart.length === 0 || appliedCoupon) return;

    const findEligible = () => {
      for (const d of availableDiscounts) {
        let eligible = false;
        if (d.type === 'promotion') {
          if (d.type === 'minimum_purchase') eligible = subtotal >= d.min_purchase;
          else if (d.items) eligible = d.items.every((req: any) => {
            const ci = cart.find(i => i.id === req.product_id);
            return ci && ci.quantity >= req.quantity;
          });
        } else {
          if (subtotal >= (d.min_purchase || 0)) eligible = true;
        }

        if (eligible && !appliedCoupon) {
          handleApplyDiscount(d);
          break;
        }
      }
    };

    const timer = setTimeout(findEligible, 500);
    return () => clearTimeout(timer);
  }, [cart, subtotal, availableDiscounts, appliedCoupon]);

  const filteredProducts = products.filter(p => {
    const isVisible = p.is_active !== false;
    const matchesCategory = selectedCategory === 'Semua' || p.category_id === selectedCategory || p.category_name === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return isVisible && matchesCategory && matchesSearch;
  });

  if (errorMsg) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-lg w-full text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
            <Lock size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Akses Terbatas</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{errorMsg}</p>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shrink-0"><User size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Informasi</p>
              <p className="text-xs text-slate-600 font-bold mt-1">Status: <span className="text-rose-500 uppercase">Belum Terhubung</span>. Harap hubungi Owner toko anda.</p>
            </div>
          </div>

          <form onSubmit={handleJoinStore} className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left ml-1">Kode Undangan Toko</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="KODE-ABC-123"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="flex-1 h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-indigo-600"
              />
              <button
                disabled={isJoining}
                className="px-8 h-14 bg-indigo-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:bg-slate-200"
              >
                {isJoining ? '...' : 'JOIN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-700 bg-[#F1F5F9]/30">
      <AnnouncementOverlay />
      {/* Product Section */}
      <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto custom-scrollbar">

        {/* SHIFT SCHEDULE ALERT */}
        {scheduleData && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            {/* ALERT: SHIFT ENDED BUT STILL LOGGED IN */}
            {scheduleData.just_ended && activeShift && (
              <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 rounded-[2.5rem] shadow-xl shadow-rose-100 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                  <Clock size={160} />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                    <AlertCircle size={32} className="text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter">Waktu Shift Anda Telah Berakhir!</h3>
                    <p className="text-rose-100 text-sm font-medium">Jadwal anda selesai pada {new Date(scheduleData.just_ended.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}. Harap segera tutup shift.</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 relative z-10">
                  {scheduleData.next ? (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Shift Selanjutnya:</p>
                      <p className="text-sm font-black whitespace-nowrap">{new Date(scheduleData.next.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} pukul {new Date(scheduleData.next.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 bg-rose-800/40 px-3 py-1 rounded-lg border border-rose-500/30">Tidak ada shift terjadwal lagi</p>
                  )}
                  <button
                    onClick={() => setIsClosingModalOpen(true)}
                    className="mt-2 bg-white text-rose-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-rose-50 transition-all active:scale-95"
                  >
                    TUTUP SHIFT SEKARANG
                  </button>
                </div>
              </div>
            )}

            {/* INFO: NO CURRENT SCHEDULE BUT SHIFT IS OPEN (OFF-SCHEDULE WORKING) */}
            {!scheduleData.current && !scheduleData.just_ended && activeShift && (
              <div className="bg-amber-50 border border-amber-200/60 p-5 rounded-[2rem] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Info size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Anda sedang bekerja di luar jadwal</p>
                    <p className="text-[10px] font-medium text-amber-600">Pastikan anda sudah mendapat izin dari Manager/Owner untuk shift tambahan ini.</p>
                  </div>
                </div>
                {scheduleData.next && (
                  <div className="text-right border-l border-amber-200 pl-4">
                    <p className="text-[9px] font-black text-amber-400 uppercase">Shift Terdekat:</p>
                    <p className="text-[10px] font-black text-amber-700">{new Date(scheduleData.next.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
            )}

            {/* INFO: JUST ENDED BUT NO OPEN SHIFT (CLEAN FINISH) */}
            {scheduleData.just_ended && !activeShift && (
              <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-[2rem] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Sparkles size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">Shift Anda telah Selesai & Tertutup</p>
                    <p className="text-[10px] font-medium text-emerald-600">Terima kasih atas kerja keras anda hari ini! Silakan hubungi owner jika ada kendala.</p>
                  </div>
                </div>
                {scheduleData.next ? (
                  <div className="text-right bg-white/50 p-2 rounded-xl border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-400 uppercase">Shift Selanjutnya:</p>
                    <p className="text-xs font-black text-emerald-700">{new Date(scheduleData.next.start_time).toLocaleTimeString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-emerald-700 uppercase italic text-right">
                    Toko dapat ditutup sekarang.<br />Hubungi Owner atau Manager untuk jadwal selanjutnya.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter">Sistem Kasir</h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                <History size={14} /> ID Sesi: {orderId} | {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {activeShift && (
                <button
                  onClick={() => setIsClosingModalOpen(true)}
                  className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100/50 shadow-sm"
                >
                  Tutup Shift
                </button>
              )}
            </div>
          </div>
          <div className="flex p-1.5 bg-white rounded-[2rem] shadow-sm border border-slate-100 shrink-0 overflow-x-auto no-scrollbar">
            {['Semua', ...categories.map(c => c.name)].map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 h-11 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#4F46E5] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4F46E5] transition-colors"><Search size={22} /></span>
          <input
            type="text"
            placeholder="Cari menu atau kode SKU produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-16 pl-16 pr-6 bg-white border border-slate-100 focus:border-[#4F46E5]/20 rounded-3xl outline-none transition-all font-bold text-slate-700 shadow-sm shadow-slate-100/50"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-52 bg-white rounded-3xl p-6 border border-slate-50 animate-pulse flex flex-col justify-between">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-50 rounded w-2/3" />
                  <div className="h-4 bg-slate-50 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40">
              <X size={64} className="text-slate-300 mb-4" />
              <p className="font-black uppercase tracking-widest text-slate-400">Produk Tidak Ditemukan</p>
              <button onClick={() => { setSearch(''); setSelectedCategory('Semua'); }} className="mt-4 text-[10px] font-black underline uppercase tracking-widest">Reset Filter</button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group h-52 bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden active:scale-95"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-600 transition-colors duration-500 opacity-20 group-hover:opacity-10" />
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-300 shadow-inner">
                    <Package size={28} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                    Sisa {product.stock}
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="font-black text-[#0F172A] leading-tight truncate uppercase pr-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-indigo-600 font-bold tracking-tight">Rp {product.price.toLocaleString('id-ID')}</p>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-lg transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                      <Plus size={16} className="text-indigo-600" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[450px] bg-white border-l border-slate-100 flex flex-col shadow-2xl relative z-20">
        <div className="p-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#4F46E5] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F172A] tracking-tighter">Keranjang</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cart.length} Item Terpilih</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                title="Bersihkan Keranjang"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={18} />
              </div>
              <span className="text-xs font-black text-slate-700">Pelanggan Umum</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
              <ShoppingCart size={64} className="text-slate-200" />
              <p className="font-black uppercase tracking-widest text-slate-400 text-xs">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group flex items-center gap-5 p-2 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                  <Package size={24} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-black text-[#0F172A] text-sm uppercase truncate pr-4">{item.name}</h4>
                  <p className="text-xs font-bold text-indigo-500 tabular-nums">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Minus size={14} /></button>
                  <span className="w-10 text-center font-black text-sm tabular-nums">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={18} /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span className="text-[#0F172A] tabular-nums">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-500 animate-in slide-in-from-top-2">
                <span>Diskon {appliedCoupon?.name} {appliedCoupon?.is_forced && <span className="text-[8px] border border-emerald-500 px-1 rounded ml-1">FORCED</span>}</span>
                <span className="tabular-nums">-Rp {discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Pajak (PPN 11%)</span>
              <span className="text-[#0F172A] tabular-nums">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200/60">
              <span className="font-black text-xl text-[#0F172A] tracking-tighter">Total Bill</span>
              <span className="font-black text-3xl text-[#4F46E5] tabular-nums">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="KODE KUPON"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 h-14 px-5 bg-white border border-slate-200 rounded-2xl outline-none font-black tracking-widest text-xs"
            />
            <button onClick={() => applyCoupon()} className="h-14 px-6 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Pakai</button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => setIsPromoModalOpen(true)} className="h-14 bg-white border border-slate-200 text-[#0F172A] font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"><Tag size={18} /> Diskon & Promo</button>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={async () => {
              // Quick check for shift status again
              try {
                const shiftRes: any = await apiFetch('/shifts/active');
                setActiveShift(shiftRes.data);
                setIsPaymentModalOpen(true);
              } catch (err: any) {
                console.warn('[POS] No active shift on pay click:', err);
                setIsShiftOverlayOpen(true);
                alert('Anda harus membuka shift terlebih dahulu sebelum melakukan transaksi.');
              }
            }}
            className="w-full h-16 bg-[#4F46E5] text-white font-black rounded-3xl hover:bg-[#4338CA] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none text-xl group overflow-hidden"
          >
            <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
            <span>Bayar Sekarang</span>
            <ChevronRight size={20} className="ml-1 opacity-40" />
          </button>
        </div>
      </div>

      <DiscountListModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        cart={cart}
        subtotal={subtotal}
        onApply={handleApplyDiscount}
        appliedItem={appliedCoupon}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        total={total}
        appliedCoupon={appliedCoupon}
        onSuccess={clearCart}
      />

      <ShiftOpeningOverlay
        isOpen={isShiftOverlayOpen}
        onSuccess={(shift) => {
          setActiveShift(shift);
          setIsShiftOverlayOpen(false);
        }}
      />

      <ShiftClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        shift={activeShift}
        onSuccess={() => {
          setActiveShift(null);
          setIsShiftOverlayOpen(true);
        }}
      />
    </div>
  );
}
