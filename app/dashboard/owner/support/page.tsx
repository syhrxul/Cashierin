'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2,
  AlertCircle, Image as ImageIcon, Send, X, Loader2,
  ChevronRight, Filter, Search, MoreHorizontal, Zap, Edit2, Trash2, XCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OwnerSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    id: null as number | null,
    title: '',
    description: '',
    category: 'complaint',
    attachment: null as File | null
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch('/support');
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      if (form.attachment) {
        formData.append('attachment', form.attachment);
      }

      if (editMode && form.id) {
        // Laravel PUT with FormData usually needs _method trick
        formData.append('_method', 'PUT');
        await apiFetch(`/support/${form.id}`, {
          method: 'POST', // Use POST with _method PUT for multipart compatibility
          body: formData
        });
      } else {
        await apiFetch('/support', {
          method: 'POST',
          body: formData
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchTickets();
      alert(editMode ? 'Laporan diperbarui!' : 'Laporan berhasil dikirim!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal mengirim laporan.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: null, title: '', description: '', category: 'complaint', attachment: null });
    setEditMode(false);
  };

  const startEdit = (ticket: any) => {
    setForm({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      attachment: null
    });
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    try {
      await apiFetch(`/support/${id}`, { method: 'DELETE' });
      fetchTickets();
      if (selectedTicket?.id === id) setSelectedTicket(null);
      alert('Laporan berhasil dihapus.');
    } catch (err) { console.error(err); }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/support/${id}`, { method: 'PUT' });
      window.dispatchEvent(new CustomEvent('supportCountUpdate'));
    } catch (err) { console.error(err); }
  };

  const viewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    if (!ticket.is_read_by_user) {
      markAsRead(ticket.id);
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, is_read_by_user: true } : t));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><LifeBuoy size={200} /></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <LifeBuoy size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Customer Support</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Pusat Bantuan</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg italic">Hubungi tim Superadmin untuk kendala teknis, saran fitur, atau keluhan operasional.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="relative z-10 h-16 px-8 bg-[#4F46E5] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl active:scale-95 shadow-indigo-200"
        >
          <Plus size={20} /> Buat Laporan Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Statistics Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Status Laporan</h3>
            <div className="space-y-4">
              {[
                { label: 'Terbuka / Menunggu', count: tickets.filter(t => t.status === 'open').length, color: 'bg-amber-50 text-amber-600', icon: Clock },
                { label: 'Dalam Proses', count: tickets.filter(t => t.status === 'in_progress').length, color: 'bg-indigo-50 text-indigo-600', icon: Loader2 },
                { label: 'Selesai / ACC', count: tickets.filter(t => t.status === 'resolved').length, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
                { label: 'Ditolak', count: tickets.filter(t => t.status === 'rejected').length, color: 'bg-rose-50 text-rose-600', icon: XCircle }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon size={18} className={s.label === 'Dalam Proses' ? 'animate-spin' : ''} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
                  </div>
                  <span className="text-xl font-black text-[#0F172A]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket List Panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
              <Loader2 size={48} className="animate-spin text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi data...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 italic opacity-30">
              <LifeBuoy size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Belum ada laporan kendala</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => viewTicket(t)}
                  className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group flex items-start gap-6 ${selectedTicket?.id === t.id ? 'border-indigo-600 shadow-xl shadow-indigo-50 ring-2 ring-indigo-50' : 'border-slate-100 hover:border-indigo-100 hover:shadow-lg'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : t.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {t.category === 'bug' ? <AlertCircle size={24} /> : t.category === 'suggestion' ? <Zap size={24} /> : <MessageSquare size={24} />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.category}</span>
                      {!t.is_read_by_user && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-lg animate-pulse uppercase tracking-tighter">Respon Baru!</span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A] tracking-tighter uppercase truncate group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate italic leading-none">ID: #{t.id} - {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.status === 'open' && (
                      <button onClick={(e) => { e.stopPropagation(); startEdit(t); }} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit2 size={16} /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ticket Detail Preview */}
          {selectedTicket && (
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-indigo-100 shadow-2xl animate-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
              <button onClick={() => setSelectedTicket(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24} /></button>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">Detail Laporan #{selectedTicket.id}</div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{selectedTicket.status}</div>
                  </div>
                  <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">{selectedTicket.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 italic text-slate-600 text-sm leading-relaxed shadow-inner">
                      {selectedTicket.description}
                    </div>
                    {selectedTicket.attachment_url && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ImageIcon size={14} /> Foto Terlampir</div>
                        <img
                          src={selectedTicket.attachment_url}
                          alt="Evidence"
                          className="w-full rounded-[2.5rem] border-8 border-white shadow-2xl hover:scale-[1.02] transition-transform cursor-zoom-in"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className={`p-10 rounded-[3rem] border-2 border-dashed relative overflow-hidden ${selectedTicket.admin_feedback ? 'bg-emerald-50/50 border-emerald-100 shadow-xl shadow-emerald-50' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 ${selectedTicket.admin_feedback ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#0F172A]">Respon Superadmin</h4>
                      </div>

                      {selectedTicket.admin_feedback ? (
                        <div className="space-y-4">
                          <p className="text-sm text-emerald-800 font-bold leading-relaxed whitespace-pre-wrap">{selectedTicket.admin_feedback}</p>
                          <div className="pt-4 border-t border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Update terakhir: {new Date(selectedTicket.updated_at).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed opacity-60">Status: {selectedTicket.status}. Menunggu respon resmi dari pihak Superadmin terkait keluhan/saran ini.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"><X size={28} /></button>

            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner"><MessageSquare size={40} /></div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-[#0F172A] uppercase leading-none">{editMode ? 'Edit Laporan' : 'Kirim Laporan'}</h3>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">{editMode ? 'Perbarui informasi laporan Anda' : 'Sampaikan kendala atau saran Anda'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Judul Laporan</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full h-20 px-8 bg-slate-50 rounded-[1.5rem] font-black uppercase text-xs outline-none focus:ring-4 ring-indigo-50 transition-all border-none placeholder:text-slate-300 placeholder:italic"
                  placeholder="CONTOH: KASIR TIDAK BISA LOGIN"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kategori</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-20 px-8 bg-slate-50 rounded-[1.5rem] font-black uppercase text-xs outline-none border-none appearance-none cursor-pointer"
                  >
                    <option value="complaint">Keluhan Toko</option>
                    <option value="bug">Bug Sistem (Teknis)</option>
                    <option value="suggestion">Saran Fitur</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ganti Foto (Opsional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setForm({ ...form, attachment: e.target.files?.[0] || null })}
                      className="hidden"
                      id="attachment-upload"
                    />
                    <label htmlFor="attachment-upload" className="w-full h-20 px-8 bg-slate-50 rounded-[1.5rem] flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all border-none">
                      <span className="text-[10px] font-black text-slate-400 truncate max-w-[150px] uppercase">{form.attachment ? form.attachment.name : 'PILIH GAMBAR'}</span>
                      <ImageIcon size={20} className="text-indigo-600" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deskripsi Detail</label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full h-48 p-8 bg-slate-50 rounded-[2.5rem] font-medium text-sm outline-none focus:ring-4 ring-indigo-50 transition-all border-none shadow-inner resize-none"
                  placeholder="Jelaskan secara rinci kendala yang Anda hadapi..."
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-30 disabled:pointer-events-none"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={24} /> : editMode ? <Edit2 size={24} /> : <Send size={24} />}
                {editMode ? 'Simpan Perubahan' : 'Kirim Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
