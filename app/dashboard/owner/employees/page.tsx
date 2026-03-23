'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  Trash2,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  ArrowRight,
  UserCircle,
  Building,
  ChevronRight,
  Lock,
  RefreshCw,
  UserCheck,
  Clock,
  Zap,
  Edit,
  Pencil
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function OwnerEmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forms State
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'kasir'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: '',
    role: ''
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const userData = JSON.parse(storedUser);
      setUser(userData);

      const storeId = userData.store_id;
      if (!storeId) return;

      const [activeRes, pendingRes, inviteRes]: any = await Promise.all([
        apiFetch(`/users`),
        apiFetch(`/users/pending-approvals`),
        apiFetch(`/store/invite-code`).catch(() => ({ data: { invite_code: 'ERROR' } }))
      ]);

      setEmployees(activeRes.data || []);
      setPendingEmployees(pendingRes.data || []);
      setInviteCode(inviteRes.data?.invite_code || inviteRes.invite_code || '');
    } catch (err) {
      console.error('Failed to fetch data', err);
      setMessage({ type: 'error', text: 'Gagal mengambil data dari server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setMessage(null);
    try {
      await apiFetch(`/users/${id}/approve`, {
        method: 'POST'
      });
      setMessage({ type: 'success', text: 'Karyawan berhasil disetujui!' });
      fetchEmployees();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyetujui karyawan.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak pendaftaran ini?')) return;
    setActionLoading(id);
    try {
      await apiFetch(`/users/${id}/reject`, {
        method: 'POST'
      });
      setMessage({ type: 'success', text: 'Pendaftaran karyawan ditolak.' });
      fetchEmployees();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menolak karyawan.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus karyawan ini secara permanen? Akun mereka tidak akan bisa login lagi.')) return;
    setActionLoading(id);
    try {
      await apiFetch(`/users/${id}`, {
        method: 'DELETE'
      });
      setMessage({ type: 'success', text: 'Karyawan berhasil dihapus.' });
      fetchEmployees();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus karyawan.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (emp: any) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name || '',
      username: emp.username || '',
      email: emp.email || '',
      role: emp.role || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setSubmitLoading(true);
    try {
      await apiFetch(`/users/${editingEmployee.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setMessage({ type: 'success', text: 'Data karyawan berhasil diperbarui!' });
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui data.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }

    const targetId = showPasswordModal?.id;
    if (!targetId) return;

    setActionLoading(targetId);
    try {
      await apiFetch(`/users/${targetId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });
      setMessage({ type: 'success', text: `Password untuk ${showPasswordModal.name} berhasil diubah.` });
      setShowPasswordModal(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah password.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(addForm)
      });
      setMessage({ type: 'success', text: 'Karyawan baru berhasil ditambahkan secara manual!' });
      setIsAddModalOpen(false);
      setAddForm({ name: '', username: '', email: '', password: '', role: 'kasir' });
      fetchEmployees();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menambah karyawan baru.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredActive = employees.filter(e =>
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (lastSeenAt: string) => {
    if (!lastSeenAt) return false;
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diff = (now.getTime() - lastSeen.getTime()) / 1000 / 60; // in minutes
    return diff < 1; // Online if active in last 1 minute
  };

  const formatLastSeen = (lastSeenAt: string) => {
    if (!lastSeenAt) return 'Belum pernah aktif';
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return lastSeen.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getRoleBadge = (role: string) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case 'owner': return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Owner</span>;
      case 'manager': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Manager</span>;
      case 'kasir': return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">Kasir</span>;
      default: return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">{role || 'Staff'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin shadow-lg shadow-indigo-100/20" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Memuat Data Tim...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
          <Users size={240} />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <UserCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Management Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Manajemen Karyawan</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">Kelola hak akses, persetujuan staf baru, dan pengaturan profil tim operasional toko Anda di satu tempat.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => router.push('/dashboard/owner/settings?tab=license')}
            className="h-14 px-8 bg-slate-50 text-slate-600 font-black rounded-2xl border border-slate-100 text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3 active:scale-95"
          >
            <RefreshCw size={16} /> Update Data
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-14 px-8 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
          >
            <UserPlus size={16} /> Tambah Staf
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-4 duration-500 flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      {/* Main Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-500">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total Karyawan</p>
          <h3 className="text-3xl font-black tracking-tight text-[#0F172A] mt-1">{employees.length}</h3>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:shadow-xl hover:shadow-amber-100/20 transition-all duration-500">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Menunggu Approval</p>
          <h3 className="text-3xl font-black tracking-tight text-[#0F172A] mt-1">{pendingEmployees.length}</h3>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:shadow-xl hover:shadow-emerald-100/20 transition-all duration-500">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <ShieldCheck size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Staff Aktif</p>
          <h3 className="text-3xl font-black tracking-tight text-[#0F172A] mt-1">{employees.filter(e => e.approval_status === 'approved').length}</h3>
        </div>
      </div>

      {/* Tab & Search Section */}
      <div className="bg-white rounded-[4rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit shrink-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Users size={16} /> Terdaftar
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Clock size={16} /> Approval
              {pendingEmployees.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] animate-bounce shadow-lg shadow-rose-200">
                  {pendingEmployees.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative group flex-1 max-w-md">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama, email, atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-10 py-6">Karyawan</th>
                <th className="px-10 py-6">Role & Status</th>
                <th className="px-10 py-6">Bergabung Pada</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(activeTab === 'active' ? filteredActive : pendingEmployees).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users size={64} />
                      <p className="text-xs font-black uppercase tracking-widest italic">Tidak ada data ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (activeTab === 'active' ? filteredActive : pendingEmployees).map((emp) => (
                  <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-[#0F172A] truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{emp.name}</p>
                            {isOnline(emp.last_seen_at) ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Online Now</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 italic">
                                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                                {formatLastSeen(emp.last_seen_at)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-slate-400">
                            <span className="text-[10px] font-bold">@{emp.username}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                            <span className="text-[10px] font-bold truncate max-w-[150px] italic">{emp.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        {getRoleBadge(emp.role)}
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${emp.approval_status === 'approved' ? 'bg-emerald-500' : emp.approval_status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{emp.approval_status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-slate-500">
                        <Calendar size={16} className="text-slate-300" />
                        <span className="text-xs font-bold leading-none">{new Date(emp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex justify-end gap-3">
                          <button
                            disabled={actionLoading === emp.id}
                            onClick={() => handleReject(emp.id)}
                            className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-90 disabled:opacity-30"
                            title="Tolak Pendaftaran"
                          >
                            <XCircle size={18} />
                          </button>
                          <button
                            disabled={actionLoading === emp.id}
                            onClick={() => handleApprove(emp.id)}
                            className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-95 disabled:opacity-30"
                            title="Setujui Karyawan"
                          >
                            {actionLoading === emp.id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          {emp.role !== 'owner' && (
                            <>
                              <button
                                onClick={() => handleEdit(emp)}
                                className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-95"
                                title="Edit Data"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => setShowPasswordModal(emp)}
                                className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-95"
                                title="Ganti Password"
                              >
                                <Key size={18} />
                              </button>
                              <button
                                disabled={actionLoading === emp.id}
                                onClick={() => handleDelete(emp.id)}
                                className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-90"
                                title="Hapus Akun"
                              >
                                {actionLoading === emp.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
            <button
              onClick={() => setShowPasswordModal(null)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <XCircle size={24} />
            </button>
            <div className="flex flex-col items-center gap-6 mb-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.75rem] flex items-center justify-center shadow-inner"><Key size={36} /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-[#0F172A]">Reset Password</h3>
                <p className="text-sm text-slate-400 font-medium italic">Mengatur ulang kata sandi untuk <span className="text-indigo-600 font-black">"{showPasswordModal.name}"</span></p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password Baru</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Minimal 8 karakter..."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Password</label>
                <div className="relative">
                  <ShieldCheck size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Ulangi password..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="flex-1 h-16 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-[2] h-16 bg-[#0F172A] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><UserPlus size={32} /></div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter text-[#0F172A]">Registrasi Staf</h3>
                <p className="text-sm text-slate-400 font-medium">Tambah akun manual atau aktivasi via kode undangan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Manual Form */}
              <div className="lg:col-span-7 space-y-8">
                <form onSubmit={handleCreateEmployee} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap Karyawan</label>
                    <input
                      required
                      type="text"
                      value={addForm.name}
                      onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                      <input
                        required
                        type="text"
                        value={addForm.username}
                        onChange={e => setAddForm({ ...addForm, username: e.target.value.toLowerCase() })}
                        className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                        placeholder="budi_123"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Jabatan</label>
                      <input
                        required
                        type="text"
                        list="role-list"
                        value={addForm.role}
                        onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                        className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                        placeholder="Contoh: Kasir, Manager, Admin..."
                      />
                      <datalist id="role-list">
                        <option value="kasir" />
                        <option value="manager" />
                        <option value="admin" />
                        <option value="security" />
                        <option value="cleaner" />
                        <option value="supervisor" />
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</label>
                    <input
                      required
                      type="email"
                      value={addForm.email}
                      onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                      placeholder="budi@email.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Awal</label>
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={addForm.password}
                      onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                      placeholder="Minimal 8 karakter unik..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full h-20 bg-[#0F172A] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95"
                  >
                    {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    Daftarkan Karyawan Sekarang
                  </button>
                </form>
              </div>

              {/* Invite Code Option */}
              <div className="lg:col-span-5 relative">
                <div className="sticky top-0 h-full p-10 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[3rem] border border-indigo-100 flex flex-col justify-between gap-10">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/40 shadow-sm">
                      <Zap size={10} className="animate-pulse" />
                      Quick Method
                    </div>
                    <h4 className="text-xl font-black text-indigo-900 tracking-tight">Gunakan Kode Undangan</h4>
                    <p className="text-[11px] text-indigo-700/60 font-medium leading-relaxed">Berikan kode unik ini kepada karyawan agar mereka dapat mendaftar sendiri dari aplikasi.</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/40 blur-xl group-hover:bg-white/60 transition-all opacity-50" />
                    <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl space-y-6 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Invite Code Anda</p>
                      <div className="overflow-hidden">
                        <p className="text-3xl font-black text-indigo-600 tracking-[0.05em] break-all leading-tight">
                          {inviteCode || 'LOADING...'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteCode);
                          alert('Kode undangan berhasil disalin!');
                        }}
                        className="w-full h-12 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={14} /> Salin Kode
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { step: 1, text: "Buka halaman pendaftaran" },
                      { step: 2, text: "Masukkan kode unik toko" },
                      { step: 3, text: "Setujui pada tab Approval" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[11px] font-black text-indigo-600 shrink-0 border border-indigo-50">{item.step}</div>
                        <p className="text-[11px] text-indigo-900/40 font-black uppercase tracking-widest">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <XCircle size={24} />
            </button>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Pencil size={32} /></div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter text-[#0F172A]">Edit Data Staf</h3>
                <p className="text-sm text-slate-400 font-medium italic">"{editingEmployee?.name}"</p>
              </div>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                  <input
                    required
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value.toLowerCase() })}
                    className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Jabatan</label>
                  <input
                    required
                    type="text"
                    list="role-list-edit"
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                  />
                  <datalist id="role-list-edit">
                    <option value="kasir" />
                    <option value="manager" />
                    <option value="admin" />
                    <option value="security" />
                    <option value="supervisor" />
                  </datalist>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-16 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-[2] h-16 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
