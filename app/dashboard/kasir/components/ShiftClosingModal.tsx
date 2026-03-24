'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  ChevronRight,
  Loader2,
  Lock,
  History,
  Info,
  Calculator,
  ArrowRightLeft,
  AlertCircle,
  QrCode,
  CreditCard
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ShiftClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: any;
  onSuccess: () => void;
}

export default function ShiftClosingModal({ isOpen, onClose, shift, onSuccess }: ShiftClosingModalProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [closingMode, setClosingMode] = useState<'manual' | 'auto'>('manual');
  const [endingCash, setEndingCash] = useState<string>('0');

  useEffect(() => {
    if (isOpen && shift) {
      const fetchSummary = async () => {
        try {
          const res: any = await apiFetch(`/shifts/${shift.id}/summary`);
          setSummary(res?.data);
          // Default ending cash to expected if it's auto
          if (closingMode === 'auto' && res?.data?.expected_drawer_cash !== undefined) {
            setEndingCash(String(res.data.expected_drawer_cash || 0));
          }
        } catch (err) {
          console.error('[Shift] Error fetching summary', err);
        }
      };
      fetchSummary();
    }
  }, [isOpen, shift]);

  useEffect(() => {
    if (summary && closingMode === 'auto') {
      setEndingCash(String(summary.expected_drawer_cash || 0));
    }
  }, [closingMode, summary]);

  if (!isOpen || !shift) return null;

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/shifts/${shift.id}/close`, {
        method: 'POST',
        body: JSON.stringify({
          ending_cash: parseFloat(endingCash) || 0
        })
      });
      alert('Shift berhasil ditutup! Sampai jumpa lagi.');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menutup shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-slate-100 bg-rose-50/20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-100">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Tutup Sesi Kasir</h2>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Finalisasi Pendapatan & Stok</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-300 hover:text-rose-500"><X size={24} /></button>
        </div>

        <div className="p-10 flex flex-col md:flex-row gap-10">
          {/* Left: Summary Stats */}
          <div className="flex-1 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Ringkasan Sesi</h3>

            <div className="space-y-2">
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Modal Awal</span>
                <span className="text-sm font-black text-slate-800 tabular-nums">Rp {summary?.starting_cash?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Banknote size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Tunai (Laci)</span>
                </div>
                <span className="text-sm font-black text-emerald-600 tabular-nums">+Rp {summary?.cash_sales?.toLocaleString('id-ID')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode size={12} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase">QRIS</span>
                  </div>
                  <p className="text-xs font-black text-indigo-600 tabular-nums">Rp {summary?.qris_sales?.toLocaleString('id-ID')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase">Debit/Kredit</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 tabular-nums">Rp {((summary?.debit_sales || 0) + (summary?.credit_sales || 0)).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-2 mb-2 opacity-50">
                <Banknote size={14} />
                <p className="text-[9px] font-black uppercase tracking-widest">Total Ekspektasi Laci</p>
              </div>
              <h4 className="text-2xl font-black tabular-nums tracking-tighter italic">Rp {summary?.expected_drawer_cash?.toLocaleString('id-ID')}</h4>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <p className="text-[9px] font-bold text-amber-700 leading-tight">Uang Fisik di Laci = Modal Awal + Penjualan Tunai.</p>
            </div>
          </div>

          {/* Right: Closing Action */}
          <div className="w-full md:w-[280px] space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Metode Input</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setClosingMode('manual')}
                  className={`h-14 rounded-2xl border-2 flex items-center gap-3 px-5 transition-all text-xs font-black uppercase tracking-widest ${closingMode === 'manual' ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                >
                  <Calculator size={18} /> Hitung Manual
                </button>
                <button
                  onClick={() => setClosingMode('auto')}
                  className={`h-14 rounded-2xl border-2 flex items-center gap-3 px-5 transition-all text-xs font-black uppercase tracking-widest ${closingMode === 'auto' ? 'bg-white border-emerald-600 text-emerald-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                >
                  <ArrowRightLeft size={18} /> Sesuai Data
                </button>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Uang Akhir di Laci</label>
                <div className="relative group">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black transition-colors ${closingMode === 'auto' ? 'text-emerald-500' : 'text-slate-300'}`}>Rp</span>
                  <input
                    type="number"
                    readOnly={closingMode === 'auto'}
                    value={endingCash}
                    onChange={(e) => setEndingCash(e.target.value)}
                    className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none font-black text-lg transition-all border-2 ${closingMode === 'auto' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 focus:border-indigo-100 text-slate-800'}`}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full h-16 bg-slate-900 text-white font-black rounded-3xl hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span className="text-xs uppercase tracking-widest">Selesaikan Sesi</span>
                    <ChevronRight size={18} className="opacity-40" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
