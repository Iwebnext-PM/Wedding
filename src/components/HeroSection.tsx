import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudio } from '../context/StudioContext';
import { isVideoUrl } from '../lib/imageUtils';

interface HeroSectionProps {
  onExplorePortfolio: () => void;
  onBookSession: () => void;
}

export function HeroSection({ onExplorePortfolio, onBookSession }: HeroSectionProps) {
  const { siteSettings } = useStudio();
  const banners = siteSettings.heroBanners.length > 0 ? siteSettings.heroBanners : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [activeIndex, banners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (activeIndex >= banners.length) {
      setActiveIndex(0);
    }
  }, [banners.length, activeIndex]);

  const currentBanner = banners[activeIndex] || '';
  const isCurrentVideo = isVideoUrl(currentBanner) && !videoFailed;

  return (
    <section id="home" className="relative bg-[#0A0A0A] text-[#FAF8F5] overflow-hidden">
      <div className="relative min-h-[88vh] lg:min-h-[92vh] flex items-end pb-16 sm:pb-24 pt-28">
        {/* Background Video / Slideshow */}
        <AnimatePresence mode="sync">
          {currentBanner ? (
            <motion.div
              key={`${activeIndex}-${currentBanner.slice(0, 48)}`}
              initial={{ opacity: 0, scale: isCurrentVideo ? 1 : 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {isCurrentVideo ? (
                <video
                  src={currentBanner}
                  poster={siteSettings.seoOgImage || undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setVideoFailed(true)}
                  aria-label={`${siteSettings.brandName} studio showreel`}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={videoFailed && siteSettings.seoOgImage ? siteSettings.seoOgImage : currentBanner}
                  alt={`${siteSettings.brandName} editorial showcase ${activeIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-[#141414]" />
          )}
        </AnimatePresence>

        {/* Measured Contrast Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/45 to-[#0A0A0A]/55"
        />

        {/* Editorial Hero Content */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-9">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#D4C3AA] mb-5 font-medium"
              >
                {siteSettings.brandName || 'TWINS'} · Photography &amp; Visual Storytelling
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="font-editorial text-[clamp(2.5rem,5.4vw,4.75rem)] leading-[1.02] tracking-[-0.015em] font-normal text-[#FAF8F5] max-w-4xl [text-wrap:balance]"
              >
                {siteSettings.heroHeadline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 text-base sm:text-lg text-[#FAF8F5]/85 max-w-xl leading-relaxed font-normal"
              >
                {siteSettings.heroSubheadline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <button
                  type="button"
                  onClick={onExplorePortfolio}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Explore Portfolio</span>
                  <ArrowDownRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onBookSession}
                  className="inline-flex items-center justify-center px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium border border-[#FAF8F5]/45 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Book a Session
                </button>
              </motion.div>
            </div>

            {/* Slide Controls */}
            {banners.length > 1 && (
              <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)
                    }
                    aria-label="Previous hero photograph"
                    className="w-10 h-10 flex items-center justify-center border border-white/25 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
                    aria-label="Next hero photograph"
                    className="w-10 h-10 flex items-center justify-center border border-white/25 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-xs tabular-nums text-[#FAF8F5]/75">
                  <span>0{activeIndex + 1}</span>
                  <span className="w-8 h-px bg-white/30" />
                  <span>0{banners.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Studio Credibility Strip */}
      <div className="border-t border-white/10 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div>
            <p className="font-mono text-lg sm:text-xl text-[#D4C3AA] tabular-nums">12+ Years</p>
            <p className="mt-1 text-xs text-[#FAF8F5]/65 tracking-wide">
              International Editorial Practice
            </p>
          </div>
          <div>
            <p className="font-mono text-lg sm:text-xl text-[#D4C3AA] tabular-nums">340+ Stories</p>
            <p className="mt-1 text-xs text-[#FAF8F5]/65 tracking-wide">
              Weddings, Campaigns &amp; Monographs
            </p>
          </div>
          <div>
            <p className="font-mono text-lg sm:text-xl text-[#D4C3AA]">Medium Format</p>
            <p className="mt-1 text-xs text-[#FAF8F5]/65 tracking-wide">
              Hasselblad Digital &amp; 35mm Film
            </p>
          </div>
          <div>
            <p className="font-mono text-lg sm:text-xl text-[#D4C3AA]">Worldwide</p>
            <p className="mt-1 text-xs text-[#FAF8F5]/65 tracking-wide">
              Milan · Paris · Kyoto · New York
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
