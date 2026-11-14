import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { HomepageSectionConfig } from '../types/studio';
import { ResilientImage } from './ResilientImage';

interface CustomSectionRendererProps {
  section: HomepageSectionConfig;
  onNavigateTarget: (target: string) => void;
}

export function CustomSectionRenderer({ section, onNavigateTarget }: CustomSectionRendererProps) {
  const tone = section.backgroundTone || 'light';
  const toneClass =
    tone === 'dark'
      ? 'bg-[#0A0A0A] text-[#FAF8F5] border-y border-white/10'
      : tone === 'warm'
      ? 'bg-[#EFEAE0] text-[#111111] border-y border-[#DFD8CC]'
      : 'bg-[#FAF8F5] text-[#111111] border-y border-[#E5DFD5]';

  const mutedText = tone === 'dark' ? 'text-[#B8B0A4]' : 'text-[#4A4742]';
  const eyebrowText = tone === 'dark' ? 'text-[#D4C3AA]' : 'text-[#786651]';
  const btnClass =
    tone === 'dark'
      ? 'bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA]'
      : 'bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733]';

  return (
    <section id={section.id} className={`${toneClass} py-20 sm:py-28`}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div
          className={`grid grid-cols-1 ${
            section.imageUrl ? 'lg:grid-cols-12 gap-12 items-center' : 'max-w-4xl'
          }`}
        >
          <div className={section.imageUrl ? 'lg:col-span-6' : ''}>
            {section.eyebrow && (
              <p className={`text-xs uppercase tracking-[0.22em] font-medium mb-3 ${eyebrowText}`}>
                {section.eyebrow}
              </p>
            )}
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.08] [text-wrap:balance]">
              {section.heading || section.label}
            </h2>
            {section.subheading && (
              <p className={`mt-4 text-base sm:text-lg leading-relaxed ${mutedText}`}>
                {section.subheading}
              </p>
            )}
            {section.body && (
              <p className={`mt-5 text-[15px] leading-[1.75] whitespace-pre-line ${mutedText}`}>
                {section.body}
              </p>
            )}
            {section.buttonText && (
              <button
                type="button"
                onClick={() => onNavigateTarget(section.buttonLink || '#contact')}
                className={`mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer ${btnClass}`}
              >
                <span>{section.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {section.imageUrl && (
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden bg-[#181715]">
                <ResilientImage
                  src={section.imageUrl}
                  alt={section.heading || section.label}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fallbackTitle={section.heading || section.label}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
