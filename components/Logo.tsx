'use client';

import { Store } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  dark?: boolean;
}

export default function Logo({ className = '', showText = true, dark = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 shrink-0 shadow-lg shadow-indigo-100/50 transition-transform hover:scale-105 duration-300">
        <img
          src="/icon.png"
          alt="Cashierin Logo"
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
      {showText && (
        <h2 className={`text-[21px] font-black ${dark ? 'text-white' : 'text-[#0F172A]'} tracking-[-0.05em] uppercase whitespace-nowrap overflow-hidden leading-none`}>
          Cashierin
        </h2>
      )}
    </div>
  );
}
