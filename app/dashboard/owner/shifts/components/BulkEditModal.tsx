'use client';

import React from 'react';
import {
  XCircle,
  CheckCircle2,
  Loader2,
  Edit2
} from 'lucide-react';

interface BulkEditModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedCount: number;
}

export default function BulkEditModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  selectedCount
}: BulkEditModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[4rem] p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Edit2 size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-2 uppercase">Edit Massal</h3>
            <p className="text-slate-400 text-sm font-medium italic">Mengubah {selectedCount} jadwal sekaligus.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value, end_date: e.target.value })}
                className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black uppercase text-xs outline-none focus:ring-2 ring-indigo-50 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">In</label>
                <input
                  type="time"
                  required
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-indigo-50 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Out</label>
                <input
                  type="time"
                  required
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-indigo-50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan Baru (Opsional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full h-32 p-6 bg-slate-50 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 ring-indigo-50 transition-all"
              placeholder="Berikan instruksi khusus..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />} Perbarui Semua Jadwal
          </button>
        </form>
      </div>
    </div>
  );
}
