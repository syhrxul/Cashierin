'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Receipt, 
  User as UserIcon, 
  Clock, 
  Calendar,
  ChevronRight,
  Loader2,
  Filter,
  ArrowRight,
  Banknote,
  QrCode,
  CreditCard
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SalesHistoryModal({ isOpen, onClose }: SalesHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res: any = await apiFetch('/transactions');
      setTransactions(res.data.data || res.data || []);
    } catch (err) {
      console.error('[History] Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = transactions.filter(t => 
    t.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'cash': return <Banknote size={14} className="text-emerald-500" />;
      case 'qris': return <QrCode size={14} className="text-indigo-500" />;
      default: return <CreditCard size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl h-full md:h-[80vh] rounded-none md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-50 color-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
               <Receipt size={28} className="text-indigo-600" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Riwayat Penjualan</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semua transaksi & Aktivitas Kasir</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-10 py-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center shrink-0">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari Nomor Struk atau Nama Kasir..."
              className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchHistory} className="h-14 px-8 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all">Refresh</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
              <Loader2 className="animate-spin" size={40} />
              <p className="text-xs font-black uppercase tracking-widest">Memuat Riwayat...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-200 italic">
               <Receipt size={64} opacity={0.2} />
               <p className="text-sm font-bold">Belum ada transaksi ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((t) => (
                <div key={t.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                        <Receipt size={20} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-black text-slate-800 tracking-tight">{t.receipt_number}</span>
                           <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{t.payment_method}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                           <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                           <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10">
                     <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1 text-slate-400">
                           <UserIcon size={12} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kasir: {t.user?.name || 'Sistem'}</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 tabular-nums tracking-tighter italic">Rp {t.total_amount.toLocaleString('id-ID')}</p>
                     </div>
                     <ArrowRight size={20} className="text-slate-100 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
