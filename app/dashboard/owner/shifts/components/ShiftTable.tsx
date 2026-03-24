'use client';

import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Trash2,
  Clock,
  LayoutGrid,
  Users2,
  Edit2
} from 'lucide-react';

interface ShiftTableProps {
  shifts: any[];
  store?: any;
  selectedShifts: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onDeleteShift: (id: number | number[]) => void;
  onEditShift: (group: any) => void;
  onViewDetail: (group: any) => void;
  calculateHours: (start: string, end: string) => number;
}

export default function ShiftTable({
  shifts,
  store,
  selectedShifts,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteShift,
  onEditShift,
  onViewDetail,
  calculateHours
}: ShiftTableProps) {

  const groupedShifts = React.useMemo(() => {
    const groups: { [key: string]: any } = {};

    shifts.forEach(shift => {
      const key = `${shift.start_time}_${shift.end_time}_${shift.notes || ''}`;
      if (!groups[key]) {
        groups[key] = {
          startTime: shift.start_time,
          endTime: shift.end_time,
          notes: shift.notes,
          employees: [shift.user],
          ids: [shift.id],
        };
      } else {
        groups[key].employees.push(shift.user);
        groups[key].ids.push(shift.id);
      }
    });

    return Object.values(groups).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [shifts]);

  const isAllSelectedInGroup = (ids: number[]) => ids.every(id => selectedShifts.includes(id));
  const isSomeSelectedInGroup = (ids: number[]) => ids.some(id => selectedShifts.includes(id));

  const toggleGroup = (ids: number[]) => {
    const allIn = isAllSelectedInGroup(ids);
    ids.forEach(id => {
      if (allIn) {
        if (selectedShifts.includes(id)) onToggleSelect(id);
      } else {
        if (!selectedShifts.includes(id)) onToggleSelect(id);
      }
    });
  };

  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-10 py-8 w-16 text-center">
                <div
                  onClick={onToggleSelectAll}
                  className={`mx-auto w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer ${selectedShifts.length === shifts.length && shifts.length > 0 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'}`}
                >
                  {selectedShifts.length === shifts.length && shifts.length > 0 && <CheckCircle2 size={12} />}
                </div>
              </th>
              <th className="px-6 py-8">Slot & Karyawan</th>
              <th className="px-10 py-8">Rentang Waktu</th>
              <th className="px-10 py-8 text-center">Durasi</th>
              <th className="px-10 py-8 text-right pr-14">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {groupedShifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-32 text-center opacity-30">
                  <LayoutGrid size={64} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Belum ada jadwal tayang</p>
                </td>
              </tr>
            ) : (
              groupedShifts.map((group, idx) => {
                const hours = calculateHours(group.startTime, group.endTime);
                const isOverLimit = hours > (store?.shift_limit_hours || 8);
                const allSelected = isAllSelectedInGroup(group.ids);
                const someSelected = isSomeSelectedInGroup(group.ids);

                return (
                  <tr
                    key={idx}
                    onClick={() => onViewDetail(group)}
                    className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${allSelected ? 'bg-indigo-50/30' : ''}`}
                  >
                    <td className="px-10 py-8 text-center">
                      <div
                        onClick={() => toggleGroup(group.ids)}
                        className={`mx-auto w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${allSelected ? 'bg-indigo-600 border-indigo-600 text-white' : someSelected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white group-hover:border-indigo-200'}`}
                      >
                        {allSelected && <CheckCircle2 size={12} />}
                        {!allSelected && someSelected && <div className="w-2 h-0.5 bg-indigo-600 rounded-full" />}
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex flex-col gap-3">
                        <div className="flex -space-x-3">
                          {group.employees.slice(0, 5).map((emp: any, i: number) => (
                            <div key={i} title={emp.name} className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm first:ml-0 ring-2 ring-white">
                              {emp.name.charAt(0)}
                            </div>
                          ))}
                          {group.employees.length > 5 && (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                              +{group.employees.length - 5}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users2 size={12} className="text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{group.employees.length} Orang Terdaftar</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-sm font-black text-[#0F172A] tracking-tighter">
                        <span>{new Date(group.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-indigo-600 font-bold">{new Date(group.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-indigo-600 font-bold">{new Date(group.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {group.notes && <p className="text-[9px] text-slate-400 italic mt-1 font-medium">"{group.notes}"</p>}
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className={`inline-flex flex-col items-center px-6 py-1.5 rounded-2xl border-2 ${isOverLimit ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                        <span className="text-lg font-black tracking-tighter">{hours.toFixed(1)}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest -mt-1">{isOverLimit ? 'Over!' : 'Hrs'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right pr-14">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEditShift(group)}
                          className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-inner active:scale-90"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => onDeleteShift(group.ids)}
                          className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-inner active:scale-90"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
