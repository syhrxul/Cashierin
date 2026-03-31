import { LifeBuoy, Mail, MapPin, MessageSquareText, Phone } from 'lucide-react';

export default function LandingContactSection() {
  const contactItems = [
    {
      title: 'Email Support',
      value: 'support@cashierin.id',
      description: 'Untuk pertanyaan umum, bantuan teknis, dan aktivasi layanan.',
      icon: Mail,
      iconClassName: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'WhatsApp Bisnis',
      value: '+62 812-3456-7890',
      description: 'Cocok untuk konsultasi cepat seputar penggunaan sistem dan demo.',
      icon: Phone,
      iconClassName: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Lokasi Operasional',
      value: 'Bandung, Indonesia',
      description: 'Melayani kebutuhan digitalisasi bisnis lokal hingga multi-cabang.',
      icon: MapPin,
      iconClassName: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] border border-slate-200/70 shadow-xl shadow-slate-200/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 opacity-70" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 p-8 md:p-14">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-100 bg-indigo-50 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">
                  <LifeBuoy size={14} />
                  Hubungi Tim Cashierin
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0F172A] leading-tight">
                  Punya pertanyaan sebelum mulai berlangganan?
                </h2>
                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Tim kami siap membantu Anda memahami fitur, menyesuaikan kebutuhan bisnis, dan memberikan arahan terbaik sebelum Anda menggunakan Cashierin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactItems.map((item) => (
                  <div key={item.title} className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-6 space-y-4 hover:bg-white hover:shadow-lg transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconClassName}`}>
                      <item.icon size={22} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
                      <p className="text-base font-black text-[#0F172A] break-words">{item.value}</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-[#0F172A] p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-[1.5rem] bg-white/10 border border-white/10 flex items-center justify-center">
                  <MessageSquareText size={26} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">Butuh demo atau konsultasi singkat?</h3>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Tinggalkan kontak Anda melalui kanal resmi kami dan tim Cashierin akan membantu merekomendasikan paket yang paling sesuai untuk bisnis Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Jam Operasional</p>
                    <p className="mt-2 text-base font-bold text-white">Senin - Jumat, 09.00 - 17.00 WIB</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Respon Cepat</p>
                    <p className="mt-2 text-base font-bold text-white">Prioritas untuk demo produk, onboarding, dan bantuan lisensi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
