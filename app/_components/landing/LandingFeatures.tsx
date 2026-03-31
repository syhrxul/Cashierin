import type { LucideIcon } from 'lucide-react';

interface FeatureItem {
  title: string;
  desc: string;
  icon: LucideIcon;
  iconClassName: string;
}

interface LandingFeaturesProps {
  features: FeatureItem[];
}

export default function LandingFeatures({ features }: LandingFeaturesProps) {
  return (
    <section id="features" className="py-40 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-32 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter text-[#0F172A]">Satu Sistem, Beribu Kemudahan.</h2>
          <p className="text-lg text-[#64748B] font-medium max-w-2xl mx-auto">Kami merancang Cashierin khusus untuk performa tinggi dan keamanan data bisnis Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="group p-10 rounded-[3rem] bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
              <div className={`w-16 h-16 rounded-2xl ${feature.iconClassName} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
