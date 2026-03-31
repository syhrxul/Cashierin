import Link from 'next/link';
import { ChevronRight, Menu, X } from 'lucide-react';

import Logo from '@/components/Logo';

interface LandingNavbarProps {
  isLogged: boolean;
  scrolled: boolean;
  mobileMenuOpen: boolean;
  activeHref: string;
  navItems: { label: string; href: string }[];
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}

export default function LandingNavbar({
  isLogged,
  scrolled,
  mobileMenuOpen,
  activeHref,
  navItems,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: LandingNavbarProps) {
  return (
    <nav className={`fixed w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className={`flex items-center justify-between p-3 rounded-[2rem] transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-slate-200/50' : 'bg-transparent border-transparent'}`}>
          <div className="px-4">
            <Logo />
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((nav) => (
              <Link
                key={nav.label}
                href={nav.href}
                className={`text-sm font-black uppercase tracking-widest transition-all px-3 py-2 rounded-full ${activeHref === nav.href
                  ? 'text-[#4F46E5] bg-indigo-50 shadow-sm shadow-indigo-100'
                  : 'text-[#94A3B8] hover:text-[#4F46E5]'
                  }`}
              >
                {nav.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="hidden sm:flex items-center gap-3">
              {isLogged ? (
                <Link
                  href="/dashboard"
                  className="h-12 px-6 bg-[#4F46E5] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100 text-sm uppercase tracking-widest"
                >
                  Dashboard
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-6 text-sm font-black text-[#64748B] hover:text-[#0F172A] transition-colors uppercase tracking-widest">
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="h-12 px-8 bg-[#0F172A] text-white font-black rounded-[1.25rem] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest"
                  >
                    Coba Gratis
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={onToggleMobileMenu}
              className="w-12 h-12 flex lg:hidden items-center justify-center rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden absolute top-full left-4 right-4 mt-4 p-8 bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-3xl transition-all duration-500 origin-top ${mobileMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
        <div className="flex flex-col gap-6">
          {navItems.map((nav) => (
            <Link
              key={nav.label}
              onClick={onCloseMobileMenu}
              href={nav.href}
              className={`text-lg font-black transition-all uppercase tracking-widest border-b border-slate-50 pb-4 ${activeHref === nav.href
                ? 'text-[#4F46E5]'
                : 'text-[#0F172A] hover:text-[#4F46E5]'
                }`}
            >
              {nav.label}
            </Link>
          ))}
          <div className="flex flex-col gap-4 pt-4 sm:hidden">
            {isLogged ? (
              <Link href="/dashboard" className="h-16 w-full bg-[#4F46E5] text-white font-black rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 text-sm uppercase tracking-widest">
                Buka Dashboard
                <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="h-16 w-full bg-slate-50 text-slate-900 font-black rounded-3xl flex items-center justify-center uppercase tracking-widest border border-slate-100">
                  Masuk
                </Link>
                <Link href="/register" className="h-16 w-full bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center uppercase tracking-widest shadow-xl shadow-slate-200">
                  Coba Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
