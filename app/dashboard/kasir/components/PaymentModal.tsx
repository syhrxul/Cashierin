'use client';

import { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  ChevronRight,
  ShoppingCart,
  Receipt,
  CheckCircle2,
  Loader2,
  Printer,
  Package
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  appliedCoupon: any;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  cart,
  subtotal,
  discount,
  tax,
  total,
  appliedCoupon,
  onSuccess
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'qris' | null>(null);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  const change = parseFloat(cashAmount) - total;

  const handleComplete = async () => {
    if (!paymentMethod) return;
    if (paymentMethod === 'cash' && (parseFloat(cashAmount) < total || !cashAmount)) {
      alert('Uang tunai tidak mencukupi!');
      return;
    }

    setLoading(true);
    try {
      const storeJson = localStorage.getItem('store');
      const store = storeJson ? JSON.parse(storeJson) : null;
      if (!store?.id) throw new Error('Data toko tidak ditemukan.');

      const body = {
        store_id: store.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        coupon_code: appliedCoupon?.code || null,
        payment_method: paymentMethod
      };

      const res: any = await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      setSuccessData(res.data);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
    setSuccessData(null);
    setPaymentMethod(null);
    setCashAmount('');
  };

  if (successData) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
        <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden p-10 text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 italic animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Transaksi Berhasil!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Nomor Struk: {successData.receipt_number}</p>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-4">
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Metode</span>
              <span className="text-slate-800 uppercase">{successData.payment_method}</span>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-slate-600">Rp {successData.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {successData.discount_amount > 0 && (
                <div className="flex justify-between text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <span>Diskon</span>
                  <span>-Rp {successData.discount_amount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>PPN (11%)</span>
                <span className="text-slate-600">Rp {((successData.subtotal - successData.discount_amount) * 0.11).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pt-2">
                <span>Total Bayar</span>
                <span className="text-[#4F46E5] text-base">Rp {successData.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-200">
                <span>Kembalian</span>
                <span className="text-rose-500">Rp {change.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 print:hidden text-center">
            <button onClick={() => window.print()} className="h-14 bg-white border border-slate-200 text-[#0F172A] font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest underline decoration-2 decoration-indigo-200 underline-offset-4">
              <Printer size={18} /> Cetak Struk
            </button>
            <button onClick={handleDone} className="h-14 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">
              Transaksi Baru <ChevronRight size={16} />
            </button>
          </div>

          <div className="hidden print:block thermal-receipt-print text-center font-mono text-[10px] p-2 text-black bg-white">
            <div className="border-b border-dashed border-black pb-4 mb-4">
              <h2 className="text-lg font-bold uppercase">{successData.store?.name || 'CashierIn'}</h2>
              <p>{successData.store?.address || ''}</p>
              <p>Jam: {successData.store?.business_hours || ''}</p>
            </div>

            <div className="text-left space-y-1 mb-4">
              <div className="flex justify-between"><span>No:</span> <span>{successData.receipt_number}</span></div>
              <div className="flex justify-between"><span>Kasir:</span> <span>{successData.user?.name || 'Kasir'}</span></div>
              <div className="flex justify-between"><span>Waktu:</span> <span>{new Date().toLocaleString('id-ID')}</span></div>
            </div>

            <div className="border-y border-dashed border-black py-2 mb-4 text-left">
              <div className="flex justify-between font-bold">
                <span>Produk</span>
                <span>Total</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-left">
              {successData.items?.map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between">
                    <span>{item.product?.name || item.name || 'Produk'}</span>
                    <span>{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-[9px]">{item.quantity} x {item.price.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black pt-4 space-y-1 text-left">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{successData.subtotal.toLocaleString('id-ID')}</span></div>
              {successData.discount_amount > 0 && (
                <div className="flex justify-between"><span>Diskon:</span> <span>-{successData.discount_amount.toLocaleString('id-ID')}</span></div>
              )}
              <div className="flex justify-between">
                <span>PPN (11%):</span>
                <span>{((successData.subtotal - successData.discount_amount) * 0.11).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-black">
                <span>TOTAL:</span>
                <span>Rp {successData.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-black">
              <p className="uppercase">Terima Kasih</p>
              <p className="text-[8px]">Barang tidak dapat ditukar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-t-[3rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row h-full md:h-auto max-h-[90vh]">

        {/* Left: Summary */}
        <div className="flex-1 p-10 bg-slate-50 border-r border-slate-100 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-200">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Ringkasan Bill</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail item & Pembayaran</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs font-black text-emerald-500 uppercase tracking-widest">
                  <span>Diskon {appliedCoupon?.name}</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
                <span>Pajak (PPN 11%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-black text-slate-800 tracking-tighter">TOTAL AKHIR</span>
                <span className="text-3xl font-black text-indigo-600 tracking-tighter">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Methods */}
        <div className="w-full md:w-[450px] p-10 bg-white space-y-8 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Metode Bayar</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-rose-500"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setPaymentMethod('qris')}
              className={`h-24 rounded-[2rem] border-2 transition-all flex items-center gap-6 px-8 relative overflow-hidden group ${paymentMethod === 'qris' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-100 text-slate-700'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${paymentMethod === 'qris' ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-indigo-500'}`}>
                <QrCode size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tight">QRIS / E-Wallet</p>
                <p className={`text-[10px] font-bold ${paymentMethod === 'qris' ? 'text-indigo-200' : 'text-slate-400'}`}>DANA, OVO, ShopeePay, m-Banking</p>
              </div>
              <ChevronRight size={18} className={`ml-auto opacity-40 group-hover:opacity-100 transition-opacity ${paymentMethod === 'qris' ? 'text-white' : 'text-slate-300'}`} />
            </button>

            <button
              onClick={() => setPaymentMethod('cash')}
              className={`h-24 rounded-[2rem] border-2 transition-all flex items-center gap-6 px-8 relative overflow-hidden group ${paymentMethod === 'cash' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-100 text-slate-700'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${paymentMethod === 'cash' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-emerald-500'}`}>
                <Banknote size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tight">Tunai / Cash</p>
                <p className={`text-[10px] font-bold ${paymentMethod === 'cash' ? 'text-emerald-200' : 'text-slate-400'}`}>Pembayaran fisik uang kertas</p>
              </div>
              <ChevronRight size={18} className={`ml-auto opacity-40 group-hover:opacity-100 transition-opacity ${paymentMethod === 'cash' ? 'text-white' : 'text-slate-300'}`} />
            </button>

            <button
              onClick={() => setPaymentMethod('debit')}
              className={`h-24 rounded-[2rem] border-2 transition-all flex items-center gap-6 px-8 relative overflow-hidden group ${paymentMethod === 'debit' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${paymentMethod === 'debit' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}>
                <CreditCard size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tight">Kartu Debit</p>
                <p className={`text-[10px] font-bold ${paymentMethod === 'debit' ? 'text-slate-400' : 'text-slate-400'}`}>Gesek/Dip menggunakan mesin EDC</p>
              </div>
              <ChevronRight size={18} className={`ml-auto opacity-40 group-hover:opacity-100 transition-opacity ${paymentMethod === 'debit' ? 'text-white' : 'text-slate-300'}`} />
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Uang yang diterima</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                <input
                  type="number"
                  autoFocus
                  placeholder="Masukkan nominal..."
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 bg-white border-2 border-transparent focus:border-emerald-200 rounded-2xl outline-none font-black text-lg text-emerald-600 transition-all shadow-sm"
                />
              </div>
              {cashAmount && parseFloat(cashAmount) >= total && (
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kembalian</span>
                  <span className="text-lg font-black text-rose-500 tracking-tighter tabular-nums">Rp {change.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-6">
            <button
              onClick={handleComplete}
              disabled={loading || !paymentMethod || (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total))}
              className="w-full h-20 bg-indigo-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 disabled:bg-slate-200 disabled:shadow-none active:scale-[0.98] group overflow-hidden"
            >
              {loading ? <Loader2 size={24} className="animate-spin text-white" /> : (
                <>
                  <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-lg uppercase tracking-widest">Selesaikan Pembayaran</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .thermal-receipt-print, .thermal-receipt-print * { visibility: visible; }
          .thermal-receipt-print {
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
            background: white !important;
            color: black !important;
          }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
    </div>
  );
}
