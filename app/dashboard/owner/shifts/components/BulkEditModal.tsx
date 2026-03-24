'use client';

import React from 'react';
import {
  XCircle,
  CheckCircle2,
  Loader2,
  Edit2,
  Users2,
  UserCheck,
  UserMinus,
  UserPlus,
  Search,
  Trash2,
  X
} from 'lucide-react';

interface BulkEditModalProps {
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent, data: { updateIds: number[], deleteIds: number[], newUsers: number[] }) => void;
  loading: boolean;
  selectedShiftsObjects: any[];
  allEmployees: any[];
}

export default function BulkEditModal({
  onClose,
  form,
  setForm,
  onSubmit,
  loading,
  selectedShiftsObjects,
  allEmployees = []
}: BulkEditModalProps) {
  // activeIds = IDs of existing shifts that WILL be updated
  const [activeIds, setActiveIds] = React.useState<number[]>((selectedShiftsObjects || []).map(s => s.id));
  // deleteIds = IDs of existing shifts that WILL be deleted
  const [deleteIds, setDeleteIds] = React.useState<number[]>([]);
  // newUsers = IDs of users who WILL get new shifts in this slot
  const [newUsers, setNewUsers] = React.useState<number[]>([]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAddingMode, setIsAddingMode] = React.useState(false);

  const toggleUpdate = (id: number) => {
    setActiveIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleDelete = (id: number) => {
    if (deleteIds.includes(id)) {
      setDeleteIds(prev => prev.filter(i => i !== id));
      setActiveIds(prev => [...prev, id]);
    } else {
      setDeleteIds(prev => [...prev, id]);
      setActiveIds(prev => prev.filter(i => i !== id));
    }
  };

  const addNewUser = (userId: number) => {
    if (!newUsers.includes(userId)) {
      setNewUsers(prev => [...prev, userId]);
    }
    setIsAddingMode(false);
    setSearchQuery('');
  };

  const removeNewUser = (userId: number) => {
    setNewUsers(prev => prev.filter(id => id !== userId));
  };

  const filteredEmployees = (allEmployees || []).filter(e =>
    !(selectedShiftsObjects || []).some(s => s.user_id === e.id) &&
    !newUsers.includes(e.id) &&
    e.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
        >
          <XCircle size={28} />
        </button>

        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Edit2 size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-2 uppercase">Edit Jadwal</h3>
            <p className="text-slate-400 text-sm font-medium italic">Kelola karyawan & waktu dalam slot ini.</p>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] flex items-center gap-2">
              <Users2 size={14} className="text-indigo-600" />
              Karyawan Tertugas
            </label>
            <button
              type="button"
              onClick={() => setIsAddingMode(!isAddingMode)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <UserPlus size={14} /> Tambah Karyawan
            </button>
          </div>

          {/* Add Employee Search Area */}
          {isAddingMode && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari nama kasir..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {filteredEmployees.length === 0 ? (
                  <p className="col-span-2 text-[10px] text-center py-4 text-slate-400 font-bold uppercase tracking-widest italic">Tidak ada karyawan tersedia</p>
                ) : filteredEmployees.map(e => (
                  <button
                    key={e.id}
                    onClick={() => addNewUser(e.id)}
                    className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-indigo-600 hover:text-white transition-all text-left truncate"
                  >
                    + {e.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
            {/* Existing Shifts */}
            {selectedShiftsObjects.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${deleteIds.includes(s.id) ? 'bg-rose-50 border-rose-200 opacity-60' : activeIds.includes(s.id) ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50 border-transparent opacity-40'}`}
              >
                <div onClick={() => !deleteIds.includes(s.id) && toggleUpdate(s.id)} className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${deleteIds.includes(s.id) ? 'bg-rose-200 text-rose-600' : activeIds.includes(s.id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {s.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[10px] font-black uppercase truncate block ${deleteIds.includes(s.id) ? 'text-rose-800 line-through' : activeIds.includes(s.id) ? 'text-indigo-900' : 'text-slate-400'}`}>
                      {s.user?.name}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      {deleteIds.includes(s.id) ? 'Akan Dihapus' : activeIds.includes(s.id) ? 'Update Waktu' : 'Akan Diabaikan'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDelete(s.id)}
                  title={deleteIds.includes(s.id) ? 'Batal Hapus' : 'Hapus dari Jadwal'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${deleteIds.includes(s.id) ? 'bg-rose-600 text-white' : 'bg-white text-slate-300 hover:text-rose-500 hover:border-rose-100 border'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Newly Added Users */}
            {newUsers.map((id) => {
              const u = allEmployees.find(e => e.id === id);
              return (
                <div
                  key={`new-${id}`}
                  className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                      {u?.name?.charAt(0) || '+'}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-900 truncate block">
                        {u?.name}
                      </span>
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">
                        Baru Ditambahkan
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewUser(id)}
                    className="w-8 h-8 rounded-lg bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={(e) => onSubmit(e, { updateIds: activeIds, deleteIds, newUsers })} className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value, end_date: e.target.value })}
                className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-black uppercase text-xs outline-none focus:ring-2 ring-indigo-50 transition-all border-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jam Masuk</label>
                <input
                  type="time"
                  required
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-indigo-50 transition-all border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jam Pulang</label>
                <input
                  type="time"
                  required
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  className="w-full h-16 px-4 bg-slate-50 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-indigo-50 transition-all border-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan Baru (Opsional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full h-32 p-6 bg-slate-50 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 ring-indigo-100 transition-all border-none shadow-inner"
              placeholder="Berikan instruksi khusus..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || (activeIds.length === 0 && deleteIds.length === 0 && newUsers.length === 0)}
            className="w-full h-24 bg-[#0F172A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-6 disabled:opacity-30"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
