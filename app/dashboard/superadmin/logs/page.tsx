'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Globe,
  Monitor,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
  MoreVertical,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
  Info
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ActivityLog {
  id: number;
  event: string;
  description: string;
  properties: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    name: string;
    username: string;
    role: string;
  };
  store?: {
    name: string;
  };
}

export default function ActivityLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 });

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const url = `/superadmin/activity-history?page=${page}&limit=50${eventFilter !== 'all' ? `&event=${eventFilter}` : ''}`;
      const res: any = await apiFetch(url);
      console.log('[Logs API Response]:', res);
      
      const logsArray = res.data?.data || res.data || (Array.isArray(res) ? res : []);
      setLogs(logsArray);
      
      if (res.data) {
        setPagination({
          current: res.data.current_page || 1,
          last: res.data.last_page || 1,
          total: res.data.total || logsArray.length
        });
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      // Ensure the UI doesn't spin forever on error
    } finally {
      setLoading(false);
    }
  }, [eventFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'login': return <LogIn size={14} className="text-emerald-500" />;
      case 'logout': return <LogOut size={14} className="text-slate-400" />;
      case 'register':
      case 'register_invite': return <UserPlus size={14} className="text-indigo-500" />;
      case 'user_approved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'user_rejected': return <XCircle size={14} className="text-rose-500" />;
      case 'store_created': return <Store size={14} className="text-amber-500" />;
      case 'shift_opened': return <Zap size={14} className="text-yellow-500" />;
      case 'shift_closed': return <PauseCircle size={14} className="text-slate-500" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  const getEventBadge = (event: string) => {
    const base = "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border";
    switch (event) {
      case 'login': return `${base} bg-emerald-50 border-emerald-100 text-emerald-600`;
      case 'user_approved': return `${base} bg-indigo-50 border-indigo-100 text-indigo-600`;
      case 'user_rejected': return `${base} bg-rose-50 border-rose-100 text-rose-600`;
      case 'store_created': return `${base} bg-amber-50 border-amber-100 text-amber-600`;
      case 'register': return `${base} bg-sky-50 border-sky-100 text-sky-600`;
      default: return `${base} bg-slate-50 border-slate-100 text-slate-500`;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/70 backdrop-blur-xl p-10 rounded-[4rem] border border-white/60 shadow-xl shadow-slate-200/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">Security Audit Trail</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Log Aktivitas</h1>
          <p className="text-sm text-slate-400 font-medium">Rekaman lengkap seluruh interaksi dan perubahan data dalam sistem.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Total Entries</p>
            <p className="text-2xl font-black text-[#0F172A]">{pagination.total.toLocaleString()}</p>
          </div>
          <button
            onClick={() => fetchLogs(pagination.current)}
            className="w-14 h-14 bg-[#4F46E5] text-white rounded-[1.5rem] flex items-center justify-center hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Cari dalam log (deskripsi, nama, IP)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-16 pr-6 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl outline-none font-bold text-sm transition-all focus:ring-4 ring-indigo-50/50"
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-14 px-6 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none border-none focus:ring-4 ring-indigo-50"
          >
            <option value="all">Semua Event</option>
            <option value="login">Login</option>
            <option value="register">Register</option>
            <option value="user_approved">Approval</option>
            <option value="user_rejected">Penolakan</option>
            <option value="store_created">Buat Toko</option>
            <option value="shift_opened">Buka Toko</option>
            <option value="shift_closed">Tutup Toko</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white rounded-[4rem] border border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-100 ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Event</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Aktor / User</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Deskripsi Aktivitas</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Device Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.filter(l => {
                const searchLower = search.toLowerCase();
                const descMatch = l.description.toLowerCase().includes(searchLower);
                const userMatch = l.user?.name?.toLowerCase().includes(searchLower) || false;
                return descMatch || userMatch;
              }).map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#0F172A] font-black text-xs">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <span className={getEventBadge(log.event)}>
                        {log.event.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs">
                        {log.user?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0F172A]">{log.user?.name || 'Guest / System'}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{log.user?.role || 'Visitor'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="max-w-md">
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic border-l-2 border-indigo-100 pl-4 py-1">
                        "{log.description}"
                      </p>
                      {log.store && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 w-fit px-2 py-1 rounded-lg">
                          <Store size={10} />
                          {log.store.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                        <Globe size={12} className="text-slate-300" />
                        {log.ip_address}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-medium text-slate-400 max-w-[150px] truncate" title={log.user_agent}>
                        <Monitor size={12} className="text-slate-300" />
                        {log.user_agent}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && !loading && (
            <div className="p-32 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                <History size={32} className="text-slate-200" />
              </div>
              <h4 className="text-lg font-black text-slate-300">Belum ada rekaman aktivitas</h4>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Page {pagination.current} of {pagination.last}
          </div>
          <div className="flex gap-3">
            <button
              disabled={pagination.current === 1 || loading}
              onClick={() => fetchLogs(pagination.current - 1)}
              className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Prev
            </button>
            <button
              disabled={pagination.current === pagination.last || loading}
              onClick={() => fetchLogs(pagination.current + 1)}
              className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stub for PauseCircle as it was missing from imports
function PauseCircle({ size, className }: { size: number, className: string }) {
  return <XCircle size={size} className={className} />;
}
