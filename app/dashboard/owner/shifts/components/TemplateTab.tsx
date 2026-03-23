'use client';

import React from 'react';
import {
  PlusCircle,
  Settings2,
  Clock,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Edit2
} from 'lucide-react';

interface TemplateTabProps {
  templates: any[];
  onOpenModal: () => void;
  onEditTemplate: (template: any) => void;
  onDeleteTemplate: (id: number) => void;
  storeLimit?: number;
}

export default function TemplateTab({
  templates,
  onOpenModal,
  onEditTemplate,
  onDeleteTemplate,
  storeLimit = 8
}: TemplateTabProps) {
  const calculateDuration = (start: string, end: string) => {
    const s = new Date(`2000-01-01T${start}`);
    let e = new Date(`2000-01-01T${end}`);
    if (e < s) e = new Date(`2000-01-02T${end}`);
    return (e.getTime() - s.getTime()) / (1000 * 60 * 60);
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Master Shift Template</h2>
          <p className="text-sm text-slate-400 font-medium max-w-md">Daftar pola jam kerja standar yang akan digunakan sistem untuk generate jadwal otomatis.</p>
        </div>
        <button
          onClick={onOpenModal}
          className="h-20 px-10 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:shadow-2xl hover:shadow-indigo-100 transition-all active:scale-95"
        >
          <PlusCircle size={24} /> Buat Master Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.length === 0 ? (
          <div className="col-span-full py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-30 italic">
            <Settings2 size={64} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Belum ada template terdaftar</p>
          </div>
        ) : (
          templates.map(tpl => {
            const duration = calculateDuration(tpl.start_time, tpl.end_time);
            const isOverLimit = duration > storeLimit;

            return (
              <div key={tpl.id} className={`bg-white p-10 rounded-[3rem] border-2 shadow-xl shadow-slate-50 hover:border-indigo-200 transition-all group relative overflow-hidden ${isOverLimit ? 'border-rose-100' : 'border-slate-50'}`}>
                {isOverLimit && (
                  <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest py-2 text-center flex items-center justify-center gap-2">
                    <AlertTriangle size={10} /> Melebihi Batas Jam Kerja Toko ({storeLimit} Jam)
                  </div>
                )}
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none select-none">
                  <Clock size={80} />
                </div>
                <div className="flex justify-between items-start mb-8 mt-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${isOverLimit ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Clock size={28} />
                  </div>
                  <div className="flex gap-2 relative z-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTemplate(tpl); }}
                      className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-inner relative z-50"
                      title="Edit Template"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteTemplate(tpl.id); }}
                      className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-inner relative z-50"
                      title="Hapus Template"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h4 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2 uppercase">{tpl.name}</h4>
                <div className={`flex items-center gap-3 font-black text-lg tracking-widest inline-flex px-4 py-1.5 rounded-xl border ${isOverLimit ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                  {tpl.start_time.substring(0, 5)} <ArrowRight size={14} /> {tpl.end_time.substring(0, 5)}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Staffing Requirement:</p>
                    <span className={`text-[10px] font-black bg-slate-50 px-3 py-1 rounded-lg ${isOverLimit ? 'text-rose-500' : 'text-indigo-600'}`}>{duration.toFixed(1)} Jam</span>
                  </div>
                  {tpl.requirements?.map((req: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{req.role}</span>
                      <span className="px-4 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-50 shadow-sm">{req.count} People</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
