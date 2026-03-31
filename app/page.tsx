'use client';

import { useEffect, useState } from 'react';

import LandingFeatures from './_components/landing/LandingFeatures';
import LandingContactSection from './_components/landing/LandingContactSection';
import LandingFooterCta from './_components/landing/LandingFooterCta';
import LandingHero from './_components/landing/LandingHero';
import LandingNavbar from './_components/landing/LandingNavbar';
import LandingPricing from './_components/landing/LandingPricing';
import {
  landingFeatures,
  landingFooterLinks,
  landingNavItems,
  landingPlans,
  landingTrustItems,
} from './_components/landing/landing-data';

export default function LandingPage() {
  const [isLogged, setIsLogged] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ stores: 12, users: 50 });
  const [activeHref, setActiveHref] = useState('#hero');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLogged(!!token);

    const sectionIds = landingNavItems
      .map((item) => item.href)
      .filter((href) => href.startsWith('#'))
      .map((href) => href.slice(1));

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 160;
      let currentHref = '#hero';

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;

        if (scrollPosition >= section.offsetTop) {
          currentHref = `#${id}`;
        }
      }

      setActiveHref(currentHref);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 20) setMobileMenuOpen(false);
      updateActiveSection();
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://cashierin.syhrulimtkhan.my.id/api'}/public/stats`
        );
        const data = await res.json();
        if (data.status === 'success') setStats(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('scroll', handleScroll);
    updateActiveSection();
    fetchStats();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter selection:bg-indigo-100 selection:text-indigo-600 relative overflow-x-hidden">
      <LandingNavbar
        isLogged={isLogged}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        activeHref={activeHref}
        navItems={landingNavItems}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />
      <LandingHero />
      <LandingFeatures features={landingFeatures} />
      <LandingPricing plans={landingPlans} />
      <LandingContactSection />
      <LandingFooterCta
        stores={stats.stores}
        users={stats.users}
        footerLinks={landingFooterLinks}
        trustItems={landingTrustItems}
      />
    </div>
  );
}
