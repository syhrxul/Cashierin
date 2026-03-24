'use client';

import {
   Clock,
   Calendar,
   ArrowLeftRight,
   UserCircle,
   History,
   AlertCircle,
   FileText,
   ChevronRight,
   TrendingUp,
   MoreVertical,
   CheckCircle2,
   XCircle,
   Clock3,
   RefreshCcw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function KasirShiftProfilePage() {
   const [loading, setLoading] = useState(true);
   const [schedules, setSchedules] = useState<any[]>([]);
   const [requests, setRequests] = useState<any[]>([]);
   const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
   const [allSchedules, setAllSchedules] = useState<any[]>([]);
   const [otherEmployees, setOtherEmployees] = useState<any[]>([]);
   const [user, setUser] = useState<any>(null);

   // Modals state
   const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
   const [requestType, setRequestType] = useState<'swap' | 'permit'>('swap');
   const [selectedShift, setSelectedShift] = useState<any>(null);
   const [targetUserId, setTargetUserId] = useState('');
   const [reason, setReason] = useState('');
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
         const u = JSON.parse(userJson);
         setUser(u);
         fetchData(u.id);
      }
   }, []);

   const fetchData = async (userId: number) => {
      setLoading(true);
      try {
         const [sRes, rRes, uRes, allS]: any = await Promise.all([
            apiFetch(`/shift-schedules?user_id=${userId}`),
            apiFetch(`/shift-requests`),
            apiFetch('/users'),
            apiFetch('/shift-schedules')
         ]);
         setSchedules(sRes.data || []);

         const allReq = rRes.data || [];
         setRequests(allReq.filter((r: any) => Number(r.user_id) === Number(userId)));
         // Sekarang shift request disimpan sebagai 'pending' dari backend untuk swap, maka kita tampilkan yang statusnya pending atau waiting_target bagi user tujuan
         setIncomingRequests(allReq.filter((r: any) => Number(r.target_user_id) === Number(userId) && (r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap'))));

         setAllSchedules(allS.data || []);
         setOtherEmployees((uRes.data || []).filter((u: any) => Number(u.id) !== Number(userId) && u.approval_status === 'approved'));
      } catch (err) {
         console.error('[Shifts] Load failed:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleApproveIncoming = async (id: number) => {
      try {
         setLoading(true);
         await apiFetch(`/shift-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ store_id: user.store_id }) });
         alert('Berhasil! Anda telah menerima jadwal shift ini tanpa perlu persetujuan Owner.');
         fetchData(user.id);
      } catch (err: any) {
         alert(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleRejectIncoming = async (id: number) => {
      try {
         setLoading(true);
         await apiFetch(`/shift-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ store_id: user.store_id }) });
         fetchData(user.id);
      } catch (err: any) {
         alert(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleRequestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reason) return alert('Alasan harus diisi.');
      if (requestType === 'swap' && !targetUserId) return alert('Pilih rekan untuk tukar shift.');
      if (!user?.store_id) return alert('Data toko tidak ditemukan. Silakan refresh halaman.');
      if (!selectedShift?.id) return alert('Data shift tidak valid.');

      setSubmitting(true);
      try {
         console.log('[Shift Request] Submitting:', {
            store_id: user.store_id,
            type: requestType,
            shift_id: selectedShift.id,
            target_user_id: requestType === 'swap' ? Number(targetUserId) : null,
            reason: reason
         });

         await apiFetch('/shift-requests', {
            method: 'POST',
            body: JSON.stringify({
               store_id: user.store_id,
               type: requestType,
               shift_id: selectedShift.id,
               target_user_id: requestType === 'swap' ? Number(targetUserId) : null,
               reason: reason
            })
         });
         alert(requestType === 'swap'
            ? 'Permintaan diajukan! Menunggu rekan untuk menyetujui agar jadwal otomatis pindah.'
            : 'Permintaan diajukan! Menunggu persetujuan Owner/Manager.');
         setIsRequestModalOpen(false);
         setReason('');
         setTargetUserId('');
         fetchData(user.id);
      } catch (err: any) {
         alert(err.message || 'Gagal mengajukan permintaan.');
      } finally {
         setSubmitting(false);
      }
   };

   const totalWorkHours = schedules.reduce((acc, s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return acc + hours;
   }, 0);

   const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
   };

   const formatTime = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
   };

   return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-[#F1F5F9]/30 min-h-screen">

         {/* Header Profile Summary */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center gap-10 border border-slate-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-20" />
               <div className="w-32 h-32 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0 relative z-10">
                  <UserCircle size={64} strokeWidth={1.5} />
               </div>
               <div className="space-y-3 relative z-10 text-center md:text-left">
                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">{user?.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">{user?.role}</span>
                     <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Status: Aktif</span>
                     <span className="text-slate-400 font-bold text-xs">ID Pegawai: #{user?.id?.toString().padStart(4, '0')}</span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100 text-white flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 transform group-hover:rotate-12 transition-transform opacity-30">
                  <TrendingUp size={80} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total Akumulasi Kerja</p>
                  <h2 className="text-5xl font-black italic tabular-nums">{Math.round(totalWorkHours)} <span className="text-xl italic opacity-60 not-italic">Jam</span></h2>
               </div>
               <p className="text-[10px] font-bold opacity-40 mt-6 leading-relaxed uppercase tracking-widest">Dihitung otomatis berdasarkan shift yang terjadwal & selesai</p>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-10">
               {/* Incoming Requests Section - High priority if exists */}
               {incomingRequests.length > 0 && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-black text-rose-600 uppercase italic tracking-tighter flex items-center gap-3 px-2">
                        <ArrowLeftRight size={24} />
                        Permintaan Tukar Shift (Masuk)
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {incomingRequests.map((r) => (
                           <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-rose-100 shadow-xl shadow-rose-50 space-y-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 font-black italic">
                                    {r.user?.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dari Rekan:</p>
                                    <h4 className="font-black text-slate-800 uppercase italic">{r.user?.name}</h4>
                                 </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-bold text-slate-600 italic">
                                 "{r.reason}"
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                 <button
                                    onClick={() => handleApproveIncoming(r.id)}
                                    className="flex-1 h-12 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                 >
                                    Terima
                                 </button>
                                 <button
                                    onClick={() => handleRejectIncoming(r.id)}
                                    className="flex-1 h-12 bg-white border border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                                 >
                                    Tolak
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Shift Schedule List */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
                        <Clock3 size={24} className="text-indigo-600" />
                        Jadwal Shift Mendatang
                     </h2>
                  </div>

                  <div className="space-y-4">
                     {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)
                     ) : schedules.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3.5rem] border-2 border-dashed border-slate-100 text-center opacity-30">
                           <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                           <p className="font-black uppercase tracking-widest text-slate-400">Belum ada jadwal shift</p>
                        </div>
                     ) : (
                        schedules.map((s) => (
                           <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100 hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                              <div className="flex items-center gap-6">
                                 <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                    <Calendar size={28} />
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="font-black text-slate-800 uppercase italic tracking-tight">{formatDate(s.start_time)}</h4>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                       <Clock size={12} /> {formatTime(s.start_time)} - {formatTime(s.end_time)} ({((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)).toFixed(0)} Jam)
                                    </p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2">
                                 <button
                                    onClick={() => {
                                       setSelectedShift(s);
                                       setRequestType('swap');
                                       setIsRequestModalOpen(true);
                                    }}
                                    className="px-6 h-12 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                 >
                                    <ArrowLeftRight size={14} /> Tukar Shift
                                 </button>
                                 <button
                                    onClick={() => {
                                       setSelectedShift(s);
                                       setRequestType('permit');
                                       setIsRequestModalOpen(true);
                                    }}
                                    className="px-6 h-12 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                 >
                                    <AlertCircle size={14} /> Ganti Jadwal
                                 </button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>

            {/* Right Sidebar: My Requests History */}
            <div className="space-y-6">
               <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3 px-2">
                  <History size={24} className="text-indigo-600" />
                  Status Pengajuan Saya
               </h2>

               <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 divide-y divide-slate-50">
                  {requests.length === 0 ? (
                     <div className="py-20 text-center opacity-20">
                        <FileText size={40} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada pengajuan</p>
                     </div>
                  ) : (
                     requests.map((r) => (
                        <div key={r.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                           <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${r.type === 'swap' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {r.type === 'swap' ? 'Tukar' : 'Ganti Jadwal'}
                              </span>
                              <div className="flex items-center gap-1">
                                 {r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? <Clock3 size={14} className="text-blue-500" /> : r.status === 'pending' ? <Clock3 size={14} className="text-amber-500" /> : r.status === 'approved' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? 'text-blue-500' : r.status === 'pending' ? 'text-amber-500' : r.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {r.status === 'waiting_target' || (r.status === 'pending' && r.type === 'swap') ? 'Menunggu Rekan' : r.status === 'pending' ? 'Review Owner' : r.status}
                                 </span>
                              </div>
                           </div>
                           <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{r.reason}"</p>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>

         {/* Action Modal */}
         {isRequestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-indigo-50/50">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                           {requestType === 'swap' ? <ArrowLeftRight size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">{requestType === 'swap' ? 'Tukar Shift' : 'Ganti Jadwal'}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengajuan Perubahan Kerja</p>
                        </div>
                     </div>
                     <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><XCircle size={24} /></button>
                  </div>

                  <form onSubmit={handleRequestSubmit} className="p-10 space-y-8">
                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <Calendar size={24} className="text-indigo-600 shrink-0" />
                        <div>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Shift Terpilih</p>
                           <p className="text-xs font-black text-slate-700 uppercase italic">
                              {formatDate(selectedShift?.start_time)} ({formatTime(selectedShift?.start_time)})
                           </p>
                        </div>
                     </div>

                     {requestType === 'swap' && (
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Pilih Rekan Pengganti</label>
                           <select
                              value={targetUserId}
                              onChange={e => setTargetUserId(e.target.value)}
                              className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer transition-all"
                           >
                              <option value="">Pilih Jadwal Teman Kasir...</option>
                              {allSchedules
                                 .filter(s => Number(s.user_id) !== Number(user?.id))
                                 .map((s) => {
                                    const employeeName = otherEmployees.find(e => Number(e.id) === Number(s.user_id))?.name || `User #${s.user_id}`;
                                    return (
                                       <option key={s.id} value={s.user_id} className="text-slate-900">
                                          {employeeName} • {formatDate(s.start_time)} ({formatTime(s.start_time)} - {formatTime(s.end_time)})
                                       </option>
                                    );
                                 })}
                           </select>
                        </div>
                     )}

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Alasan {requestType === 'swap' ? 'Pertukaran' : 'Ganti Jadwal'}</label>
                        <textarea
                           value={reason}
                           onChange={e => setReason(e.target.value)}
                           placeholder="Contoh: Ada acara keluarga penting, Sakit, atau Ingin libur..."
                           className="w-full h-32 p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2rem] outline-none font-bold text-slate-700 transition-all resize-none"
                        />
                     </div>

                     <button
                        disabled={submitting}
                        className="w-full h-16 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:bg-slate-200 uppercase tracking-widest text-xs"
                     >
                        {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
                     </button>
                  </form>
               </div>
            </div>
         )}

      </div>
   );
}
