'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Settings2,
  Filter,
  Edit2,
  Sparkles,
  Zap,
  Clock3,
  XCircle,
  FileText,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Components
import ShiftTable from './components/ShiftTable';
import TemplateTab from './components/TemplateTab';
import GenerateModal from './components/GenerateModal';
import ShiftTemplateModal from './components/ShiftTemplateModal';
import AddShiftModal from './components/AddShiftModal';
import BulkEditModal from './components/BulkEditModal';
import ShiftDetailModal from './components/ShiftDetailModal';

export default function OwnerShiftsPage() {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'templates'>('jadwal');
  const [shifts, setShifts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [shiftRequests, setShiftRequests] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailGroup, setSelectedDetailGroup] = useState<any>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Forms
  const [form, setForm] = useState({
    user_ids: [] as number[],
    start_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_date: new Date().toISOString().split('T')[0],
    end_time: '16:00',
    notes: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    start_time: '08:00',
    end_time: '16:00',
    requirements: [{ role: 'kasir', count: 1 }]
  });

  const [generateForm, setGenerateForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    template_ids: [] as number[]
  });

  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        start_date: filters.start_date,
        end_date: filters.end_date
      }).toString();

      const [shiftsRes, usersRes, templatesRes, requestsRes]: any = await Promise.all([
        apiFetch(`/shift-schedules?${queryParams}`),
        apiFetch('/users?role=kasir,manager'),
        apiFetch('/shift-templates'),
        apiFetch('/shift-requests')
      ]);

      setShifts(shiftsRes.data || []);
      setEmployees(usersRes.data || []);
      setTemplates(templatesRes.data || []);
      setShiftRequests(requestsRes.data || []);
      if (shiftsRes.store) setStore(shiftsRes.store);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.start_date, filters.end_date]);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await apiFetch('/shift-schedules', {
        method: 'POST',
        body: JSON.stringify({
          user_ids: form.user_ids,
          start_time: `${form.start_date} ${form.start_time}:00`,
          end_time: `${form.end_date} ${form.end_time}:00`,
          notes: form.notes
        })
      });
      setMessage({ type: 'success', text: 'Jadwal shift berhasil ditambahkan' });
      setIsAddModalOpen(false);
      setForm({ ...form, user_ids: [] });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShift = async (ids: number | number[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    if (!confirm(`Hapus ${idArray.length} jadwal shift ini?`)) return;
    try {
      setActionLoading(true);
      if (idArray.length === 1) {
        await apiFetch(`/shift-schedules/${idArray[0]}`, { method: 'DELETE' });
      } else {
        await apiFetch('/shift-schedules/bulk-destroy', {
          method: 'POST',
          body: JSON.stringify({ ids: idArray })
        });
      }
      setMessage({ type: 'success', text: 'Jadwal berhasil dihapus' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setSelectedShifts(group.ids);
    setForm(prev => ({
      ...prev,
      start_date: group.startTime.split(' ')[0],
      start_time: group.startTime.split(' ')[1] ? group.startTime.split(' ')[1].substring(0, 5) : '08:00',
      end_date: group.endTime.split(' ')[0],
      end_time: group.endTime.split(' ')[1] ? group.endTime.split(' ')[1].substring(0, 5) : '16:00',
      notes: group.notes || ''
    }));
    setIsEditModalOpen(true);
  };

  const handleViewDetail = (group: any) => {
    setSelectedDetailGroup(group);
    setIsDetailModalOpen(true);
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await apiFetch('/shift-schedules/bulk-update', {
        method: 'POST',
        body: JSON.stringify({
          ids: selectedShifts,
          start_time: `${form.start_date} ${form.start_time}:00`,
          end_time: `${form.end_date} ${form.end_time}:00`,
          notes: form.notes
        })
      });
      setMessage({ type: 'success', text: `${selectedShifts.length} jadwal berhasil diperbarui` });
      setIsEditModalOpen(false);
      setSelectedShifts([]);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedShifts.length} jadwal terpilih?`)) return;
    try {
      setActionLoading(true);
      await apiFetch('/shift-schedules/bulk-destroy', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedShifts })
      });
      setMessage({ type: 'success', text: 'Jadwal terpilih berhasil dihapus' });
      setSelectedShifts([]);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingTemplateId) {
        await apiFetch(`/shift-templates/${editingTemplateId}`, {
          method: 'PUT',
          body: JSON.stringify(templateForm)
        });
        setMessage({ type: 'success', text: 'Template shift berhasil diperbarui!' });
      } else {
        await apiFetch('/shift-templates', {
          method: 'POST',
          body: JSON.stringify(templateForm)
        });
        setMessage({ type: 'success', text: 'Template shift berhasil dibuat!' });
      }
      setIsTemplateModalOpen(false);
      setEditingTemplateId(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateTemplateOpen = () => {
    setEditingTemplateId(null);
    setTemplateForm({
      name: '',
      start_time: '08:00',
      end_time: '16:00',
      requirements: [{ role: 'kasir', count: 1 }]
    });
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplateOpen = (tpl: any) => {
    setEditingTemplateId(tpl.id);
    setTemplateForm({
      name: tpl.name,
      start_time: tpl.start_time.substring(0, 5),
      end_time: tpl.end_time.substring(0, 5),
      requirements: tpl.requirements || [{ role: 'kasir', count: 1 }]
    });
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Hapus template ini?')) return;
    try {
      await apiFetch(`/shift-templates/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Template berhasil dihapus.' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleGenerateShifts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res: any = await apiFetch('/shift-schedules/generate', {
        method: 'POST',
        body: JSON.stringify(generateForm)
      });
      setMessage({ type: 'success', text: res.message });
      setIsGenerateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      if (!confirm('Setujui pengajuan shift ini?')) return;
      setActionLoading(true);
      await apiFetch(`/shift-requests/${id}/approve`, { method: 'POST' });
      setMessage({ type: 'success', text: 'Pengajuan disetujui!' });
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

  const calculateHours = (start: string, end: string) => {
    return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
  };

  if (loading && shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Schedule...</p>
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
            <Zap size={14} className="fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Smart Scheduling</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0F172A]">Jadwal & Shift</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg">Atur jam kerja tim secara efisien dengan generator AI.</p>
        </div>


        <div className="flex bg-slate-100 p-2 rounded-[2rem] border border-slate-200 shadow-inner relative z-10 overflow-x-auto w-full md:w-auto">
          <button onClick={() => setActiveTab('jadwal')} className={`shrink-0 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'jadwal' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Daftar Jadwal</button>
          <button onClick={() => setActiveTab('templates')} className={`shrink-0 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Master Shift</button>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      {activeTab === 'jadwal' ? (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
              <div className="flex items-center gap-6 bg-white h-20 px-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50">
                <Calendar className="text-indigo-500" size={20} />
                <div className="flex items-center gap-4">
                  <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} className="bg-transparent text-[10px] font-black uppercase outline-none" />
                  <span className="text-slate-200">/</span>
                  <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} className="bg-transparent text-[10px] font-black uppercase outline-none" />
                </div>
              </div>
              {selectedShifts.length > 0 && (
                <div className="flex gap-3 animate-in fade-in zoom-in duration-300">
                  <button onClick={() => setIsEditModalOpen(true)} className="h-20 px-8 bg-indigo-50 text-indigo-600 rounded-[2.5rem] border border-indigo-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95 transition-all"><Edit2 size={16} /> Edit Massal ({selectedShifts.length})</button>
                  <button onClick={handleBulkDelete} className="h-20 px-8 bg-rose-50 text-rose-500 rounded-[2.5rem] border border-rose-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95 transition-all"><Trash2 size={16} /> Hapus ({selectedShifts.length})</button>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsGenerateModalOpen(true)} className="h-20 px-8 bg-emerald-50 text-emerald-600 rounded-[2.5rem] border border-emerald-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-emerald-100 transition-all"><Sparkles size={18} /> Generate Otomatis</button>
              <button onClick={() => setIsAddModalOpen(true)} className="h-20 px-10 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"><Plus size={24} /> Jadwal Baru</button>
            </div>
          </div>
          {/* Employees without shifts warning next to table */}
          {employees.filter(e => !shifts.some(s => s.user_id === e.id)).length > 0 && (
            <div className="flex flex-col gap-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 ml-2">Peringatan: Kasir belum dapat shift</span>
              <div className="flex flex-wrap gap-2">
                {employees.filter(e => !shifts.some(s => s.user_id === e.id)).map(e => (
                  <div key={e.id} className="px-4 py-2 bg-rose-50 border border-rose-100/50 rounded-xl flex items-center gap-2 group hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <AlertCircle size={14} className="text-rose-400 group-hover:text-white" />
                    <span className="text-[10px] font-bold tracking-wider">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ShiftTable
            shifts={shifts}
            store={store}
            selectedShifts={selectedShifts}
            onToggleSelect={id => setSelectedShifts(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])}
            onToggleSelectAll={() => setSelectedShifts(selectedShifts.length === shifts.length ? [] : shifts.map(s => s.id))}
            onDeleteShift={handleDeleteShift}
            onEditShift={handleEditGroup}
            onViewDetail={handleViewDetail}
            calculateHours={calculateHours}
          />
        </div>
      ) : (
        <TemplateTab
          templates={templates}
          onOpenModal={handleCreateTemplateOpen}
          onEditTemplate={handleEditTemplateOpen}
          onDeleteTemplate={handleDeleteTemplate}
          storeLimit={store?.shift_limit_hours || 8}
        />
      )}

      {/* Modals */}
      {isAddModalOpen && <AddShiftModal onClose={() => setIsAddModalOpen(false)} form={form} setForm={setForm} onSubmit={handleAddShift} loading={actionLoading} employees={employees} />}
      {isEditModalOpen && <BulkEditModal onClose={() => setIsEditModalOpen(false)} form={form} setForm={setForm} onSubmit={handleBulkUpdate} loading={submitLoading} selectedCount={selectedShifts.length} />}
      {isGenerateModalOpen && <GenerateModal onClose={() => setIsGenerateModalOpen(false)} form={generateForm} setForm={setGenerateForm} onSubmit={handleGenerateShifts} loading={submitLoading} templates={templates} />}
      {isTemplateModalOpen && <ShiftTemplateModal onClose={() => setIsTemplateModalOpen(false)} form={templateForm} setForm={setTemplateForm} onSubmit={handleSaveTemplate} loading={submitLoading} storeLimit={store?.shift_limit_hours || 8} />}
      {isDetailModalOpen && <ShiftDetailModal onClose={() => setIsDetailModalOpen(false)} group={selectedDetailGroup} calculateHours={calculateHours} />}
    </div>
  );
}
