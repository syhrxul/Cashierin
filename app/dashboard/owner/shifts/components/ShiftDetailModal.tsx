'use client';

import React from 'react';
import {
  XCircle,
  Clock,
  Users2,
  Calendar,
  User,
  MapPin,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface ShiftDetailModalProps {
  onClose: () => void;
  group: any;
  calculateHours: (start: string, end: string) => number;
}

export default function ShiftDetailModal({
  onClose,
  group,
  calculateHours
}: ShiftDetailModalProps) {
  const hours = calculateHours(group.startTime, group.endTime);

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
            <Clock size={14} className="fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Detail Jadwal Shift</span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-[#0F172A] uppercase">Rincian Shift</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Time & Duration */}
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</p>
                  <p className="text-lg font-black text-[#0F172A]">{new Date(group.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mulai</p>
                  <p className="text-2xl font-black text-indigo-600 italic">{new Date(group.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <ArrowRight size={24} className="text-slate-200" />
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Selesai</p>
                  <p className="text-2xl font-black text-indigo-600 italic">{new Date(group.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
                <Clock size={28} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Durasi Kerja</p>
                  <p className="text-2xl font-black tracking-tighter">{hours.toFixed(1)} Jam</p>
                </div>
              </div>
            </div>

            {group.notes && (
              <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <ClipboardList size={18} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Catatan Khusus</span>
                </div>
                <p className="text-sm font-medium text-amber-900 leading-relaxed italic">"{group.notes}"</p>
              </div>
            )}
          </div>

          {/* Right Column: Employees */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                <Users2 size={20} className="text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Karyawan Bertugas ({group.employees.length})</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {group.employees.map((emp: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-lg font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm uppercase text-[#0F172A] tracking-tighter">{emp.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-md">{emp.role}</span>
                      <span className="text-[9px] font-medium text-slate-400 italic">ID: #{emp.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-12 h-16 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
