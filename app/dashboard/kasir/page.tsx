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
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = (subtotal - discount) * 0.11;
  const total = (subtotal - discount) + tax;

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Get Store Info
      const infoRes: any = await apiFetch('/store/info').catch((err) => {
        if (err.message?.includes('terdaftar')) throw err;
        return null;
      });
      if (infoRes) setStoreInfo(infoRes.data || infoRes);

      // 2. Resolve storeId
      const uRes: any = await apiFetch('/user');
      const storeJson = typeof window !== 'undefined' ? localStorage.getItem('store') : null;
      const store = storeJson ? JSON.parse(storeJson) : null;
      const storeId = store?.id || uRes?.store_id;

      // 3. Fetch POS data
      const [productsRes, categoriesRes, couponRes, promoRes]: any = await Promise.all([
        apiFetch(`/products?store_id=${storeId}`),
        apiFetch(`/categories?store_id=${storeId}`),
        apiFetch(`/coupons?store_id=${storeId}`),
        apiFetch(`/promotions?store_id=${storeId}`)
      ]).catch(err => {
        // Redundant log removal
        throw err;
      });

      const extractData = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (res.data && Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.coupons)) return res.coupons;
        if (Array.isArray(res.promotions)) return res.promotions;
        return [];
      };

      setProducts(extractData(productsRes));
      setCategories(extractData(categoriesRes));

      const promotions = extractData(promoRes).map((p: any) => ({ ...p, type: 'promotion' }));
      const coupons = extractData(couponRes).map((c: any) => ({ ...c, type: 'coupon' }));
      setAvailableDiscounts([...promotions, ...coupons]);

      // 4. Check Shift and Schedules
      try {
        const shiftRes: any = await apiFetch('/shifts/active');
        setActiveShift(shiftRes.data);
      } catch (e) {
        setIsShiftOverlayOpen(true);
      }

      const schedRes: any = await apiFetch('/shift-schedules/current-and-next');
      setScheduleData(schedRes);

    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data kasir.');
    } finally {
      setLoading(false);
    }
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchData();
    setOrderId(Math.floor(Math.random() * 899) + 100);

    // Check initial sidebar state
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    setIsSidebarCollapsed(isCollapsed);

    const handleSidebarToggle = (e: any) => {
      setIsSidebarCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    const interval = setInterval(() => {
      apiFetch('/shift-schedules/current-and-next').then(res => setScheduleData(res)).catch(() => { });
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
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
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Gagal bergabung.');
    } finally {
      setIsJoining(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;

      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        return prev.filter(i => i.id !== id);
      }

      return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
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
          items: cart.map(item => ({ product_id: item.id, price: item.price, quantity: item.quantity }))
        })
      });
      setAppliedCoupon({ ...res.data, type: 'coupon' });
      setDiscount(res.discount_amount);
    } catch (err: any) {
      if (force) {
        const coupon = availableDiscounts.find(d => d.type === 'coupon' && d.code === targetCode);
        if (coupon) {
          const forceDiscount = coupon.type === 'percentage' ? subtotal * (coupon.value / 100) : coupon.value;
          setAppliedCoupon({ ...coupon, type: 'coupon', is_forced: true });
          setDiscount(forceDiscount);
        }
      } else {
        alert(err.message || 'Kupon tidak valid.');
      }
    } finally {
      setCouponCode('');
    }
  };

  const handleApplyDiscount = async (item: any, force: boolean = false) => {
    if (item.type === 'coupon') {
      applyCoupon(item.code, force);
    } else {
      const promoDiscount = item.discount_type === 'percentage' ? subtotal * (item.discount_value / 100) : item.discount_value;
      setAppliedCoupon({ ...item, type: 'promotion', is_forced: force });
      setDiscount(promoDiscount);
    }
  };

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
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl"><Lock size={48} /></div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Akses Terbatas</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{errorMsg}</p>
          </div>
          <form onSubmit={handleJoinStore} className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left ml-1">Kode Undangan Toko</label>
            <div className="flex gap-2">
              <input type="text" placeholder="KODE-..." value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="flex-1 h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-indigo-600" />
              <button disabled={isJoining} className="px-8 h-14 bg-indigo-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:bg-slate-200">{isJoining ? '...' : 'JOIN'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#F1F5F9]/30 relative overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">

        {/* Products Section */}
        <div className={`flex-1 flex flex-col p-3 md:p-8 space-y-3 md:space-y-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500 ${isCartMobileOpen ? 'hidden xl:flex' : 'flex'}`}>
          <AnnouncementOverlay />

          {scheduleData && (
            <div className="space-y-3">
              {scheduleData.just_ended && activeShift && (
                <div className="bg-rose-600 p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 relative overflow-hidden group">
                  <div className="flex items-center gap-4 md:gap-6 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md">
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black tracking-tighter">Shift Berakhir!</h3>
                      <p className="text-rose-100 text-[10px] md:text-sm font-medium">Harap segera tutup sesi.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsClosingModalOpen(true)} className="w-full md:w-auto bg-white text-rose-600 px-6 py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest relative z-10">TUTUP SHIFT</button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
            <div className="space-y-1 hidden md:block">
              <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Sistem Kasir</h1>
              <p className="text-slate-400 font-medium text-[10px] md:text-sm flex items-center gap-2">
                <History size={14} className="hidden sm:inline" /> ID Sesi: {orderId} | {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="flex p-1 bg-white rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 shrink-0 overflow-x-auto no-scrollbar">
              {['Semua', ...categories.map(c => c.name)].map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 md:px-6 h-9 md:h-11 rounded-lg md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#4F46E5] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group sticky top-0 z-30">
            <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4F46E5] transition-colors"><Search className="w-4 h-4 md:w-6 md:h-6" /></span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 md:h-16 pl-12 md:pl-16 pr-6 bg-white border border-slate-100 focus:border-[#4F46E5]/20 rounded-xl md:rounded-3xl outline-none transition-all font-bold text-slate-700 shadow-sm text-xs md:text-base"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 min-[1900px]:grid-cols-5 gap-3 md:gap-6 pb-24 md:pb-10">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 md:h-52 bg-white rounded-2xl md:rounded-3xl border border-slate-50 animate-pulse" />)
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 md:py-20 bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40">
                <X className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mb-4" />
                <p className="font-black text-[10px] md:text-sm uppercase tracking-widest text-slate-400 text-center px-4">Menu Tidak Tersedia</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group h-40 md:h-52 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-50 shadow-md md:shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100 transition-all flex flex-col justify-between text-left relative overflow-hidden active:scale-95"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50/50 rounded-xl md:rounded-2xl flex items-center justify-center text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-300">
                      <Package className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-500">Stok {product.stock}</div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1 relative z-10">
                    <h4 className="font-black text-[#0F172A] leading-tight truncate uppercase text-[11px] md:text-base">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-[#4F46E5] font-black tracking-tight text-[11px] md:text-sm tabular-nums">Rp {product.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Cart Section (Sidebar on XL, Overlay on smaller) */}
        <div
          style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          className={`
            fixed top-0 bottom-0 right-0 xl:relative xl:inset-auto z-[60] xl:z-20
            flex flex-col bg-white xl:border-l border-slate-100 shadow-2xl
            ${isCartMobileOpen ? 'translate-y-0' : 'translate-y-full xl:translate-y-0'}
            ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-72'}
            left-0 xl:left-auto xl:w-[400px] 2xl:w-[450px]
          `}
        >
          <button onClick={() => setIsCartMobileOpen(false)} className="xl:hidden absolute top-4 right-4 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 z-10"><X size={20} /></button>

          <div className="p-6 md:p-10 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4F46E5] text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg"><ShoppingCart size={20} /></div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-[#0F172A] tracking-tighter uppercase">Keranjang</h2>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">{cart.length} Item</p>
                </div>
              </div>
              <button onClick={clearCart} className="p-2 md:p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl md:rounded-2xl transition-all"><Trash2 size={20} /></button>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 font-black text-[10px] md:text-xs">
              <div className="flex items-center gap-3"><User size={16} className="text-slate-400" /> PELANGGAN UMUM</div>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 md:py-6 space-y-4 md:space-y-6 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center translate-y-[-10%] opacity-30 gap-4">
                <ShoppingCart className="w-16 h-16 text-slate-200" />
                <p className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Keranjang Kosong</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="group flex items-center gap-3 md:gap-5 p-2 rounded-2xl md:rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-slate-400 shrink-0"><Package size={20} /></div>
                  <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                    <h4 className="font-black text-[#0F172A] text-xs md:text-sm uppercase truncate pr-2">{item.name}</h4>
                    <p className="text-[10px] md:text-xs font-bold text-indigo-500">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center bg-white rounded-xl md:rounded-2xl p-0.5 md:p-1 shadow-sm border border-slate-100 scale-90 md:scale-100">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Minus size={12} /></button>
                    <span className="w-8 md:w-10 text-center font-black text-xs md:text-sm tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 space-y-4 md:space-y-6 shrink-0">
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Subtotal</span>
                <span className="text-[#0F172A] tabular-nums">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-500 italic">
                  <span>Diskon {appliedCoupon?.name}</span>
                  <span className="tabular-nums">-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 md:pt-4 mt-2 border-t border-slate-200/60">
                <span className="font-black text-base md:text-xl text-[#0F172A] tracking-tighter">TOTAL</span>
                <span className="font-black text-2xl md:text-3xl text-[#4F46E5] tabular-nums">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
              <button onClick={() => setIsPromoModalOpen(true)} className="h-12 md:h-14 bg-white border border-slate-200 text-[#0F172A] font-black rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"><Tag size={16} /> Promo</button>
              <button
                disabled={cart.length === 0}
                onClick={async () => {
                  try {
                    const shiftRes: any = await apiFetch('/shifts/active');
                    setActiveShift(shiftRes.data);
                    setIsPaymentModalOpen(true);
                  } catch (err: any) {
                    setIsShiftOverlayOpen(true);
                  }
                }}
                className="h-12 md:h-14 bg-[#4F46E5] text-white font-black rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                <CreditCard size={18} /> Bayar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Checkout Bar for Mobile/Tablet (non-XL screen) */}
      {cart.length > 0 && !isCartMobileOpen && (
        <div
          style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          className={`xl:hidden fixed bottom-6 left-6 right-6 z-[50] animate-in slide-in-from-bottom-10 duration-500 ${isSidebarCollapsed ? 'lg:left-[104px]' : 'lg:left-[312px]'
            }`}
        >
          <button
            onClick={() => setIsCartMobileOpen(true)}
            className="w-full h-16 bg-[#4F46E5] text-white rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-between px-8 border border-white/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#4F46E5]">{cart.length}</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 leading-none">Total Bill</p>
                <p className="text-lg font-black tabular-nums leading-none mt-1">Rp {total.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
              Lanjut <ChevronRight size={18} />
            </div>
          </button>
        </div>
      )}

      {/* Modals & Overlays - Kept at root level to ensure they cover the full viewport */}
      <DiscountListModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} cart={cart} subtotal={subtotal} onApply={handleApplyDiscount} appliedItem={appliedCoupon} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} cart={cart} subtotal={subtotal} discount={discount} tax={tax} total={total} appliedCoupon={appliedCoupon} onSuccess={clearCart} />
      <ShiftOpeningOverlay isOpen={isShiftOverlayOpen} onSuccess={(s) => { setActiveShift(s); setIsShiftOverlayOpen(false); }} />
      <ShiftClosingModal isOpen={isClosingModalOpen} onClose={() => setIsClosingModalOpen(false)} shift={activeShift} onSuccess={() => { setActiveShift(null); setIsShiftOverlayOpen(true); }} />

    </div>
  );
}
