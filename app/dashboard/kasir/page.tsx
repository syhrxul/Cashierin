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
  Sparkles
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Paket'];

export default function KasirPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch store info first to check status
      const infoRes: any = await apiFetch('/store/info').catch((err) => {
        if (err.message?.includes('terdaftar')) throw err;
        return null;
      });
      if (infoRes) setStoreInfo(infoRes.data || infoRes);

      // Then fetch products
      const response: any = await apiFetch('/products');
      const productsList = response.data || (Array.isArray(response) ? response : []);
      setProducts(productsList);
    } catch (err: any) {
      console.error('[POS] Load failed:', err);
      setErrorMsg(err.message || 'Respons sistem gagal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      await apiFetch('/stores/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase().trim() })
      });

      // Success! Refresh the user in layout and then reload the POS data
      const updatedUser: any = await apiFetch('/user');
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setInviteCode('');
      setErrorMsg(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftarkan kode undangan.');
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
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'Semua' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()))
  );


  if (errorMsg) {
    return (
      <div className="h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[4rem] p-16 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8 flex items-center justify-center pt-8 pr-8">
            <Ticket size={48} className="text-indigo-200 rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-50 text-[#4F46E5] rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-indigo-100/50">
              <ShoppingCart size={44} strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-4">Gabung dengan Toko</h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-12 px-6">
              Akun Kasir Anda belum terdaftar di unit manapun. Masukkan <span className="text-[#4F46E5] font-black">Invite Code</span> dari Owner Toko untuk mulai bekerja.
            </p>

            <form onSubmit={handleJoinStore} className="space-y-6">
              <div className="relative group">
                <Ticket size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4F46E5] transition-colors" />
                <input
                  type="text"
                  placeholder="CONTOH: INV-XXXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 12))}
                  className="w-full h-18 pl-18 pr-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.75rem] text-lg font-black tracking-widest outline-none transition-all placeholder:text-slate-200 placeholder:font-normal text-indigo-600"
                  maxLength={12}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || !inviteCode}
                className="w-full h-18 bg-[#4F46E5] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none"
              >
                {isJoining ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Aktivasi Unit & Masuk</>}
              </button>
            </form>

            <p className="mt-10 text-[10px] font-black uppercase tracking-widest text-slate-300">
              Bukan kasir? <button onClick={() => window.location.reload()} className="text-[#4F46E5] hover:underline">Refresh Status</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className={`flex gap-8 h-[calc(100vh-130px)] -mt-2 animate-in fade-in slide-in-from-bottom-4 duration-1000`}>
      {/* Product Selection Center */}
      <div className="flex-1 flex flex-col gap-6 h-full mb-1">
        {/* Header Search & Nav */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/30 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] shadow-sm">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F172A] tracking-tighter">Katalog Produk</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Pilih item untuk ditambahkan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center"><History size={18} /></button>
              <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center"><Info size={18} /></button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4F46E5] transition-colors">
                <Search size={20} />
              </span>
              <input
                type="text"
                placeholder="Cari menu, SKU, atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl outline-none transition-all text-sm font-bold placeholder:text-slate-300 placeholder:font-normal shadow-inner"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 h-12 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                    ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 custom-scrollbar pb-10">
          {loading ? (
            [...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-4 border border-slate-100 h-64 animate-pulse">
                <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4" />
                <div className="h-4 bg-slate-50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-50 rounded w-1/2" />
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 opacity-60">
              <Package size={64} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">Produk Tidak Ditemukan</p>
              <button onClick={() => { setSearch(''); setSelectedCategory('Semua'); }} className="mt-4 text-[#4F46E5] text-xs font-bold hover:underline">Reset Filte</button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-white p-5 rounded-[2.5rem] border border-slate-200/60 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-500 text-left overflow-hidden flex flex-col active:scale-95"
              >
                <div className="w-full aspect-square bg-slate-50 rounded-[1.75rem] mb-5 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-[#4F46E5] transition-all duration-500 relative overflow-hidden">
                  <Package size={48} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <div className="bg-[#4F46E5] text-white p-2 rounded-xl">
                      <Plus size={18} />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-[#0F172A] mb-1 line-clamp-1 truncate group-hover:text-[#4F46E5] transition-colors">{product.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-300 mb-3">{product.category}</p>
                </div>
                <div className="flex justify-between items-end mt-auto">
                  <span className="font-black text-lg text-[#0F172A] tabular-nums group-hover:text-[#4F46E5] transition-colors">Rp {product.price.toLocaleString('id-ID')}</span>
                  <div className="text-[9px] font-black uppercase text-slate-300 px-2 py-0.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">S: {product.stock}</div>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cart & Order Sidebar */}
      <div className="w-[420px] bg-white border border-slate-200/60 rounded-[3rem] flex flex-col shadow-2xl shadow-slate-200/50 overflow-hidden shrink-0 border-l-8 border-l-[#4F46E5]">
        {/* Cart Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#0F172A] tracking-tighter">Order #{Math.floor(Math.random() * 899) + 100}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Kasir Utama</p>
            </div>
          </div>
          <button onClick={() => setCart([])} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Hapus Semua">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <ShoppingCart size={40} className="text-slate-100" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">Pesanan Masih Kosong</p>
              <p className="text-[10px] text-center mt-2 px-12 leading-relaxed">Ketuk produk di katalog untuk mulai melayani pelanggan.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group relative flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="font-black text-[#0F172A] truncate leading-tight group-hover:text-[#4F46E5] transition-colors">{item.name}</h5>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">@ Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="font-black text-[#0F172A] tabular-nums whitespace-nowrap">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-9 h-9 flex items-center justify-center bg-white text-[#0F172A] rounded-xl hover:text-rose-500 transition-all font-black shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-black text-sm min-w-[32px] text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white text-[#0F172A] rounded-xl hover:text-[#4F46E5] transition-all font-black shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-xl hover:bg-rose-50 text-slate-200 hover:text-rose-500 transition-all flex items-center justify-center">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary & Payment */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span className="text-[#0F172A] tabular-nums">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Pajak (PPN 11%)</span>
              <span className="text-[#0F172A] tabular-nums">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200/60">
              <span className="font-black text-xl text-[#0F172A] tracking-tighter">Total Bill</span>
              <span className="font-black text-3xl text-[#4F46E5] tabular-nums">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-14 bg-white border border-slate-200 text-[#0F172A] font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
              <Tag size={18} />
              Diskon
            </button>
            <button className="h-14 bg-white border border-slate-200 text-[#0F172A] font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
              <Receipt size={18} />
              Split
            </button>
          </div>

          <button
            disabled={cart.length === 0}
            className="w-full h-16 bg-[#4F46E5] text-white font-black rounded-3xl hover:bg-[#4338CA] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none text-xl group overflow-hidden"
          >
            <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
            <span>Bayar Sekarang</span>
            <ChevronRight size={20} className="ml-1 opacity-40" />
          </button>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex flex-col items-center gap-1 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <Banknote size={20} />
              <span className="text-[8px] font-black uppercase">Cash</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <CreditCard size={20} />
              <span className="text-[8px] font-black uppercase">Debit</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-100 text-[#4F46E5] transition-all cursor-pointer">
              <Receipt size={20} />
              <span className="text-[8px] font-black uppercase">QRIS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
