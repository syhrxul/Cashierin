'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  CalendarDays,
  XCircle,
  ArrowRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OwnerShiftRequestsPage() {
  const [shiftRequests, setShiftRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Approve Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approveForm, setApproveForm] = useState({
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const requestsRes: any = await apiFetch('/shift-requests');
      setShiftRequests(requestsRes.data || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRequest = async (id: number, customData: any = null) => {
    try {
      if (!customData && !confirm('Setujui pengajuan shift ini?')) return;
      setActionLoading(true);
      
      let body;
      if (customData) {
        body = JSON.stringify({
           new_start_time: `${customData.start_date} ${customData.start_time}:00`,
           new_end_time: `${customData.end_date} ${customData.end_time}:00`
        });
      }

      await apiFetch(`/shift-requests/${id}/approve`, { 
        method: 'POST',
        body
      });
      setMessage({ type: 'success', text: customData ? 'Jadwal berhasil dipindah & disetujui!' : 'Pengajuan disetujui!' });
      setIsApproveModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      if (!confirm('Tolak pengajuan shift ini?')) return;
      setActionLoading(true);
      await apiFetch(`/shift-requests/${id}/reject`, { method: 'POST' });
      setMessage({ type: 'success', text: 'Pengajuan ditolak!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && shiftRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Riwayat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><CalendarDays size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <CalendarDays size={14} className="fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Riwayat Shift</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#0F172A]">Pertukaran Shift</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg">Pantau dan kelola riwayat perizinan ganti jadwal serta pertukaran shift antar karyawan.</p>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-white p-4 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-200 animate-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
          {shiftRequests.length === 0 ? (
            <div className="py-24 text-center bg-slate-50/50">
              <CalendarDays size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
              <p className="font-black uppercase tracking-widest text-slate-400">Belum ada riwayat tukar shift</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="py-5 px-6 font-black rounded-tl-[2rem]">Tipe</th>
                  <th className="py-5 px-6 font-black">Dari Kasir</th>
                  <th className="py-5 px-6 font-black">Shift & Target</th>
                  <th className="py-5 px-6 font-black">Keterangan</th>
                  <th className="py-5 px-6 font-black">Status</th>
                  <th className="py-5 px-6 font-black rounded-tr-[2rem]">Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {shiftRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="py-6 px-6">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.type === 'swap' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {r.type === 'swap' ? 'Tukar Shift' : 'Ganti Jadwal'}
                      </span>
                    </td>
                    <td className="py-6 px-6 relative">
                      <div className="font-extrabold text-sm text-slate-800">{r.user?.name || 'User ' + r.user_id}</div>
                    </td>
                    <td className="py-6 px-6">
                      {r.shift ? (
                        <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {new Date(r.shift.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                          <span className="text-indigo-400 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {new Date(r.shift.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(r.shift.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : <span className="text-xs text-slate-400">-</span>}
                      {r.type === 'swap' && r.targetUser ? (
                        <div className="font-bold text-indigo-600 mt-2 flex items-center gap-2 text-xs bg-white py-1 px-3 border border-slate-100 shadow-sm rounded-xl max-w-max">
                          <ArrowRight size={12} /> Pindah Ke: {r.targetUser.name}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-xs font-bold text-slate-500 italic max-w-xs leading-relaxed">"{r.reason}"</p>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-2">
                        {r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? <Clock size={16} className="text-blue-500" /> : r.status === 'pending' ? <Clock size={16} className="text-amber-500" /> : r.status === 'approved' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? 'text-blue-500' : r.status === 'pending' ? 'text-amber-500' : r.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? 'Menunggu Rekan' : r.status === 'pending' ? 'Review Owner' : r.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      {r.status === 'pending' && r.type !== 'swap' ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            if (r.type === 'change' && r.shift) {
                               setSelectedRequest(r);
                               const sDate = new Date(r.shift.start_time);
                               const eDate = new Date(r.shift.end_time);
                               // Setup default + 1 hari as suggestion
                               sDate.setDate(sDate.getDate() + 1);
                               eDate.setDate(eDate.getDate() + 1);
                               
                               setApproveForm({
                                  start_date: sDate.toISOString().split('T')[0],
                                  start_time: sDate.toTimeString().slice(0, 5),
                                  end_date: eDate.toISOString().split('T')[0],
                                  end_time: eDate.toTimeString().slice(0, 5),
                               });
                               setIsApproveModalOpen(true);
                            } else {
                               handleApproveRequest(r.id);
                            }
                          }} disabled={actionLoading} className="px-5 h-10 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50">ACC</button>
                          <button onClick={() => handleRejectRequest(r.id)} disabled={actionLoading} className="px-5 h-10 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50">Tolak</button>
                        </div>
                      ) : r.approver ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">Disetujui Oleh</span>
                          <span className="text-xs font-black text-slate-700 bg-slate-50 py-1 px-3 border border-slate-100 rounded-lg max-w-max">{r.approver.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold italic">Auto-Bypass</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Atur Jadwal Pengganti</h3>
            <p className="text-sm font-medium text-slate-400 mb-6">Pilih jadwal pengganti untuk kasir <span className="font-bold text-indigo-600">{selectedRequest.user?.name}</span>.</p>
            
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex gap-3">
              <HelpCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                 <p className="text-xs font-bold text-amber-700">Jadwal Awal: {selectedRequest.shift ? new Date(selectedRequest.shift.start_time).toLocaleDateString('id-ID', {day: 'numeric', month:'long'}) + ' (' + new Date(selectedRequest.shift.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) + ' - ' + new Date(selectedRequest.shift.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) + ')' : '-'}</p>
                 <p className="text-[10px] text-amber-600 font-medium italic">Sistem otomatis merekomendasikan tanggal pengganti H+1 dari jadwal awal. Silakan ubah jika perlu.</p>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Tgl & Jam Mulai Baru</label>
                  <div className="flex gap-2">
                     <input type="date" className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20" value={approveForm.start_date} onChange={e => setApproveForm({...approveForm, start_date: e.target.value})} />
                     <input type="time" className="w-32 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20" value={approveForm.start_time} onChange={e => setApproveForm({...approveForm, start_time: e.target.value})} />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Tgl & Jam Selesai Baru</label>
                  <div className="flex gap-2">
                     <input type="date" className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20" value={approveForm.end_date} onChange={e => setApproveForm({...approveForm, end_date: e.target.value})} />
                     <input type="time" className="w-32 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20" value={approveForm.end_time} onChange={e => setApproveForm({...approveForm, end_time: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsApproveModalOpen(false)} className="flex-1 px-4 h-12 bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Batal</button>
              <button 
                onClick={() => handleApproveRequest(selectedRequest.id, approveForm)}
                disabled={actionLoading}
                className="flex-[2] px-4 h-12 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Menyimpan...' : 'Setujui & Ubah Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
