'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone, Loader2, Bell, AlertTriangle, Globe, Store,
  Calendar, User, ChevronRight, Search, Inbox
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function KasirAnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    markAllAsRead();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiFetch('/announcements/read-all', { method: 'POST' });
      window.dispatchEvent(new CustomEvent('announcementCountUpdate'));
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch('/announcements/dashboard');
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6 md:p-14 animate-in fade-in duration-700 min-h-screen">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Megaphone size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Bell size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pusat Informasi</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#0F172A]">Informasi & Berita</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">Pantau semua pengumuman sistem dan instruksi toko untuk memastikan operasional berjalan lancar.</p>
        </div>

        {/* Search Box */}
        <div className="relative z-10 w-full md:w-80 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari berita..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-xs uppercase"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[3.5rem] p-24 text-center border-2 border-dashed border-slate-100">
          <Inbox size={80} className="mx-auto text-slate-200 mb-8" />
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter mb-2">Kotak Masuk Kosong</h3>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Belum ada pengumuman baru untuk Anda saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(a => (
            <div
              key={a.id}
              className={`bg-white rounded-[3rem] p-8 md:p-12 border transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col md:flex-row gap-8 md:items-start group relative overflow-hidden ${a.priority === 'critical' ? 'border-rose-100 hover:border-rose-300' : 'border-slate-100 hover:border-indigo-100 shadow-sm'
                }`}
            >
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner ${a.priority === 'critical' ? 'bg-rose-50 text-rose-500' :
                a.priority === 'important' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'
                }`}>
                {a.priority === 'critical' ? <AlertTriangle size={36} /> : <Megaphone size={36} />}
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] ${a.priority === 'critical' ? 'bg-rose-600 text-white' : 'bg-[#0F172A] text-white'
                    }`}>
                    {a.priority}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {a.scope === 'global' ? <Globe size={12} /> : <Store size={12} />}
                    {a.scope === 'global' ? 'Sistem Global' : 'Instruksi Toko'}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-tight group-hover:text-indigo-600 transition-colors">{a.title}</h2>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{a.content}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-500 shadow-inner">{a.creator?.name?.[0]}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Diterbitkan Oleh</p>
                      <p className="text-xs font-bold text-slate-400 capitalize">{a.creator?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {a.priority === 'critical' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER TIP */}
      <div className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Cashierin News System v1.0</p>
      </div>

    </div>
  );
}
