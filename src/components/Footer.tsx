import React from 'react';
import { Lock } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface FooterProps {
  onNavigateSection: (sectionId: string, path?: string) => void;
  onOpenAdmin: () => void;
}

export function Footer({ onNavigateSection, onOpenAdmin }: FooterProps) {
  const { siteSettings } = useStudio();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-[#FAF8F5] border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div>
            <p className="font-editorial text-3xl tracking-[0.22em] uppercase">
              {siteSettings.brandName || 'TWINS'}
            </p>
            <p className="mt-2 text-xs text-[#B8B0A4] tracking-wide">
              {siteSettings.heroSubheadline}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.14em] text-[#B8B0A4]">
            {[
              { label: 'Home', id: 'home', path: '/' },
              { label: 'About', id: 'about', path: '/about' },
              { label: 'Portfolio', id: 'portfolio', path: '/portfolio' },
              { label: 'Services', id: 'services', path: '/services' },
              { label: 'Projects', id: 'projects', path: '/projects' },
              { label: 'Contact', id: 'contact', path: '/contact' },
            ].map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection(item.id, item.path);
                }}
                className="hover:text-[#D4C3AA] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A8277]">
          <p>
            &copy; {year} {siteSettings.brandName || 'TWINS'} Photography Studio. All rights
            reserved.
          </p>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#B8B0A4] hover:text-[#D4C3AA] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Studio Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
