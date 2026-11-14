import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import type { CustomPage } from '../types/studio';
import { ResilientImage } from './ResilientImage';
import type { LightboxSlide } from './LightboxModal';

interface CustomPageViewProps {
  page: CustomPage;
  onBackHome: () => void;
  onNavigateTarget: (target: string) => void;
  onOpenLightbox: (slides: LightboxSlide[], index: number) => void;
}

export function CustomPageView({
  page,
  onBackHome,
  onNavigateTarget,
  onOpenLightbox,
}: CustomPageViewProps) {
  // Sync per-page SEO tags dynamically while viewing this custom page
  useEffect(() => {
    const prevTitle = document.title;
    if (page.seoTitle || page.title) {
      document.title = page.seoTitle || `${page.title} — TWINS`;
    }
    const descEl = document.querySelector('meta[name="description"]');
    const prevDesc = descEl?.getAttribute('content') || '';
    if (descEl && page.seoDescription) {
      descEl.setAttribute('content', page.seoDescription);
    }

    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (page.noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = 'noindex, nofollow';
    }

    return () => {
      document.title = prevTitle;
      if (descEl && prevDesc) descEl.setAttribute('content', prevDesc);
      if (robotsMeta && page.noIndex) robotsMeta.remove();
    };
  }, [page]);

  return (
    <div className="pt-20">
      <div className="bg-[#0A0A0A] text-[#FAF8F5] border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#D4C3AA] hover:text-[#FAF8F5] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio Exhibition</span>
          </button>
          <span className="font-mono text-xs text-[#8A8277]">/p/{page.slug}</span>
        </div>
      </div>

      {page.sections.map((block) => {
        const bg = block.backgroundColor || (block.type === 'hero' ? '#0A0A0A' : '#FAF8F5');
        const fg = block.textColor || (block.type === 'hero' ? '#FAF8F5' : '#111111');
        const isDark = bg.toLowerCase().includes('#0') || bg.toLowerCase().includes('#1');

        if (block.type === 'hero') {
          return (
            <section
              key={block.id}
              style={{ backgroundColor: bg, color: fg }}
              className="relative py-24 sm:py-36 overflow-hidden"
            >
              {block.imageUrl && (
                <>
                  <img
                    src={block.imageUrl}
                    alt={block.heading}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
                </>
              )}
              <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
                <h1 className="font-editorial text-4xl sm:text-6xl leading-[1.06] max-w-3xl [text-wrap:balance]">
                  {block.heading}
                </h1>
                {block.subheading && (
                  <p className="mt-5 text-base sm:text-xl opacity-85 max-w-2xl leading-relaxed">
                    {block.subheading}
                  </p>
                )}
                {block.buttonText && (
                  <button
                    type="button"
                    onClick={() => onNavigateTarget(block.buttonLink || '#contact')}
                    className="mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors cursor-pointer"
                  >
                    <span>{block.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'split') {
          return (
            <section
              key={block.id}
              style={{ backgroundColor: bg, color: fg }}
              className="py-20 sm:py-28 border-b border-black/10"
            >
              <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6">
                  <div className="aspect-[4/3] overflow-hidden bg-[#181715]">
                    <ResilientImage
                      src={block.imageUrl || ''}
                      alt={block.heading}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                      fallbackTitle={block.heading}
                    />
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.08]">
                    {block.heading}
                  </h2>
                  {block.subheading && (
                    <p className="mt-3 text-base opacity-80">{block.subheading}</p>
                  )}
                  {block.body && (
                    <p className="mt-6 text-[15px] sm:text-base leading-[1.8] opacity-85 whitespace-pre-line">
                      {block.body}
                    </p>
                  )}
                  {block.buttonText && (
                    <button
                      type="button"
                      onClick={() => onNavigateTarget(block.buttonLink || '#contact')}
                      className={`mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA]'
                          : 'bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733]'
                      }`}
                    >
                      <span>{block.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === 'gallery') {
          const urls = (block.galleryUrls || []).filter(Boolean);
          const slides: LightboxSlide[] = urls.map((u, idx) => ({
            id: `${block.id}-${idx}`,
            title: `${block.heading} — ${idx + 1}`,
            imageUrl: u,
          }));
          return (
            <section
              key={block.id}
              style={{ backgroundColor: bg, color: fg }}
              className="py-20 sm:py-24 border-b border-black/10"
            >
              <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
                <h2 className="font-editorial text-3xl sm:text-4xl">{block.heading}</h2>
                {block.subheading && (
                  <p className="mt-2 text-sm opacity-75 max-w-2xl">{block.subheading}</p>
                )}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {urls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenLightbox(slides, idx)}
                      className="group relative aspect-[4/3] overflow-hidden bg-[#181715] cursor-pointer"
                    >
                      <ResilientImage
                        src={url}
                        alt={`${block.heading} frame ${idx + 1}`}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-black/60 text-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Expand className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === 'cta') {
          return (
            <section
              key={block.id}
              style={{ backgroundColor: bg, color: fg }}
              className="py-20 sm:py-24 border-b border-black/10"
            >
              <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
                <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.08]">
                  {block.heading}
                </h2>
                {block.body && (
                  <p className="mt-4 text-base opacity-80 max-w-2xl mx-auto">{block.body}</p>
                )}
                {block.buttonText && (
                  <button
                    type="button"
                    onClick={() => onNavigateTarget(block.buttonLink || '#contact')}
                    className={`mt-8 inline-flex items-center gap-2.5 px-8 py-4 text-xs uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA]'
                        : 'bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733]'
                    }`}
                  >
                    <span>{block.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>
          );
        }

        // Default: 'text'
        return (
          <section
            key={block.id}
            style={{ backgroundColor: bg, color: fg }}
            className="py-16 sm:py-24 border-b border-black/10"
          >
            <div className="max-w-[900px] mx-auto px-5 sm:px-8">
              <h2 className="font-editorial text-3xl sm:text-4xl">{block.heading}</h2>
              {block.subheading && (
                <p className="mt-3 text-base opacity-80">{block.subheading}</p>
              )}
              {block.body && (
                <p className="mt-6 text-[15px] sm:text-base leading-[1.85] opacity-85 whitespace-pre-line">
                  {block.body}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
