'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, MessageSquare, Clock, CheckCircle2,
  AlertCircle, Image as ImageIcon, Send, X, Loader2,
  ChevronRight, Filter, Search, User, Store, ArrowRight, XCircle, Zap
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function SuperadminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch('/superadmin/support');
      setTickets(res.data || []);
      window.dispatchEvent(new CustomEvent('supportCountUpdate'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, status: string) => {
    try {
      setSubmitLoading(true);
      await apiFetch(`/support/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, admin_feedback: feedbackText })
      });
      fetchTickets();
      setSelectedTicket((prev: any) => ({ ...prev, status, admin_feedback: feedbackText }));
      setFeedbackText('');
      alert(`Status tiket diperbarui ke: ${status.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui tiket.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-14 space-y-12 animate-in fade-in duration-700">

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-12 rounded-[4rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><LifeBuoy size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Zap size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Support Dashboard</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0F172A]">Tickets & Assistance</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg italic leading-relaxed">Kelola semua laporan dari pemilik toko. Berikan respon profesional untuk setiap keluhan atau saran fitur.</p>
        </div>

        <div className="relative z-10 w-full md:w-80 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari user atau judul..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-xs uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Ticket Feed Side Panel */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {['all', 'open', 'in_progress', 'resolved', 'rejected', 'closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 h-12 min-w-[110px] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#0F172A] text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'}`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm md:max-h-[800px] overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30 italic">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Tiket...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-24 text-center opacity-30 italic">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-[10px]">Filter Kosong</p>
              </div>
            ) : filtered.map(t => (
              <div
                key={t.id}
                onClick={() => { setSelectedTicket(t); setFeedbackText(t.admin_feedback || ''); }}
                className={`p-6 md:p-8 border-b border-slate-50 last:border-none transition-all cursor-pointer group hover:bg-indigo-50/20 rounded-[2.5rem] mb-2 ${selectedTicket?.id === t.id ? 'bg-indigo-50/50 ring-2 ring-indigo-100 shadow-inner' : 'bg-transparent'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : t.status === 'rejected' ? 'bg-rose-50 text-rose-600' : t.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t.status.replace('_', ' ')}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic leading-none">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  {!t.is_read_by_admin && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-200" />}
                </div>
                <h3 className="text-xl font-black text-[#0F172A] tracking-tighter uppercase mb-4 group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-lg shadow-indigo-100">{t.user?.name?.[0]}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-700 truncate">{t.user?.name}</p>
                    <p className="text-[9px] font-black text-slate-400 truncate italic">@{t.user?.username}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Details & Multi-Action Panel */}
        <div className="lg:col-span-12 xl:col-span-7">
          {selectedTicket ? (
            <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-3xl space-y-12 animate-in slide-in-from-right-10 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">TIKET #{selectedTicket.id}</div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${selectedTicket.category === 'bug' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{selectedTicket.category}</div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">{selectedTicket.title}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner shrink-0 group"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] mb-2"><MessageSquare size={14} className="text-indigo-600" /> Deskripsi User</div>
                    <div className="bg-slate-50 p-10 rounded-[3rem] text-sm text-slate-600 leading-relaxed italic border border-slate-100 shadow-inner relative">
                      <div className="absolute top-0 left-8 transform -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg"><User size={16} /></div>
                      {selectedTicket.description}
                    </div>
                  </div>

                  {selectedTicket.attachment_url && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] mb-2"><ImageIcon size={14} className="text-indigo-600" /> Evidence / Bukti Foto</div>
                      <img
                        src={selectedTicket.attachment_url}
                        alt="Evidence"
                        className="w-full rounded-[3rem] border-[12px] border-white shadow-3xl hover:scale-[1.03] transition-transform cursor-zoom-in"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] mb-2"><Send size={14} className="text-indigo-600" /> Masukkan Respon / Solusi</div>
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      className="w-full h-64 p-10 bg-slate-50 rounded-[3rem] text-sm font-bold border-none shadow-inner outline-none focus:ring-8 ring-indigo-50/50 transition-all placeholder:text-slate-300 placeholder:italic"
                      placeholder="Hubungi vendor... / Kami telah memperbaiki masalah ini... / Solusi: Silakan coba lakukan X..."
                    />

                    {/* ACTION CENTER - The UI requested */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        disabled={submitLoading || !feedbackText}
                        onClick={() => handleUpdate(selectedTicket.id, 'in_progress')}
                        className="h-20 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-100 disabled:opacity-30 active:scale-95"
                      >
                        <Clock size={20} /> Sedang Diproses
                      </button>

                      <button
                        disabled={submitLoading || !feedbackText}
                        onClick={() => handleUpdate(selectedTicket.id, 'resolved')}
                        className="h-20 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 transition-all hover:bg-emerald-700 shadow-2xl shadow-emerald-100 disabled:opacity-30 active:scale-95"
                      >
                        <CheckCircle2 size={20} /> ACC / SelesaI
                      </button>

                      <button
                        disabled={submitLoading || !feedbackText}
                        onClick={() => handleUpdate(selectedTicket.id, 'rejected')}
                        className="h-20 bg-rose-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 transition-all hover:bg-rose-700 shadow-2xl shadow-rose-100 disabled:opacity-30 active:scale-95 md:col-span-2"
                      >
                        <XCircle size={20} /> Tolak Pesan
                      </button>
                    </div>
                  </div>

                  <div className="p-8 rounded-[3.5rem] bg-[#0F172A] text-white flex items-start gap-5 relative group overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/5"><LifeBuoy size={24} /></div>
                    <div className="space-y-2 relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Pusat Kendali Admin</p>
                      <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic opacity-80">Setiap pembaruan status akan segera memberitahu pemilik toko melalui notifikasi badge pada dashboard mereka.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-[5rem] text-center opacity-30 px-10 animate-pulse">
              <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mb-10"><ArrowRight size={56} className="text-slate-200" /></div>
              <h3 className="text-3xl font-black text-slate-300 uppercase tracking-tight mb-4">Pilih Tiket Untuk Diproses</h3>
              <p className="text-xs font-black text-slate-200 uppercase tracking-[0.3em] leading-relaxed max-w-sm">Gunakan panel kiri untuk melakukan peninjauan terhadap laporan atau saran yang masuk.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
