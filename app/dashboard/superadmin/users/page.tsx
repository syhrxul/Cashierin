'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  ShieldCheck,
  UserPlus,
  Key,
  Mail,
  User as UserIcon,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Store,
  Calendar,
  Trash2,
  Edit2,
  AlertTriangle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

type TabType = 'all' | 'superadmin' | 'owner' | 'manager' | 'kasir' | 'pending' | 'rejected';

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') as TabType || 'all';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(initialStatus);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'owner',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch('/superadmin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/superadmin/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setIsAddModalOpen(false);
      setForm({ name: '', username: '', email: '', password: '', role: 'owner' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create body, empty pass won't be sent if the BE is smart (but here we send it if filled)
      const body: any = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      };
      if (editingUser.newPassword) body.password = editingUser.newPassword;

      await apiFetch(`/superadmin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal update user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/superadmin/users/${deletingUser.id}`, { method: 'DELETE' });
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoading(true);
      await apiFetch(`/superadmin/users/${id}/approve`, { method: 'POST' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui user.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setLoading(true);
      await apiFetch(`/superadmin/users/${id}/reject`, { method: 'POST' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak user.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status tabs logic
    if (activeTab === 'pending') return u.approval_status === 'pending';
    if (activeTab === 'rejected') return u.approval_status === 'rejected';

    // Special case for 'all' tab: Filter out non-approved users to keep it clean OR show everything?
    // User requested "Approval Queue" separate, so let's keep 'all' as Approved/Active users + Superadmin
    if (activeTab === 'all') return true;

    // Role tabs logic
    return u.role === activeTab;
  });

  const tabs: { id: TabType, label: string }[] = [
    { id: 'all', label: 'Daftar Semua' },
    { id: 'pending', label: 'Approval Queue' },
    { id: 'rejected', label: 'Daftar Penolakan' },
    { id: 'owner', label: 'Owner (Master)' },
    { id: 'superadmin', label: 'Superadmins' },
    { id: 'manager', label: 'Managers' },
    { id: 'kasir', label: 'Kasir/Staf' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-[#4F46E5] rounded-xl border border-indigo-100">
            <Users size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">User Management Terminal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Daftar Pengguna</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring dan kelola akses akun seluruh ekosistem.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari email, nama, atau username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 pr-6 bg-slate-50 border-none rounded-2xl w-full md:w-72 text-sm font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-14 px-8 bg-[#4F46E5] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center gap-3 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 h-12 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-[#0F172A] text-white shadow-lg'
              : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 h-64 animate-pulse" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full h-80 bg-white rounded-[4rem] border border-slate-100 flex flex-col items-center justify-center text-center p-12">
            <p className="text-xl font-black text-slate-300">Tidak ada user ditemukan.</p>
          </div>
        ) : filteredUsers.map((u) => (
          <div key={u.id} className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/30 overflow-hidden">
            <div className="flex items-center gap-5 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-100 transition-all group-hover:scale-110 ${u.role === 'superadmin' ? 'bg-indigo-600' :
                u.role === 'owner' ? 'bg-emerald-600' :
                  u.role === 'manager' ? 'bg-amber-600' : 'bg-slate-700'
                }`}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-black tracking-tight text-[#0F172A] truncate uppercase">{u.name}</h4>
                <p className="text-xs text-slate-400 font-medium">@{u.username}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingUser({ ...u, newPassword: '' })}
                  className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeletingUser(u)}
                  className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 py-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-500">
                <Mail size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Store size={14} className="text-slate-300" />
                <span className={`text-[11px] font-black uppercase tracking-widest ${u.store?.name ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {u.store?.name || 'Unassigned / No Store'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{u.role} Account</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${u.approval_status === 'approved' ? 'bg-emerald-500' : u.approval_status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {u.approval_status === 'approved' ? 'Active Unit' : u.approval_status === 'rejected' ? 'Rejected' : 'Awaiting Review'}
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">UID: {u.id}</span>
            </div>

            {/* Approval Actions */}
            {u.approval_status !== 'approved' && (
              <div className="mt-6 pt-6 border-t border-dashed border-slate-100 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleApprove(u.id)}
                  className="h-10 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-50"
                >
                  <CheckCircle2 size={14} /> Setujui / ACC
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  className="h-10 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
                >
                  <X size={14} /> Tolak
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl border border-white overflow-y-auto max-h-[90vh]">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tighter text-[#0F172A]">Account Registrar</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                    <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Set Role</label>
                    <select className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="superadmin">SuperAdmin</option>
                      <option value="owner">Owner (Master)</option>
                      <option value="manager">Manager</option>
                      <option value="kasir">Staff/Kasir</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full h-16 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Deploy Account</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div onClick={() => setEditingUser(null)} className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl" />
          <div className="relative bg-white w-full max-w-lg rounded-[4rem] p-12 shadow-2xl border border-white overflow-hidden">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                    {editingUser.name?.[0]?.toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter text-[#0F172A]">Edit Profile</h2>
                </div>
                <button onClick={() => setEditingUser(null)} className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</label>
                  <input required value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full h-16 px-8 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-600/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input required type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full h-16 px-8 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-600/10" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                    <select className="w-full h-16 px-8 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold appearance-none cursor-pointer" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                      <option value="superadmin">SuperAdmin</option>
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="kasir">Kasir</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-indigo-600">New Password?</label>
                    <input type="password" placeholder="Kosongkan jika tidak ganti" value={editingUser.newPassword} onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })} className="w-full h-16 px-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[1.5rem] text-sm font-bold placeholder:font-normal placeholder:text-indigo-200" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full h-16 bg-[#0F172A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div onClick={() => setDeletingUser(null)} className="absolute inset-0 bg-[#0F172A]/90 blur-xl" />
          <div className="relative bg-white w-full max-w-md rounded-[3.5rem] p-12 text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-[#0F172A]">Hapus Akun ini?</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Anda akan menghapus secara permanen akun milik <span className="font-black text-rose-500 uppercase">{deletingUser.name}</span>. Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteUser} disabled={submitting} className="h-16 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-100">
                {submitting ? <Loader2 className="animate-spin" /> : 'SAYA MENGERTI, HAPUS PERMANEN'}
              </button>
              <button onClick={() => setDeletingUser(null)} className="h-14 font-black text-slate-400 text-[10px] uppercase tracking-widest hover:text-[#0F172A] transition-colors">Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
