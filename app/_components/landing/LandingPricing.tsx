import Link from 'next/link';
import { Check, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface PricingPlan {
  name: string;
  period: string;
  price: string;
  desc: string;
  features: string[];
  popular: boolean;
}

interface LandingPricingProps {
  plans: PricingPlan[];
}

export default function LandingPricing({ plans }: LandingPricingProps) {
  return (
    <section id="pricing" className="py-40 relative backdrop-blur-3xl overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-32 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-2">
            <Zap size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Subscription Plan</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-[#0F172A]">Pilih Partner Bisnis Anda.</h2>
          <p className="text-lg text-[#64748B] font-medium max-w-2xl mx-auto italic">Pilih paket yang paling efisien untuk pertumbuhan toko Anda.</p>

          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="px-6 py-3 bg-emerald-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 flex items-center gap-3 animate-bounce">
              <Check size={14} strokeWidth={4} />
              Trial Gratis Selama 30 Hari
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <div key={plan.name} className={`group p-12 rounded-[3.5rem] bg-white border transition-all duration-500 hover:scale-[1.03] relative ${plan.popular ? 'border-2 border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-xl shadow-slate-200/50'}`}>
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 px-6 bg-indigo-600 text-white flex items-center justify-center rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-indigo-200">
                  Paling Populer
                </div>
              )}
              <div className="mb-10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.name}</span>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-slate-400 uppercase">Rp</span>
                  <span className="text-6xl font-black text-[#0F172A] tracking-tighter">{plan.price}</span>
                  <span className="text-xs font-bold text-slate-300 uppercase">/ {plan.period}</span>
                </div>
                <p className="mt-6 text-slate-400 text-sm font-medium leading-relaxed italic">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-12 min-h-[320px]">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mt-0.5 shrink-0">
                      <Check size={10} strokeWidth={4} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 ${plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                Mulai Berlangganan
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
