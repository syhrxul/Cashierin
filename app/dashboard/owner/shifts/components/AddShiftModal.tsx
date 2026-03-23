'use client';

import React from 'react';
import {
  XCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface AddShiftModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  employees: any[];
}

export default function AddShiftModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  employees
}: AddShiftModalProps) {
  const toggleUser = (id: number) => {
    const newIds = form.user_ids.includes(id)
      ? form.user_ids.filter((i: number) => i !== id)
      : [...form.user_ids, id];
    setForm({ ...form, user_ids: newIds });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[4rem] p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>
        <h3 className="text-4xl font-black tracking-tighter text-[#0F172A] mb-2 uppercase">Atur Jadwal</h3>
        <p className="text-slate-400 text-sm font-medium mb-12">Tentukan plot waktu untuk anggota tim.</p>

        <form onSubmit={onSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Anggota Tim</label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 custom-scrollbar">
              {employees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => toggleUser(emp.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer border-2 flex items-center gap-3 ${form.user_ids.includes(emp.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-transparent hover:border-indigo-100 text-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${form.user_ids.includes(emp.id) ? 'bg-white border-white text-indigo-600' : 'border-slate-200'}`}>
                    {form.user_ids.includes(emp.id) && <CheckCircle2 size={12} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight truncate">{emp.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value, end_date: e.target.value })}
                className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black uppercase text-xs focus:ring-2 ring-indigo-50 outline-none transition-all"
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
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Out</label>
                <input
                  type="time"
                  required
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-24 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />} Simpan Penjadwalan
          </button>
        </form>
      </div>
    </div>
  );
}
