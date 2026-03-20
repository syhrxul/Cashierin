'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  Key,
  Store,
  ChevronRight,
  Loader2,
  Calendar,
  Lock,
  PauseCircle,
  PlayCircle,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  approval_status: string;
  store_id: number | null;
  store?: {
    name: string;
  };
  created_at: string;
  is_active: boolean;
}

export default function UserManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryStatus = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(queryStatus || 'all');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Reset Password State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (queryStatus) {
      setStatusFilter(queryStatus);
    } else {
      setStatusFilter('all');
    }
  }, [queryStatus]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiFetch('/superadmin/users');
      const data = res.data || (Array.isArray(res) ? res : []);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Gagal menyinkronkan data pengguna. Pastikan koneksi internet stabil.');
    } finally {
      // Small delay to prevent flickering
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: number) => {
    setActionInProgress(id);
    try {
      await apiFetch(`/superadmin/users/${id}/approve`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      console.error('Approve failed:', err);
      alert(err.message || 'Gagal menyetujui user.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject user ini?')) return;
    setActionInProgress(id);
    try {
      await apiFetch(`/superadmin/users/${id}/reject`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      console.error('Reject failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini selamanya?')) return;
    setActionInProgress(id);
    try {
      await apiFetch(`/superadmin/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (newPassword !== confirmPassword) {
      alert('Password konfirmasi tidak cocok.');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password minimal 8 karakter.');
      return;
    }

    setResetting(true);
    try {
      await apiFetch(`/superadmin/users/${resetUser.id}/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });
      alert(`Password untuk ${resetUser.name} berhasil direset.`);
      setResetModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.message || 'Gagal reset password.');
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (u.username?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.approval_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => u.approval_status === 'pending').length,
    owners: users.filter(u => u.role === 'owner').length,
    employees: users.filter(u => ['manager', 'kasir'].includes(u.role)).length
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-[#4F46E5] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
            <Users size={28} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#0F172A]">Menyinkronkan Pengguna</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Menghubungkan ke Secure Server...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center p-10">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter mb-2">Sinkronisasi Gagal</h2>
        <p className="text-slate-400 font-medium text-center max-w-sm mb-10 leading-relaxed">{error}</p>
        <button
          onClick={fetchData}
          className="px-8 py-4 bg-[#4F46E5] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center gap-3 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100"
        >
          <RefreshCw size={14} />
          Coba Sinkron Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/40">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4F46E5]">User Audit Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">
            {statusFilter === 'pending' ? 'Menunggu Approval' : statusFilter === 'rejected' ? 'Daftar Penolakan' : 'Kelola Pengguna'}
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">Otorisasi dan pantau aktivitas seluruh pengguna dalam platform.</p>
        </div>
        <button
          onClick={fetchData}
          className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
        >
          <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { id: 'all', label: 'Total User', val: stats.total, icon: Users, color: 'indigo' },
          { id: 'pending', label: 'Butuh Approval', val: stats.pending, icon: Clock, color: 'rose' },
          { id: 'owners', label: 'Total Owner', val: stats.owners, icon: ShieldCheck, color: 'emerald' },
          { id: 'employees', label: 'Staf & Kasir', val: stats.employees, icon: User, color: 'amber' }
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (['pending', 'all', 'rejected'].includes(stat.id) || stat.id === 'all') setStatusFilter(stat.id as any);
            }}
            className={`bg-white p-8 rounded-[3rem] border shadow-sm relative group cursor-pointer transition-all ${statusFilter === stat.id ? 'border-[#4F46E5] ring-4 ring-indigo-50' : 'border-slate-200/60 hover:border-slate-300'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-[#0F172A]">{stat.val}</p>
            </div>
            {stat.id === 'pending' && stat.val > 0 && (
              <div className="absolute top-8 right-8 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Cari user (nama, email, username)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-16 pr-6 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl outline-none font-bold text-sm transition-all focus:ring-4 ring-indigo-50/50"
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-14 px-6 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none border-none focus:ring-4 ring-indigo-50"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="kasir">Kasir</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-14 px-6 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none border-none focus:ring-4 ring-indigo-50"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* User Data Grid */}
      <div className="bg-white rounded-[4rem] border border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Profil User</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Identitas Akun</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Store Context</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-10 py-8 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm text-lg ${item.role === 'owner' ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0F172A]">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Join: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                        <Mail size={12} className="text-slate-300" />
                        {item.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px] uppercase tracking-widest">
                        <User size={12} className="text-slate-200" />
                        {item.username}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {item.role === 'owner' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                        <ShieldCheck size={12} />
                        Merchant Owner
                      </div>
                    ) : item.store ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                          <Store size={12} className="text-slate-300" />
                          {item.store.name}
                        </div>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{item.role}</p>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest italic">No Store Bound</span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      {item.approval_status === 'pending' ? (
                        <div className="inline-flex items-center w-fit gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest border border-orange-100 animate-pulse shadow-sm shadow-orange-100/50">
                          <Clock size={12} />
                          Pending Review
                        </div>
                      ) : item.approval_status === 'approved' ? (
                        <div className="inline-flex items-center w-fit gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Verified
                        </div>
                      ) : (
                        <div className="inline-flex items-center w-fit gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100 shadow-sm shadow-rose-100/50">
                          <XCircle size={12} />
                          Rejected
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {item.approval_status === 'pending' && (
                        <div className="flex gap-3 animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={actionInProgress === item.id}
                            title="Approve User"
                            className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-[1rem] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200/50 disabled:opacity-50"
                          >
                            {actionInProgress === item.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={24} />}
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={actionInProgress === item.id}
                            title="Reject User"
                            className="w-12 h-12 flex items-center justify-center bg-rose-500 text-white rounded-[1rem] hover:bg-rose-600 transition-all shadow-xl shadow-rose-200/50 disabled:opacity-50"
                          >
                            {actionInProgress === item.id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={24} />}
                          </button>
                        </div>
                      )}

                      {item.approval_status === 'approved' && (
                        <button
                          onClick={() => { setResetUser(item); setResetModalOpen(true); }}
                          title="Reset Password"
                          className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-[1rem] hover:bg-indigo-600 hover:text-white transition-all hover:shadow-lg group/reset"
                        >
                          <Key size={20} className="group-hover/reset:rotate-12 transition-transform" />
                        </button>
                      )}

                      {(item.approval_status !== 'pending' || item.role !== 'superadmin') && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionInProgress === item.id}
                          className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-100 rounded-[1rem] transition-all hover:shadow-lg group/del"
                        >
                          <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-32 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                <Search size={40} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-[#0F172A] tracking-tighter">Tidak ada kecocokan data</h4>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Kami tidak dapat menemukan pengguna dengan kriteria pencarian Anda.</p>
              </div>
              <button
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 py-3 px-6 hover:bg-indigo-50 rounded-xl transition-all"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Reset Password Modal */}
      {resetModalOpen && resetUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl shadow-slate-900/20 animate-in slide-in-from-bottom-10 block overflow-hidden relative border border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -z-0 opacity-50" />

            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-8 ring-indigo-50 mb-6">
                  <Key size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tighter">Reset Password</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Reset kredensial untuk <span className="text-indigo-600 font-bold">{resetUser.name}</span></p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={resetting}
                    className="h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {resetting ? <Loader2 className="animate-spin" size={18} /> : 'Konfirmasi Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="h-14 bg-white text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 font-bold"
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
