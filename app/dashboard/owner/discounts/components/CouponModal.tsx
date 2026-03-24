'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Tag, Calendar, Info, Users, Package } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coupon?: any;
}

export default function CouponModal({ isOpen, onClose, onSuccess, coupon }: CouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    min_purchase: '0',
    max_uses: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
    product_ids: [] as string[]
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const res: any = await apiFetch('/products');
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    }
    if (isOpen) loadProducts();
  }, [isOpen]);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value.toString(),
        min_purchase: coupon.min_purchase?.toString() || '0',
        max_uses: coupon.max_uses?.toString() || '',
        starts_at: coupon.starts_at ? coupon.starts_at.split('T')[0] : (coupon.starts_at ? coupon.starts_at.split(' ')[0] : ''),
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : (coupon.expires_at ? coupon.expires_at.split(' ')[0] : ''),
        is_active: !!coupon.is_active,
        product_ids: coupon.products ? coupon.products.map((p: any) => p.id.toString()) : []
      });
    } else {
      setFormData({
        code: '',
        name: '',
        type: 'percentage',
        value: '',
        min_purchase: '0',
        max_uses: '',
        starts_at: '',
        expires_at: '',
        is_active: true,
        product_ids: []
      });
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const toggleProduct = (id: string) => {
    setFormData(prev => {
      const ids = prev.product_ids.includes(id)
        ? prev.product_ids.filter(i => i !== id)
        : [...prev.product_ids, id];
      return { ...prev, product_ids: ids };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const storeJson = localStorage.getItem('store');
      const userJson = localStorage.getItem('user');
      const store = storeJson ? JSON.parse(storeJson) : null;
      const user = userJson ? JSON.parse(userJson) : null;

      const storeId = store?.id || user?.store_id;
      if (!storeId) throw new Error('Data unit usaha (Store ID) tidak ditemukan. Hubungi support.');

      const url = coupon ? `/coupons/${coupon.id}` : '/coupons';
      const method = coupon ? 'PUT' : 'POST';

      const body = {
        ...formData,
        store_id: storeId,
        value: parseFloat(formData.value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
      };

      await apiFetch(url, {
        method,
        body: JSON.stringify(body)
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white w-full max-w-xl my-8 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Tag size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{coupon ? 'Edit Kupon' : 'Buat Kupon Baru'}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Kupon & Voucher Diskon</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Kupon</label>
              <input
                type="text"
                placeholder="Contoh: Diskon Gajian"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kode Kupon</label>
              <input
                type="text"
                placeholder="CONTOH: GAJIAN50"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-black tracking-widest text-indigo-600 placeholder:font-normal placeholder:tracking-normal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipe Diskon</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Potongan Harga (Rp)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nilai Diskon</label>
              <input
                type="number"
                placeholder={formData.type === 'percentage' ? '10' : '5000'}
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min. Pembelian (Rp)</label>
              <input
                type="number"
                value={formData.min_purchase}
                onChange={e => setFormData({ ...formData, min_purchase: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kuota (Jumlah Pelanggan)</label>
              <div className="relative">
                <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="number"
                  placeholder="Opsional (Kosong = ꝏ)"
                  value={formData.max_uses}
                  onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Produk Target (Opsional)</label>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar col-span-2">
                <div className="grid grid-cols-1 gap-2">
                  {products.length === 0 && <p className="text-[10px] text-slate-400 italic">Memuat produk...</p>}
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id.toString())}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${formData.product_ids.includes(p.id.toString()) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                    >
                      <Package size={14} />
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 italic ml-1">Jika kosong, berlaku untuk semua produk</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Berlaku Mulai</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="date"
                  value={formData.starts_at}
                  onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Berlaku Sampai</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <Info size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-700">Aktifkan Kupon</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Kasir bisa menggunakan kupon ini</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer scale-90">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none mb-10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (coupon ? 'Simpan Perubahan' : 'Terbitkan Kupon')}
          </button>
        </form>
      </div>
    </div>
  );
}
