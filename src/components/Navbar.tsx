import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface NavbarProps {
  onNavigateSection: (sectionId: string, path?: string) => void;
  onOpenAdmin: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', id: 'home', path: '/' },
  { label: 'About', id: 'about', path: '/about' },
  { label: 'Portfolio', id: 'portfolio', path: '/portfolio' },
  { label: 'Services', id: 'services', path: '/services' },
  { label: 'Projects', id: 'projects', path: '/projects' },
  { label: 'Contact', id: 'contact', path: '/contact' },
];

export function Navbar({ onNavigateSection }: NavbarProps) {
  const { siteSettings } = useStudio();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string, path: string) => {
    setMobileOpen(false);
    onNavigateSection(id, path);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/92 backdrop-blur-md border-b border-white/10 text-[#FAF8F5]'
          : 'bg-gradient-to-b from-black/70 via-black/35 to-transparent text-[#FAF8F5]'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark / Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home', '/');
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-[#D4C3AA]"
          aria-label={`${siteSettings.brandName} Home`}
        >
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.brandName}
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain"
            />
          ) : null}
          <span className="font-editorial text-2xl sm:text-[26px] tracking-[0.22em] font-medium uppercase">
            {siteSettings.brandName || 'TWINS'}
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-[13px] tracking-[0.08em] uppercase font-medium"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id, item.path);
              }}
              className="relative py-1 text-[#FAF8F5]/85 hover:text-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-[#D4C3AA] hover:after:w-full after:transition-all after:duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary CTA + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('contact', '/contact')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book a Shoot
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#FAF8F5] hover:text-[#D4C3AA] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-t border-white/10 px-6 py-6">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id, item.path);
                }}
                className="py-2 text-sm uppercase tracking-[0.12em] text-[#FAF8F5]/90 hover:text-[#D4C3AA] border-b border-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('contact', '/contact')}
              className="mt-2 w-full py-3.5 text-xs uppercase tracking-[0.14em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors cursor-pointer"
            >
              Book a Shoot
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
