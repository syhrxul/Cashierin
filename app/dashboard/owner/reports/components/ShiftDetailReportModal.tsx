'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Clock,
  User,
  CreditCard,
  Banknote,
  Receipt,
  TrendingUp,
  ChevronRight,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ShiftDetailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: number | null;
}

export default function ShiftDetailReportModal({
  isOpen,
  onClose,
  shiftId
}: ShiftDetailReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'transactions'>('items');

  useEffect(() => {
    if (isOpen && shiftId) {
      fetchDetail();
    }
  }, [isOpen, shiftId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res: any = await apiFetch(`/shifts/${shiftId}/summary`);
      setData(res.data);
    } catch (err) {
      console.error('[Report] Failed to fetch shift summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#F8FAFC] rounded-[4rem] shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-10 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <Layers size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-1 uppercase">Detail Shift #{shiftId}</h3>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2 italic">
                <User size={14} className="text-indigo-400" /> {data?.cashier_name || 'Loading...'}
                <span className="opacity-30">|</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-black ${data?.status === 'closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {data?.status === 'closed' ? 'Selesai' : 'Aktif'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
          >
            <X size={28} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30">
            <Loader2 size={64} className="animate-spin text-indigo-600 mb-6" />
            <p className="font-black uppercase tracking-[0.2em] text-xs">Menghimpun Laporan...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Penjualan</p>
                <p className="text-2xl font-black text-indigo-600 tracking-tighter">Rp {data.total_sales.toLocaleString('id-ID')}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span>Gross Revenue</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tunai di Laci</p>
                <p className="text-2xl font-black text-[#0F172A] tracking-tighter">Rp {data.expected_drawer_cash.toLocaleString('id-ID')}</p>
                <p className="text-[9px] font-medium text-slate-400">Modal: Rp {data.starting_cash.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Non-Tunai</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">QRIS</span>
                    <span className="text-indigo-500">Rp {data.qris_sales.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Kartu</span>
                    <span className="text-indigo-500">Rp {(data.debit_sales + data.credit_sales).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Operasional</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#0F172A] truncate">
                    <Clock size={10} className="inline mr-1 text-indigo-400" />
                    {new Date(data.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {data.ended_at ? new Date(data.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Sekarang'}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400">
                    <Calendar size={10} className="inline mr-1" />
                    {new Date(data.started_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-2 bg-slate-100/50 rounded-3xl w-fit">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'items' ? 'bg-white shadow-xl shadow-indigo-100/50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Package size={16} /> Produk Terjual
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'transactions' ? 'bg-white shadow-xl shadow-indigo-100/50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Receipt size={16} /> Log Transaksi
              </button>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'items' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.items_sold.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-30">
                      <Package size={64} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Belum ada item terjual</p>
                    </div>
                  ) : data.items_sold.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-50 flex items-center justify-between group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <Package size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-[#0F172A] text-sm uppercase truncate max-w-[180px]">{item.product_name}</h4>
                          <p className="text-xs font-bold text-slate-400">Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-indigo-600 tracking-tighter">x{item.total_quantity}</div>
                        <div className="text-[10px] font-bold text-slate-300 uppercase tabular-nums">Rp {item.total_amount.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Order ID</th>
                        <th className="px-6 py-5">Waktu</th>
                        <th className="px-6 py-5 text-right">Metode</th>
                        <th className="px-8 py-5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-20 text-center opacity-30">
                            <Receipt size={48} className="mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase">Tidak ada transaksi tercatat</p>
                          </td>
                        </tr>
                      ) : data.transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">#{t.order_number || t.id}</td>
                          <td className="px-6 py-5 text-[11px] font-bold text-[#0F172A] capitalize">
                            {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${t.payment_method === 'cash' ? 'bg-emerald-50 text-emerald-600' :
                              t.payment_method === 'qris' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-amber-50 text-amber-600'
                              }`}>
                              {t.payment_method}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-[#0F172A] tabular-nums">
                            Rp {t.total_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
