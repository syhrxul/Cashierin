'use client';

import React, { useMemo } from 'react';
import {
  XCircle,
  Settings2,
  Loader2,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ShiftTemplateModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  storeLimit?: number;
}

export default function ShiftTemplateModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  storeLimit = 8
}: ShiftTemplateModalProps) {

  const duration = useMemo(() => {
    if (!form.start_time || !form.end_time) return 0;
    const s = new Date(`2000-01-01T${form.start_time}`);
    let e = new Date(`2000-01-01T${form.end_time}`);
    if (e < s) e = new Date(`2000-01-02T${form.end_time}`);
    return (e.getTime() - s.getTime()) / (1000 * 60 * 60);
  }, [form.start_time, form.end_time]);

  const isOverLimit = duration > storeLimit;

  const addRequirement = () => {
    setForm({
      ...form,
      requirements: [...form.requirements, { role: 'kasir', count: 1 }]
    });
  };

  const updateRequirement = (index: number, field: string, value: any) => {
    const newReqs = [...form.requirements];
    newReqs[index][field] = value;
    setForm({ ...form, requirements: newReqs });
  };

  const removeRequirement = (index: number) => {
    if (form.requirements.length === 1) return;
    const newReqs = form.requirements.filter((_: any, i: number) => i !== index);
    setForm({ ...form, requirements: newReqs });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[4rem] p-12 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>
        <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-2 uppercase">Master Shift</h3>
        <p className="text-slate-400 text-sm font-medium mb-10">Mendefinisikan jam kerja standar.</p>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Shift</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-16 px-8 bg-slate-50 rounded-2xl font-black text-sm uppercase placeholder:text-slate-300 outline-none focus:ring-2 ring-indigo-50 border-2 border-transparent transition-all"
              placeholder="PAGI / MALAM / MIDDLE"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jam Mulai</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:ring-2 ring-indigo-50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jam Selesai</label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })}
                className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:ring-2 ring-indigo-50 transition-all"
              />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-center justify-between gap-4 transition-all ${isOverLimit ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
            <div className="flex items-center gap-4">
              <Clock size={24} className={isOverLimit ? 'text-rose-500' : 'text-indigo-500'} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Durasi Kerja</span>
                <span className="text-lg font-black tracking-tighter">{duration.toFixed(1)} Jam</span>
              </div>
            </div>
            {isOverLimit && (
              <div className="flex flex-col items-end text-right">
                <AlertTriangle size={20} className="text-rose-500 mb-1" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Melebihi Batas ({storeLimit} Jam)</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kebutuhan Staf</label>
              <button
                type="button"
                onClick={addRequirement}
                className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                + Tambah Role
              </button>
            </div>
            {form.requirements.map((req: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-right-2 duration-300">
                <input
                  value={req.role}
                  onChange={e => updateRequirement(idx, 'role', e.target.value)}
                  className="flex-[2] h-14 px-6 bg-slate-50 rounded-xl font-black text-xs uppercase outline-none focus:bg-white focus:ring-1 ring-indigo-100 transition-all"
                  placeholder="KASIR/MANAGER"
                  list="role-list"
                />
                <input
                  type="number"
                  min="1"
                  value={req.count}
                  onChange={e => updateRequirement(idx, 'count', parseInt(e.target.value))}
                  className="flex-1 h-14 px-6 bg-slate-50 rounded-xl font-black text-xs outline-none focus:bg-white focus:ring-1 ring-indigo-100 transition-all text-center"
                />
                {form.requirements.length > 1 && (
                  <button type="button" onClick={() => removeRequirement(idx)} className="text-rose-300 hover:text-rose-500 text-xl font-bold">×</button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-6 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Settings2 size={24} />} Simpan Master Template
          </button>
        </form>
      </div>
      <datalist id="role-list">
        <option value="kasir" />
        <option value="manager" />
        <option value="admin" />
        <option value="security" />
        <option value="supervisor" />
      </datalist>
    </div>
  );
}
