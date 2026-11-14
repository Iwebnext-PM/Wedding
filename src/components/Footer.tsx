import React from 'react';
import { Lock } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { DEFAULT_NAV_LINKS } from '../data/seedData';

interface FooterProps {
  onNavigateTarget: (target: string) => void;
  onOpenAdmin: () => void;
}

export function Footer({ onNavigateTarget, onOpenAdmin }: FooterProps) {
  const { siteSettings } = useStudio();
  const year = new Date().getFullYear();

  const footerLinks = (
    siteSettings.navLinks && siteSettings.navLinks.length > 0
      ? siteSettings.navLinks
      : DEFAULT_NAV_LINKS
  ).filter((item) => item.visible && (item.location === 'footer' || item.location === 'both'));

  const socialLinks = [
    { label: 'Instagram', url: siteSettings.instagramUrl },
    { label: 'Facebook', url: siteSettings.facebookUrl },
    { label: 'YouTube', url: siteSettings.youtubeUrl },
    { label: 'Behance', url: siteSettings.behanceUrl },
    { label: 'Pinterest', url: siteSettings.pinterestUrl },
  ].filter((item) => Boolean(item.url));

  return (
    <footer className="bg-[#0A0A0A] text-[#FAF8F5] border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div>
            <p className="font-editorial text-3xl tracking-[0.22em] uppercase">
              {siteSettings.brandName || 'TWINS'}
            </p>
            <p className="mt-2 text-xs text-[#B8B0A4] tracking-wide max-w-md">
              {siteSettings.footerTagline || siteSettings.heroSubheadline}
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.14em] text-[#B8B0A4]"
          >
            {footerLinks.map((item) => {
              const isExternal = item.target.startsWith('http');
              return (
                <a
                  key={item.id}
                  href={item.target}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  onClick={(e) => {
                    if (!isExternal) {
                      e.preventDefault();
                      onNavigateTarget(item.target);
                    }
                  }}
                  className="hover:text-[#D4C3AA] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#8A8277]">
          <p>
            &copy; {year}{' '}
            {siteSettings.copyrightText ||
              `${siteSettings.brandName || 'TWINS'} Photography Studio. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] uppercase tracking-[0.12em] text-[#8A8277] hover:text-[#D4C3AA] transition-colors"
              >
                {social.label}
              </a>
            ))}

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#B8B0A4] hover:text-[#D4C3AA] transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Studio Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
