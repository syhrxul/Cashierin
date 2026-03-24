'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  FileText,
  CalendarDays,
  Clock,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Smartphone,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import ShiftDetailReportModal from './components/ShiftDetailReportModal';

export default function LaporanPenjualanShiftPage() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalCash: 0,
    totalQris: 0,
    totalDebit: 0,
    totalTransactions: 0
  });

  // Modal State
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch(`/shifts?date=${selectedDate}`);
      const fetchedShifts = res.data || [];

      setShifts(fetchedShifts);

      // Calculate daily summary
      let tSales = 0, tCash = 0, tQris = 0, tDebit = 0, tTxs = 0;
      fetchedShifts.forEach((s: any) => {
        tSales += (parseFloat(s.total_sales) || 0);
        tCash += (parseFloat(s.total_cash_sales) || 0);
        tQris += (parseFloat(s.total_qris_sales) || 0);
        tDebit += (parseFloat(s.total_debit_sales) || 0);
        tTxs += (parseInt(s.completed_transactions_count) || 0);
      });

      setSummary({ totalSales: tSales, totalCash: tCash, totalQris: tQris, totalDebit: tDebit, totalTransactions: tTxs });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-6 md:p-10 animate-in fade-in duration-700">

      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><FileText size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <TrendingUp size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Analytics & Sales</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#0F172A]">Laporan Penjualan</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg">Pantau total pendapatan dari semua transaksi serta rekonsiliasi setoran kasir berdasarkan shift harian.</p>
        </div>

        {/* Date Filter */}
        <div className="relative z-10 flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-full md:w-auto items-center gap-4 px-6 h-16">
          <CalendarDays size={20} className="text-indigo-500 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-sm font-black text-slate-700 uppercase focus:ring-0 p-0 w-36 outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Laporan...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Total Sales */}
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign size={24} className="text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Penjualan</p>
              <h3 className="text-3xl font-black tracking-tighter">Rp {summary.totalSales.toLocaleString('id-ID')}</h3>
              <div className="mt-4 flex items-center gap-2 bg-indigo-700/50 py-1.5 px-3 rounded-lg max-w-max border border-indigo-500/30">
                <Receipt size={14} className="text-indigo-300" />
                <span className="text-[10px] font-extrabold text-indigo-100">{summary.totalTransactions} Transaksi Selesai</span>
              </div>
            </div>

            {/* Cash */}
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                <DollarSign size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pemasukan Tunai</p>
              <h3 className="text-2xl font-black tracking-tighter text-slate-800">Rp {summary.totalCash.toLocaleString('id-ID')}</h3>
            </div>

            {/* QRIS */}
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-sky-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-sky-600">
                <Smartphone size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pemasukan QRIS</p>
              <h3 className="text-2xl font-black tracking-tighter text-slate-800">Rp {summary.totalQris.toLocaleString('id-ID')}</h3>
            </div>

            {/* Debit/Credit */}
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <CreditCard size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pemasukan Kartu</p>
              <h3 className="text-2xl font-black tracking-tighter text-slate-800">Rp {summary.totalDebit.toLocaleString('id-ID')}</h3>
            </div>

          </div>

          <div className="bg-white p-4 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col items-start min-h-[60vh] border border-slate-200 shadow-xl shadow-slate-100/50">
            <h2 className="text-xl font-black tracking-tighter text-slate-800 mb-8 mx-2 lg:mx-4">Rincian Per Shift</h2>

            <div className="w-full overflow-x-auto rounded-[2rem] border border-slate-100">
              {shifts.length === 0 ? (
                <div className="py-24 text-center bg-slate-50/50">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
                  <p className="font-black uppercase tracking-widest text-slate-400">Tidak ada data shift</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Berdasarkan tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap">
                      <th className="py-5 px-6 font-black rounded-tl-[2rem]">Kasir</th>
                      <th className="py-5 px-6 font-black">Waktu Tugas</th>
                      <th className="py-5 px-6 font-black">Pendapatan Aktual</th>
                      <th className="py-5 px-6 font-black">Rincian Sales</th>
                      <th className="py-5 px-6 font-black rounded-tr-[2rem]">Rekonsiliasi Tunai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {shifts.map((s) => {
                      const kasirName = s.user?.name || `Kasir #${s.user_id}`;
                      const salesTotal = parseFloat(s.total_sales) || 0;
                      const salesCash = parseFloat(s.total_cash_sales) || 0;
                      const txCount = parseInt(s.completed_transactions_count) || 0;

                      const modalAwal = parseFloat(s.starting_cash) || 0;

                      // Rekonsiliasi Cash ONLY
                      // Tunai yang diharapkan ada di laci = Modal Awal + Total Penjualan Cash
                      const expectedCash = modalAwal + salesCash;
                      const actualDrawerCash = s.status === 'closed' ? (parseFloat(s.ending_cash) || 0) : null;
                      const selisih = actualDrawerCash !== null ? (actualDrawerCash - expectedCash) : 0;

                      return (
                        <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                          {/* Kasir */}
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shadow-inner">
                                {kasirName.substring(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-sm font-black text-slate-800">{kasirName}</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {s.status === 'open' ? <Clock size={10} className="text-emerald-500" /> : <CheckCircle2 size={10} className="text-slate-400" />}
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${s.status === 'open' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {s.status === 'open' ? 'Sedang Aktif' : 'Shift Selesai'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Waktu */}
                          <td className="py-6 px-6 relative whitespace-nowrap">
                            <p className="text-xs font-bold text-slate-600 mb-1">{new Date(s.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><ArrowRight size={10} className="" /> {s.ended_at ? new Date(s.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}</p>
                          </td>

                          {/* Pendapatan (All Metrics) */}
                          <td className="py-6 px-6">
                            <div className="space-y-1">
                              <p className="text-sm font-black text-indigo-600">Rp {salesTotal.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md max-w-max border border-slate-100">{txCount} Transaksi</p>
                            </div>
                          </td>

                          {/* Rincian Non-Tunai dll */}
                          <td className="py-6 px-6">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div className="text-[10px] font-bold text-emerald-600"><span className="text-slate-400 font-medium">Tunai:</span> Rp {salesCash.toLocaleString('id-ID')}</div>
                              <div className="text-[10px] font-bold text-sky-600"><span className="text-slate-400 font-medium">QRIS:</span> Rp {(parseFloat(s.total_qris_sales) || 0).toLocaleString('id-ID')}</div>
                              <div className="text-[10px] font-bold text-blue-600"><span className="text-slate-400 font-medium">Kartu:</span> Rp {(parseFloat(s.total_debit_sales) || 0).toLocaleString('id-ID')}</div>
                            </div>
                          </td>

                          {/* Tunai Aktual / Modals */}
                          <td className="py-6 px-6">
                            <div className="flex flex-col gap-3">
                              {s.status === 'closed' ? (
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl w-64 shadow-sm group-hover:bg-white transition-all">
                                  <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-500">
                                    <span>Uang Laci (Actual):</span>
                                    <span className="text-slate-800">Rp {actualDrawerCash?.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                                    <span>Seharusnya (Expected):</span>
                                    <span>Rp {expectedCash.toLocaleString('id-ID')}</span>
                                  </div>

                                  <div className="h-px bg-slate-200 my-2 w-full"></div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Selisih:</span>
                                    <span className={`text-xs font-black ${selisih === 0 ? 'text-emerald-500' : selisih > 0 ? 'text-blue-500' : 'text-rose-500'}`}>
                                      {selisih > 0 ? '+' : ''}{selisih === 0 ? 'PAS (0)' : `Rp ${Math.abs(selisih).toLocaleString('id-ID')}`}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold p-3 rounded-2xl flex items-center gap-2 max-w-max">
                                  <AlertCircle size={14} /> Menunggu Shift Ditutup
                                </div>
                              )}

                              {/* DETAIL BUTTON */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedShiftId(s.id);
                                  setIsModalOpen(true);
                                }}
                                className="w-full h-10 bg-[#0F172A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                              >
                                <Eye size={14} /> Lihat Detail Produk
                              </button>
                            </div>
                          </td>

                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL DETAIL */}
      <ShiftDetailReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shiftId={selectedShiftId}
      />
    </div>
  );
}

// Inline ArrowRight to save imports
const ArrowRight = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
