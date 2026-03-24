'use client';

import {
   X,
   Printer,
   CheckCircle2,
   Calendar,
   Clock,
   User as UserIcon,
   Tag,
   CreditCard,
   QrCode,
   Banknote,
   MapPin,
   Timer
} from 'lucide-react';

interface ReceiptDetailModalProps {
   isOpen: boolean;
   onClose: () => void;
   transaction: any;
}

export default function ReceiptDetailModal({ isOpen, onClose, transaction }: ReceiptDetailModalProps) {
   if (!isOpen || !transaction) return null;

   const handlePrint = () => {
      window.print();
   };

   return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
         <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">

            {/* Header - Hidden on Print */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 print:hidden">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                     <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Detail Transaksi</h3>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-rose-500"><X size={24} /></button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50 print:bg-white print:p-0">

               {/* The Receipt Structure - Thermal Style */}
               <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 thermal-receipt relative mx-auto print:shadow-none print:border-none print:rounded-none print:w-[80mm] print:p-0">

                  {/* Receipt Header (Thermal B&W) */}
                  <div className="text-center space-y-2 mb-6 pb-6 border-b border-dashed border-slate-300 print:border-slate-900">
                     <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 print:text-5xl print:mb-2">
                        {transaction.store?.name || 'CashierIn'}
                     </h2>
                     {transaction.store?.address && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1 print:text-slate-900 print:text-[14px]">
                           {transaction.store.address}
                        </p>
                     )}
                     {transaction.store?.business_hours && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 print:text-slate-900 print:text-[12px]">
                           Jam: {transaction.store.business_hours}
                        </p>
                     )}
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-6 text-[10px] font-black uppercase tracking-tight text-slate-500 print:text-slate-900 print:text-[14px]">
                     <div className="flex justify-between">
                        <span>Struk:</span>
                        <span>{transaction.receipt_number}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>{transaction.user?.name || 'Sistem'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{new Date(transaction.created_at).toLocaleDateString('id-ID')} {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                  </div>

                  {/* Item List Header */}
                  <div className="border-y border-dashed border-slate-300 py-3 print:border-slate-900">
                     <div className="flex justify-between text-[11px] font-black text-slate-800 uppercase print:text-[16px]">
                        <span>Produk</span>
                        <span>Total</span>
                     </div>
                  </div>

                  <div className="py-4 space-y-4">
                     {/* Items */}
                     {transaction.items?.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                           <div className="flex justify-between text-[11px] font-black text-slate-800 tracking-tight print:text-[16px]">
                              <span className="truncate max-w-[180px] print:max-w-none">{item.product_name || item.name}</span>
                              <span className="tabular-nums">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 print:text-slate-900 print:text-[14px]">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                     ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t-2 border-slate-900 pt-6 space-y-3 print:border-t-4">
                     <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 print:text-slate-900 print:text-[16px]">
                        <span>Subtotal</span>
                        <span>Rp {transaction.subtotal?.toLocaleString('id-ID')}</span>
                     </div>
                     {transaction.discount_amount > 0 && (
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-800 print:text-[16px]">
                           <span>Diskon</span>
                           <span>-Rp {transaction.discount_amount.toLocaleString('id-ID')}</span>
                        </div>
                     )}
                     <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 print:text-slate-900 print:text-[16px]">
                        <span>PPN (11%)</span>
                        <span>Rp {((transaction.subtotal - transaction.discount_amount) * 0.11).toLocaleString('id-ID')}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 print:border-t-2 print:border-slate-300">
                        <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic print:text-2xl">TOTAL</span>
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter tabular-nums print:text-slate-900 print:text-3xl">Rp {transaction.total_amount.toLocaleString('id-ID')}</span>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-10 pt-6 border-t border-dashed border-slate-300 flex flex-col items-center gap-2 text-center print:border-slate-900">
                     <p className="text-[10px] font-black uppercase text-slate-800 print:text-[16px]">Bayar via {transaction.payment_method}</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest print:text-slate-900 print:text-[12px]">Barang Yang Sudah Dibeli Tidak Dapat Ditukar</p>
                     <p className="text-[10px] font-black mt-4 uppercase italic print:text-[16px]">** Terima Kasih **</p>
                  </div>

               </div>
            </div>

            {/* Action - Hidden on Print */}
            <div className="p-8 border-t border-slate-100 flex gap-4 shrink-0 print:hidden">
               <button
                  onClick={onClose}
                  className="flex-1 h-16 bg-slate-50 text-slate-400 font-black rounded-3xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
               >
                  Tutup
               </button>
               <button
                  onClick={handlePrint}
                  className="flex-1 h-16 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
               >
                  <Printer size={18} />
                  <span className="text-xs uppercase tracking-widest">Cetak Thermal</span>
               </button>
            </div>

         </div>

         <style jsx global>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
            background: none !important;
            color: black !important;
            box-shadow: none !important;
          }
          /* Only show the receipt */
          .thermal-receipt, .thermal-receipt * {
            visibility: visible;
          }
          .thermal-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 5mm !important;
            border: none !important;
            font-family: 'Courier New', Courier, monospace; /* Classic thermal font */
          }
          @page {
            size: 80mm auto; /* Thermal paper size */
            margin: 0;
          }
        }
      `}</style>
      </div>
   );
}
