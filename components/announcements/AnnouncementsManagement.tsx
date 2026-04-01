'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Trash2, Edit2, Loader2, CheckCircle2, AlertCircle,
  Users, Store, Globe, Search, X, Check, ShieldCheck, UserCheck
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface AnnouncementsManagementProps {
  role: 'superadmin' | 'owner';
}

export default function AnnouncementsManagement({ role }: AnnouncementsManagementProps) {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    scope: role === 'superadmin' ? 'global' : 'store',
    priority: 'normal',
    is_active: true,
    target_user_ids: [] as number[],
    target_role: '', // 'owner', 'manager', 'kasir' or empty for all
    store_id: '' as any
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Helper Functions
  const markAllAsRead = async () => {
    try {
      await apiFetch('/announcements/read-all', { method: 'POST' });
      window.dispatchEvent(new CustomEvent('announcementCountUpdate'));
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch('/announcements');
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const endpoint = role === 'superadmin' ? '/superadmin/users' : '/users';
      let query = '';
      if (role === 'superadmin' && form.scope === 'store' && form.store_id) {
        query = `?store_id=${form.store_id}`;
      } else if (role === 'owner') {
        query = `?role=kasir,manager`;
      }
      const res: any = await apiFetch(endpoint + query);
      setUsers(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchStores = async () => {
    try {
      const res: any = await apiFetch('/stores');
      setStores(res.data || []);
    } catch (err) { console.error(err); }
  };

  // Lifecycle
  useEffect(() => {
    fetchData();
    markAllAsRead();
    if (role === 'superadmin') fetchStores();
    if (role === 'owner') fetchUsers();
  }, []);

  useEffect(() => {
    if (role === 'superadmin') {
      fetchUsers();
    }
  }, [form.store_id, form.scope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const url = isEditMode ? `/announcements/${selectedId}` : '/announcements';
      const method = isEditMode ? 'PUT' : 'POST';

      const submitForm = { ...form };
      if (!submitForm.store_id) delete submitForm.store_id;

      await apiFetch(url, {
        method,
        body: JSON.stringify(submitForm)
      });

      setMessage({ type: 'success', text: `Pengumuman berhasil ${isEditMode ? 'diperbarui' : 'diterbitkan'}` });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  };

  const openEdit = (a: any) => {
    setIsEditMode(true);
    setSelectedId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      scope: a.scope,
      priority: a.priority,
      is_active: a.is_active,
      target_user_ids: a.target_user_ids || [],
      target_role: a.target_role || '',
      store_id: a.store_id || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      scope: role === 'superadmin' ? 'global' : 'store',
      priority: 'normal',
      is_active: true,
      target_user_ids: [],
      target_role: '',
      store_id: ''
    });
    setIsEditMode(false);
    setSelectedId(null);
  };

  const toggleUserSelection = (userId: number) => {
    setForm(prev => ({
      ...prev,
      target_user_ids: prev.target_user_ids.includes(userId)
        ? prev.target_user_ids.filter(id => id !== userId)
        : [...prev.target_user_ids, userId]
    }));
  };

  return (
    <div className="space-y-10 p-6 md:p-10 animate-in fade-in duration-700 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Megaphone size={200} /></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Megaphone size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Broadcast System</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Pengumuman</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg italic">Bagikan informasi penting ke seluruh tim atau user spesifik dalam satu langkah.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="relative z-10 h-16 px-8 bg-[#0F172A] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl active:scale-95"
        >
          <Plus size={20} /> Buat Pengumuman
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
          <Loader2 size={48} className="animate-spin text-indigo-600" />
          <p className="text-[10px] font-black uppercase tracking-widest">Memuat database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border border-slate-100 italic opacity-30">
              <Megaphone size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Belum ada pengumuman diterbitkan</p>
            </div>
          ) : announcements.map(a => {
            const isGlobal = a.scope === 'global';
            const canManage = role === 'superadmin' || (!isGlobal && a.store_id);

            return (
              <div key={a.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                {a.priority === 'critical' && <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${a.priority === 'critical' ? 'bg-rose-50 text-rose-600' : a.priority === 'important' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {a.priority}
                    </div>
                    {isGlobal ? <Globe size={14} className="text-slate-300" /> : <Store size={14} className="text-slate-300" />}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isGlobal ? 'Global' : a.store?.name || 'Store'}
                    </span>
                  </div>

                  {canManage && !a.is_readonly && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(a.id)} className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                    </div>
                  )}
                  {(a.is_readonly || (!canManage && isGlobal)) && (
                    <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100 select-none">Read Only (System)</div>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#0F172A] tracking-tighter mb-4 uppercase">{a.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">{a.content}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {a.target_role && (
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                      <UserCheck size={10} /> Role: {a.target_role}
                    </div>
                  )}
                  {a.target_user_ids?.length > 0 && (
                    <div className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                      <Users size={10} /> {a.target_user_ids.length} User Spesifik
                    </div>
                  )}
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={10} /> {a.reads_count || 0} Dilihat
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">{a.creator?.name?.[0]}</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">Oleh {a.creator?.name}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase italic shrink-0">{new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 transition-all">
          <div className="w-full max-w-4xl bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"><X size={28} /></button>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Megaphone size={32} /></div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] uppercase">{isEditMode ? 'Edit News' : 'Publish News'}</h3>
                <p className="text-slate-400 text-sm font-medium italic">Atur konten dan target audiens pengumuman.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Pengumuman</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black uppercase text-xs outline-none focus:ring-2 ring-indigo-50 transition-all border-none"
                    placeholder="CONTOH: PERUBAHAN JAM OPERASIONAL"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prioritas Tingkat Pesan</label>
                  <div className="flex gap-2">
                    {['normal', 'important', 'critical'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 h-16 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all ${form.priority === p ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Konten Pesan</label>
                <textarea
                  required
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full h-40 p-6 bg-slate-50 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 ring-indigo-50 transition-all border-none shadow-inner"
                  placeholder="Tuliskan detail pengumuman di sini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Role (Opsional)</label>
                    <select
                      value={form.target_role}
                      onChange={e => setForm({ ...form, target_role: e.target.value })}
                      className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black uppercase text-xs outline-none focus:ring-2 ring-indigo-50 border-none appearance-none"
                    >
                      <option value="">Semua Role</option>
                      <option value="owner">Khusus Owner</option>
                      <option value="manager">Khusus Manager</option>
                      <option value="kasir">Khusus Kasir</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target User Spesifik (Opsional)</label>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {users.length === 0 ? (
                        <p className="text-center py-10 text-[10px] uppercase font-black text-slate-300">
                          {form.scope === 'global' && !form.store_id ? 'Pilih Toko Terlebih Dahulu (Jika target toko)' : 'Tidak ada user tersedia'}
                        </p>
                      ) : users.map(u => (
                        <div
                          key={u.id}
                          onClick={() => toggleUserSelection(u.id)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${form.target_user_ids.includes(u.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white bg-transparent border border-transparent'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${form.target_user_ids.includes(u.id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{u.name[0]}</div>
                            <span className="text-[11px] font-black uppercase text-slate-700">{u.name}</span>
                          </div>
                          {form.target_user_ids.includes(u.id) && <Check size={14} className="text-indigo-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Publikasi</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_active: !form.is_active })}
                      className={`w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest transition-all ${form.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200 shadow-inner'}`}
                    >
                      {form.is_active ? <CheckCircle2 size={18} /> : <X size={18} />}
                      {form.is_active ? 'Aktif / Ditampilkan' : 'Tidak Aktif / Draft'}
                    </button>
                  </div>

                  {role === 'superadmin' && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 italic"><Globe size={12} /> Lingkup Distribusi (Scope)</label>
                      <div className="flex gap-2">
                        {['global', 'store'].map(sc => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setForm({ ...form, scope: sc, store_id: '' })}
                            className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase transition-all ${form.scope === sc ? 'bg-[#0F172A] text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400'}`}
                          >
                            {sc === 'global' ? 'Seluruh Sistem' : 'Pilih Toko'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {role === 'superadmin' && form.scope === 'store' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Toko Target Pengumuman</label>
                      <select
                        required
                        value={form.store_id}
                        onChange={e => setForm({ ...form, store_id: e.target.value })}
                        className="w-full h-16 px-6 bg-indigo-50 rounded-2xl font-black uppercase text-xs outline-none border-none ring-2 ring-indigo-100 shadow-sm"
                      >
                        <option value="">-- Pilih Toko Audien --</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase"><ShieldCheck size={14} /> Intelligence Rule</div>
                    <p className="text-[10px] text-amber-600 font-medium italic">
                      {form.scope === 'global' ?
                        'Berita global akan muncul di seluruh dashboard user sistem.' :
                        'Berita ini hanya akan muncul bagi user yang berada di dalam lingkup toko terpilih.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-30 disabled:scale-100"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={24} /> : isEditMode ? <CheckCircle2 size={24} /> : <Megaphone size={24} />}
                {isEditMode ? 'Simpan Perubahan' : 'Terbitkan Broadcast Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
