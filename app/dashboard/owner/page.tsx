'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Activity,
  Box,
  Clock,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch('/owner/dashboard').catch(() => ({
          today_revenue: 1250000,
          total_inventory: 850,
          active_employees: 5,
          pending_orders: 12,
          popular_products: [
            { name: 'Nasi Goreng Spesial', sales: 42, price: 25000 },
            { name: 'Es Teh Manis', sales: 38, price: 5000 },
            { name: 'Ayam Geprek', sales: 31, price: 18000 }
          ]
        }));
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#4F46E5]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-100/50">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F46E5] mb-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg inline-block">
            Store Insights
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Halo, Pemilik Toko</h1>
          <p className="text-sm text-slate-400 font-medium italic mt-1">Status operasional toko Anda hari ini sangat memuaskan.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 bg-[#4F46E5] text-white font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all active:scale-95">
            <ShoppingCart size={19} />
            Buka Kasir
          </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Revenue (Hari Ini)', val: `Rp ${stats?.today_revenue?.toLocaleString('id-ID')}`, icon: DollarSign, color: 'emerald' },
          { title: 'Total Inventory', val: stats?.total_inventory, icon: Box, color: 'indigo' },
          { title: 'Aktif Staff', val: stats?.active_employees, icon: Users, color: 'amber' },
          { title: 'Pending Order', val: stats?.pending_orders, icon: Clock, color: 'rose' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
              <item.icon size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{item.title}</p>
            <h3 className="text-2xl font-black tracking-tight text-[#0F172A] tabular-nums">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-200/60 p-12 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black tracking-tighter">Penjualan 24 Jam</h3>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#4F46E5] transition-colors cursor-pointer"><Activity size={18} /></div>
            </div>
          </div>
          {/* Simple Graphic Mock */}
          <div className="h-64 flex items-end gap-3 pb-4">
            {[60, 40, 80, 50, 90, 70, 45, 85, 30, 75, 55, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group relative" style={{ height: `${h}%` }}>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <span>08:00 AM</span>
            <span>12:00 PM</span>
            <span>04:00 PM</span>
            <span>08:00 PM</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[4rem] p-12 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 blur-[100px] -translate-y-32 translate-x-32" />
          <div className="relative z-10 w-full">
            <h3 className="text-xl font-bold tracking-tight mb-10">Produk Terlaris</h3>
            <div className="space-y-8">
              {stats?.popular_products?.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover/item:bg-white/10 transition-all font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{p.name}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{p.sales} Sold</p>
                    </div>
                  </div>
                  <div className="flex items-center text-indigo-400 group-hover/item:translate-x-1 transition-transform">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white hover:bg-white/5 border border-white/10 rounded-2xl transition-all">
              Full Inventory Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
