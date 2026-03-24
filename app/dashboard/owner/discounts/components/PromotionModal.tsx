'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Calendar, Info, Package, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion?: any;
}

export default function PromotionModal({ isOpen, onClose, onSuccess, promotion }: PromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'bundle',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '0',
    free_product_id: '',
    free_product_qty: '1',
    starts_at: '',
    expires_at: '',
    is_active: true,
    items: [] as { product_id: string; quantity: number }[]
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
    loadProducts();
  }, []);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        type: promotion.type,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value?.toString() || '',
        min_purchase: promotion.min_purchase?.toString() || '0',
        free_product_id: promotion.free_product_id?.toString() || '',
        free_product_qty: promotion.free_product_qty?.toString() || '1',
        starts_at: promotion.starts_at ? promotion.starts_at.split(' ')[0] : '',
        expires_at: promotion.expires_at ? promotion.expires_at.split(' ')[0] : '',
        is_active: !!promotion.is_active,
        items: promotion.items ? promotion.items.map((it: any) => ({
          product_id: it.product_id.toString(),
          quantity: it.quantity
        })) : []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'bundle',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '0',
        free_product_id: '',
        free_product_qty: '1',
        starts_at: '',
        expires_at: '',
        is_active: true,
        items: []
      });
    }
  }, [promotion, isOpen]);

  if (!isOpen) return null;

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
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

      const url = promotion ? `/promotions/${promotion.id}` : '/promotions';
      const method = promotion ? 'PUT' : 'POST';

      const body = {
        ...formData,
        store_id: storeId,
        discount_value: parseFloat(formData.discount_value) || 0,
        min_purchase: parseFloat(formData.min_purchase) || 0,
        free_product_id: formData.free_product_id || null,
        free_product_qty: parseInt(formData.free_product_qty) || null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        items: formData.items.filter(it => it.product_id)
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300 custom-scrollbar">
        <div className="sticky top-0 z-20 p-8 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-100">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{promotion ? 'Edit Promo' : 'Buat Promo Baru'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Promo (Banners)</label>
              <input
                type="text"
                placeholder="Contoh: Beli 2 Teh Kotak Gratis 1 Nabati"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl outline-none transition-all font-black text-rose-600 placeholder:text-slate-300 placeholder:font-normal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pesan / Deskripsi (Opsional)</label>
              <textarea
                placeholder="Pesan yang tampil di bill atau layar kasir..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 p-6 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 resize-none no-scrollbar"
              />
            </div>
          </div>

          {/* Type Logic */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-rose-400 ml-1">Mekanisme Promo</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'bundle' })} className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'bundle' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-rose-50'}`}>Paket Bundle</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'buy_x_get_y' })} className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'buy_x_get_y' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-rose-50'}`}>Beli X Gratis Y</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'minimum_purchase' })} className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'minimum_purchase' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-slate-400 border border-slate-200 hover:bg-rose-50'}`}>Min. Belanja</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jenis Benefit</label>
              <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 appearance-none">
                <option value="percentage">Potongan (%)</option>
                <option value="fixed">Potongan (Rp)</option>
                <option value="free_product">Gratis Produk</option>
              </select>
            </div>

            {formData.discount_type !== 'free_product' ? (
              <div className="space-y-2 text-rose-500">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Nilai Benefit</label>
                <input type="number" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-black" required />
              </div>
            ) : (
              <div className="space-y-2 text-rose-500">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Jumlah Gratisan</label>
                <input type="number" value={formData.free_product_qty} onChange={e => setFormData({ ...formData, free_product_qty: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-black" required />
              </div>
            )}

            {formData.discount_type === 'free_product' && (
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Produk Gratisan</label>
                <select value={formData.free_product_id} onChange={e => setFormData({ ...formData, free_product_id: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 appearance-none">
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {formData.type === 'minimum_purchase' && (
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Syarat Minimal Belanja (Rp)</label>
                <input type="number" value={formData.min_purchase} onChange={e => setFormData({ ...formData, min_purchase: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700" />
              </div>
            )}
          </div>

          {/* Trigger Items */}
          {(formData.type === 'bundle' || formData.type === 'buy_x_get_y') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Produk Syarat Promo</label>
                <button type="button" onClick={addItem} className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Tambah Produk
                </button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 animate-in slide-in-from-right-2 duration-300">
                    <div className="flex-[3]">
                      <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 appearance-none">
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-center" />
                    </div>
                    <button type="button" onClick={() => removeItem(idx)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <div className="p-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center opacity-40">
                    <Package size={32} className="mb-2 text-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Belum ada produk syarat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mulai Tanggal</label>
              <input type="date" value={formData.starts_at} onChange={e => setFormData({ ...formData, starts_at: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selesai Tanggal</label>
              <input type="date" value={formData.expires_at} onChange={e => setFormData({ ...formData, expires_at: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                <Info size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black text-rose-700">Publikasi Promo</p>
                <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">Kasir akan melihat notifikasi jika aktif</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer scale-90">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full h-16 bg-rose-500 text-white font-black rounded-3xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (promotion ? 'Simpan Perubahan' : 'Terbitkan Promo')}
          </button>
        </form>
      </div>
    </div>
  );
}
