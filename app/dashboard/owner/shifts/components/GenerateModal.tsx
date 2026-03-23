'use client';

import React from 'react';
import {
  XCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface GenerateModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  templates: any[];
}

export default function GenerateModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  templates
}: GenerateModalProps) {
  const toggleTemplate = (id: number) => {
    const current = form.template_ids || [];
    const next = current.includes(id)
      ? current.filter((i: number) => i !== id)
      : [...current, id];
    setForm({ ...form, template_ids: next });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[4rem] p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner animate-pulse">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] uppercase">Auto-Generate</h3>
            <p className="text-slate-400 text-sm font-medium italic">Sistem akan menyusun jadwal secara pintar.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dari Tanggal</label>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black text-[10px] outline-none focus:ring-2 ring-emerald-50 border-2 border-transparent transition-all uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sampai Tanggal</label>
                <input
                  type="date"
                  required
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black text-[10px] outline-none focus:ring-2 ring-emerald-50 border-2 border-transparent transition-all uppercase"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Template Shift</label>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{(form.template_ids?.length || 0)} Template Terpilih</span>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                {templates.map(tpl => (
                  <div
                    key={tpl.id}
                    onClick={() => toggleTemplate(tpl.id)}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase cursor-pointer border-2 transition-all flex items-center gap-2 ${form.template_ids?.includes(tpl.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-transparent text-slate-400 hover:border-emerald-200'}`}
                  >
                    {form.template_ids?.includes(tpl.id) && <CheckCircle2 size={10} />}
                    {tpl.name}
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="w-full text-center py-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Belum ada template</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100/50 flex gap-4">
            <AlertCircle className="text-emerald-500 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-emerald-800 leading-relaxed italic">
              Sistem akan membaca <span className="underline">Role</span> setiap karyawan dan mendistribusikan jam kerja secara merata sesuai Master Template yang dipilih.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-24 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-6 shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />} Jalankan AI Processor
          </button>
        </form>
      </div>
    </div>
  );
}
