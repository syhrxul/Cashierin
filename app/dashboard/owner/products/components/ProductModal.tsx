'use client';

import React from 'react';
import {
  XCircle,
  Package,
  Tag,
  Layers,
  DollarSign,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

interface ProductModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  categories: any[];
  isEdit?: boolean;
}

export default function ProductModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  categories,
  isEdit = false
}: ProductModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[4rem] p-12 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-4">
            <Package size={14} className="fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">{isEdit ? 'Update Inventaris' : 'Tambah Produk Baru'}</span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-[#0F172A] uppercase">{isEdit ? 'Edit Produk' : 'Master Produk'}</h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Tag size={12} /> Nama Produk
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full h-16 px-8 bg-slate-50 rounded-2xl font-black text-sm uppercase placeholder:text-slate-300 outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all"
                placeholder="CONTOH: KOPI LATTE"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers size={12} /> Kategori
              </label>
              <select
                required
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-16 px-8 bg-slate-50 rounded-2xl font-black text-sm uppercase outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <DollarSign size={12} /> Harga Jual (Rp)
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseInt(e.target.value) })}
                className="w-full h-16 px-8 bg-slate-50 rounded-2xl font-black text-lg text-indigo-600 outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all"
                placeholder="0"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Database size={12} /> Unit Stok
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
                className="w-full h-16 px-8 bg-slate-50 rounded-2xl font-black text-lg outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Info size={12} /> Deskripsi (Opsional)
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full h-32 p-8 bg-slate-50 rounded-3xl font-medium text-sm outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all resize-none"
              placeholder="Tambahkan detail produk jika diperlukan..."
            />
          </div>

          <div className="flex items-center gap-6 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${form.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-900">Tayang di Kasir</span>
            </div>
            <div className="h-4 w-px bg-indigo-200" />
            <p className="text-[10px] text-slate-400 font-medium">Jika diaktifkan, produk ini akan muncul di menu kasir POS.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-6 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
            {isEdit ? 'Perbarui Produk' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  );
}
