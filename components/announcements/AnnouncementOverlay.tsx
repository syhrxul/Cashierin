'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronRight, Bell, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AnnouncementOverlay() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res: any = await apiFetch('/announcements/dashboard');
      if (res.data && res.data.length > 0) {
        // Only show unread ones in overlay
        const unread = res.data.filter((a: any) => !a.is_read);
        if (unread.length > 0) {
          setAnnouncements(unread);
          setIsOpen(true);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Announcement fetch failed:', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/announcements/${id}/read`, { method: 'POST' });
      // Notify sidebar to update count
      window.dispatchEvent(new CustomEvent('announcementCountUpdate'));
    } catch (err) { console.error(err); }
  };

  if (!isOpen || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const next = async () => {
    // Mark current as read
    if (current?.id) await markAsRead(current.id);

    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-xl animate-in slide-in-from-bottom-10 duration-700">
      <div className={`relative p-8 rounded-[3rem] shadow-2xl border-4 backdrop-blur-xl transition-all duration-500 ${current.priority === 'critical' ? 'bg-rose-600/90 border-rose-400 text-white' :
        current.priority === 'important' ? 'bg-amber-500/90 border-amber-300 text-white' :
          'bg-[#0F172A]/90 border-indigo-500/30 text-white'
        }`}>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all border-2 border-slate-100"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${current.priority === 'critical' ? 'bg-white/20' : 'bg-white/10'
            }`}>
            {current.priority === 'critical' ? <AlertTriangle size={28} className="animate-pulse" /> :
              current.priority === 'important' ? <Megaphone size={28} /> : <Bell size={28} />}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                {current.scope === 'global' ? 'Sistem Global' : 'Pengumuman Toko'}
              </span>
              <span className="text-[10px] font-bold opacity-40">
                {currentIndex + 1} / {announcements.length}
              </span>
            </div>
            <h4 className="text-xl font-black tracking-tighter uppercase leading-tight">{current.title}</h4>
            <p className="text-sm font-medium leading-relaxed opacity-90">{current.content}</p>

            <div className="pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
                  {current.creator?.name?.[0]}
                </div>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                  Dari {current.creator?.name}
                </span>
              </div>

              <button
                onClick={next}
                className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${current.priority === 'critical' ? 'bg-white text-rose-600' : 'bg-white text-[#0F172A]'
                  }`}
              >
                {currentIndex < announcements.length - 1 ? 'Berikutnya' : 'Mengerti'} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
