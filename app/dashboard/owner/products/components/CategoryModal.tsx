'use client';

import React from 'react';
import {
  XCircle,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface CategoryModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isEdit?: boolean;
}

export default function CategoryModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  isEdit = false
}: CategoryModalProps) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={24} />
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 mb-3">
            <Layers size={12} className="fill-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-widest">Kategori Menu</span>
          </div>
          <h3 className="text-2xl font-black tracking-tighter text-[#0F172A] uppercase">Kategori</h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Kategori</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-black text-sm uppercase outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all"
              placeholder="CONTOH: MAKANAN UTAMA"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#0F172A] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            {isEdit ? 'Update' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
}
