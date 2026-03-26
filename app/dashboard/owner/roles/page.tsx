'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  ShieldCheck,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Settings,
  User,
  Zap,
  RefreshCw,
  Search,
  Sparkles,
  Clock,
  Package,
  Tag,
  Receipt,
  Info
} from 'lucide-react';

export default function OwnerRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [updatedPermissions, setUpdatedPermissions] = useState<any>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    permissions: {}
  });

  const fetchRoles = async () => {
    try {
      const res = await apiFetch('/roles');
      setRoles(res.data || []);

      const storeRes = await apiFetch('/store/info');
      setStore(storeRes.data || storeRes);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await apiFetch('/roles', {
        method: 'POST',
        body: JSON.stringify(newRole)
      });
      setIsAddModalOpen(false);
      setNewRole({ name: '', permissions: {} });
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan role');
    } finally {
      setSubmitLoading(true);
      setSubmitLoading(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus role ini?')) return;
    try {
      await apiFetch(`/roles/${id}`, { method: 'DELETE' });
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus role');
    }
  };

  const handleSetDefaultRole = async (roleId: number) => {
    try {
      await apiFetch('/store/update', {
        method: 'POST',
        body: JSON.stringify({ default_role_id: roleId })
      });
      alert('Default role berhasil diubah!');
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah default role');
    }
  };

  const openPermissionsModal = (role: any) => {
    setSelectedRole(role);
    setUpdatedPermissions(role.permissions || {});
    setIsPermissionsModalOpen(true);
  };

  const togglePermissionArr = (key: string) => {
    setUpdatedPermissions((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSubmitLoading(true);
    try {
      const res = await apiFetch(`/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          permissions: updatedPermissions
        })
      });
      setIsPermissionsModalOpen(false);
      alert(`Izin akses untuk role "${selectedRole.name}" berhasil diperbarui!`);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan izin akses.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200">
            <ShieldCheck size={36} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Manajemen Role</h1>
            <p className="text-slate-400 font-medium tracking-tight">Atur jabatan karyawan dan izin akses fitur toko Anda.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-16 px-8 bg-[#0F172A] text-white font-black uppercase tracking-widest text-[11px] rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          <Plus size={18} /> Role Baru
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-[3rem] border border-[#E2E8F0] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Users size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Role</p>
            <p className="text-2xl font-black text-[#0F172A]">{roles.length}</p>
          </div>
        </div>
        <div className="p-8 bg-emerald-50/50 rounded-[3rem] border border-emerald-100 shadow-sm flex items-center gap-6 group">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Zap size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Default Role</p>
            <p className="text-xl font-black text-emerald-900 truncate max-w-[150px]">
              {roles.find(r => Number(r.id) === Number(store?.default_role_id))?.name || 'Belum diatur'}
            </p>
          </div>
        </div>
      </div>

      {/* Role List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`group relative overflow-hidden p-10 bg-white rounded-[3.5rem] border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 ${Number(store?.default_role_id) === Number(role.id) ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-[#F1F5F9] hover:border-indigo-100'}`}
          >
            {Number(store?.default_role_id) === Number(role.id) && (
              <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-2">
                <CheckCircle2 size={12} /> Default Toko
              </div>
            )}

            <div className="flex justify-between items-start mb-10">
              <div className="space-y-4">
                <p className="text-3xl font-black flex items-center gap-3 text-[#0F172A] capitalize">
                  {role.name}
                </p>
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold"
                >
                  <Users size={14} /> {role.users_count} Karyawan
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center gap-4">
              <button
                onClick={() => handleSetDefaultRole(role.id)}
                className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 ${Number(store?.default_role_id) === Number(role.id) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-2 border-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95'}`}
              >
                {Number(store?.default_role_id) === Number(role.id) ? (
                  <><CheckCircle2 size={14} /> Default Aktif</>
                ) : (
                  <><Zap size={14} /> Jadikan Default</>
                )}
              </button>
              <button
                onClick={() => openPermissionsModal(role)}
                className="flex-1 h-14 bg-white border-2 border-[#0F172A] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings size={14} /> Atur Akses Fitur
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add Role Card */}
        {roles.length === 0 && (
          <div className="lg:col-span-2 p-20 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-xl"><ShieldCheck size={48} /></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Belum Ada Role Custom</h3>
              <p className="text-slate-400 font-medium max-w-sm">Anda belum menambahkan jabatan khusus untuk karyawan. Mulai dengan membuat role pertama Anda.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-16 px-10 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Buat Role Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Plus size={32} /></div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter text-[#0F172A]">Buat Role Baru</h3>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Nama jabatan harus berupa huruf saja.</p>
              </div>
            </div>

            <form onSubmit={handleAddRole} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Jabatan</label>
                <input
                  required
                  type="text"
                  value={newRole.name}
                  onChange={(e) => {
                    // Force letters and spaces only
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setNewRole({ ...newRole, name: val });
                  }}
                  className="w-full h-18 px-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl text-lg font-black outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                  placeholder="Contoh: Barista, Kasir Senior..."
                />
              </div>

              <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start gap-4">
                <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                  Role ini akan tersedia saat Anda menambahkan atau mengedit karyawan. Anda bisa mengatur permission akses fitur untuk role ini nantinya.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitLoading || !newRole.name}
                className="w-full h-20 bg-[#0F172A] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Simpan Role Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {isPermissionsModalOpen && selectedRole && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsPermissionsModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="flex items-center gap-6 mb-10 shrink-0">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Settings size={32} /></div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] capitalize">Akses: {selectedRole.name}</h3>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Atur modul apa saja yang boleh dibuka oleh {selectedRole.name}.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 mb-8">
              {[
                { key: 'access_employees', label: 'Manajemen Karyawan', icon: Users, desc: 'Tambah, edit, dan hapus data staff.' },
                { key: 'access_pos', label: 'Kasir / POS', icon: Zap, desc: 'Akses layar penjualan dan filter produk.' },
                { key: 'access_announcements', label: 'Pengumuman', icon: Sparkles, desc: 'Lihat berita dan info penting toko.' },
                { key: 'access_shifts', label: 'Manajemen Shift', icon: Clock, desc: 'Buka, tutup, dan pantau sesi kasir.' },
                { key: 'access_products', label: 'Barang & Stok', icon: Package, desc: 'Manajemen harga dan jumlah barang.' },
                { key: 'access_discounts', label: 'Diskon & Promo', icon: Tag, desc: 'Atur diskon per produk atau kupon.' },
                { key: 'access_reports', label: 'Laporan Penjualan', icon: Receipt, desc: 'Lihat data transaksi dan omzet.' },
                { key: 'access_support', label: 'Pusat Bantuan', icon: Info, desc: 'Kirim tiket bantuan ke admin.' },
                { key: 'access_roles', label: 'Manajemen Role', icon: ShieldCheck, desc: 'Edit hak akses antar jabatan.' },
                { key: 'access_store_settings', label: 'Set Up Toko', icon: Settings, desc: 'Atur info alamat dan jam operasional.' },
              ].map((p) => (
                <div
                  key={p.key}
                  onClick={() => togglePermissionArr(p.key)}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${updatedPermissions[p.key] ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${updatedPermissions[p.key] ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 group-hover:text-indigo-600'}`}>
                      <p.icon size={20} />
                    </div>
                    <div>
                      <p className={`text-base font-black tracking-tight leading-none mb-1 ${updatedPermissions[p.key] ? 'text-indigo-900' : 'text-slate-600'}`}>{p.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.desc}</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative transition-all duration-300 flex items-center px-1 ${updatedPermissions[p.key] ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${updatedPermissions[p.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 flex gap-4 mt-auto pt-6 border-t border-slate-50">
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="flex-1 h-18 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-slate-200 transition-all font-inter"
              >
                Batal
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={submitLoading}
                className="flex-[2] h-18 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={18} />}
                Simpan Akses Fitur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
