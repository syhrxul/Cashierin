'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Receipt,
  User as UserIcon,
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
  Banknote,
  QrCode,
  CreditCard,
  Filter,
  ArrowRight
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import ReceiptDetailModal from '../components/ReceiptDetailModal';

export default function SalesHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    fetchHistory();
  }, []);

  const filtered = transactions.filter(t =>
    t.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-50">
            <Receipt size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase italic">Riwayat Penjualan</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Detail Transaksi Dan Aktivitas Kasir Di Seluruh Shift</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchHistory} className="h-14 px-8 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Refresh Data</button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/20">
          <div className="relative group w-full max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari Nomor Struk atau Nama Kasir..."
              className="w-full h-16 pl-16 pr-8 bg-white border border-slate-200 rounded-3xl outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-8 md:p-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-xs font-black uppercase tracking-widest">Sedang Mengambil Data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-200 italic">
              <Receipt size={80} opacity={0.2} />
              <p className="text-lg font-black tracking-tight text-slate-300">Kosong. Belum ada transaksi yang tercatat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTransaction(t);
                    setIsModalOpen(true);
                  }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-indigo-100 transition-all group flex flex-col gap-6 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-50 group-hover:bg-indigo-50/50 transition-colors" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:bg-indigo-600 transition-colors">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 tracking-tight">{t.receipt_number}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${t.payment_method === 'cash' ? 'bg-emerald-50 text-emerald-600' :
                              t.payment_method === 'qris' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            <span className="flex items-center gap-1.5">
                              {t.payment_method === 'cash' && <Banknote size={10} />}
                              {t.payment_method === 'qris' && <QrCode size={10} />}
                              {t.payment_method === 'debit' && <CreditCard size={10} />}
                              {t.payment_method}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-2"><UserIcon size={12} className="text-indigo-400" /> Kasir</span>
                      <span className="text-slate-800">{t.user?.name || 'Sistem'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-2"><Calendar size={12} /> Tanggal</span>
                      <span className="text-slate-800">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-2"><Clock size={12} /> Waktu</span>
                      <span className="text-slate-800">{new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="pt-6 mt-2 flex items-center justify-between border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 leading-none">Total Bayar</p>
                      <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter italic">Rp {t.total_amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReceiptDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
