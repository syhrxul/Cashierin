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
  ArrowDownLeft
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ShiftOpeningOverlayProps {
  isOpen: boolean;
  onSuccess: (shift: any) => void;
}

export default function ShiftOpeningOverlay({ isOpen, onSuccess }: ShiftOpeningOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [startingCash, setStartingCash] = useState('0');
  const [lastShift, setLastShift] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchLastShift = async () => {
        try {
          const res: any = await apiFetch('/shifts/last-closed');
          if (res.data) {
            setLastShift(res.data);
            setStartingCash(res.data.ending_cash.toString());
          }
        } catch (err) {
          console.log('[Shift] No previous shift found');
          setLastShift(null);
          setStartingCash('0');
        }
      };
      fetchLastShift();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await apiFetch('/shifts', {
        method: 'POST',
        body: JSON.stringify({
          starting_cash: parseFloat(startingCash) || 0,
          notes: notes
        })
      });
      onSuccess(res.data);
      alert('Shift berhasil dibuka! Selamat bekerja.');
    } catch (err: any) {
      alert(err.message || 'Gagal membuka shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Buka Shift Kasir</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Input Modal Awal Laci Kasir</p>
          </div>
        </div>

        <form onSubmit={handleOpenShift} className="p-10 space-y-8">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm"><Info size={20} /></div>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">Anda perlu membuka sesi shift baru sebelum bisa melakukan transaksi penjualan hari ini.</p>
          </div>

          <div className="space-y-4">
            {lastShift && (
              <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between group animate-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Uang Kas Akhir Sebelumnya</p>
                    <p className="text-sm font-black text-slate-800 tabular-nums">Rp {lastShift.ending_cash.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStartingCash(lastShift.ending_cash.toString())}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline uppercase tracking-tighter"
                >
                  Gunakan
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Modal Awal (Tunai di Laci)</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="w-full h-16 pl-16 pr-6 bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-3xl outline-none transition-all font-black text-xl text-emerald-600 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Catatan Shift (Opsional)</label>
              <textarea
                placeholder="Contoh: Shift Pagi - Laci OK"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl outline-none transition-all font-bold text-slate-700 min-h-[100px] shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-indigo-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 disabled:bg-slate-200"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <>
                <span className="text-lg uppercase tracking-widest">Buka Sesi Kasir</span>
                <ChevronRight size={22} className="opacity-40" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-slate-300">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sesi anda akan tercatat otomatis</span>
          </div>
        </form>
      </div>
    </div>
  );
}
