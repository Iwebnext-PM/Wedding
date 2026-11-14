import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ResilientImage } from './ResilientImage';
import type { HomepageSectionConfig } from '../types/studio';

interface AboutSectionProps {
  sectionConfig?: HomepageSectionConfig;
}

export function AboutSection({ sectionConfig }: AboutSectionProps) {
  const { siteSettings } = useStudio();

  const eyebrow = sectionConfig?.eyebrow?.trim() || siteSettings.aboutEyebrow || 'The Studio';
  const heading = sectionConfig?.heading?.trim() || siteSettings.aboutHeading;

  return (
    <section id="about" className="bg-[#FAF8F5] text-[#111111] py-20 sm:py-28 border-b border-[#E5DFD5]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Editorial Portrait */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[560px]">
              <ResilientImage
                src={sectionConfig?.imageUrl || siteSettings.aboutImageUrl || ''}
                alt={siteSettings.photographerNames || `${siteSettings.brandName} studio founders`}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                fallbackTitle={siteSettings.brandName || 'TWINS Studio'}
              />
            </div>
          </div>

          {/* Right Narrative & Philosophy */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#786651] font-medium mb-4">
                {eyebrow}
              </p>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-[-0.01em] text-[#111111] [text-wrap:balance]">
                {heading}
              </h2>

              <div className="mt-8 space-y-5 text-[15px] sm:text-base leading-[1.75] text-[#3A3733] max-w-[62ch]">
                <p>{siteSettings.aboutStory}</p>
                {siteSettings.aboutPhilosophy && <p>{siteSettings.aboutPhilosophy}</p>}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E5DFD5]">
              <p className="font-editorial text-2xl text-[#111111]">
                {siteSettings.photographerNames}
              </p>
              {siteSettings.photographerBio && (
                <p className="mt-2.5 text-sm leading-relaxed text-[#57534E] max-w-[58ch]">
                  {siteSettings.photographerBio}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#6E675E] font-mono">
                <span>Analog &amp; Medium Format</span>
                <span aria-hidden="true">·</span>
                <span>Dual-Perspective Direction</span>
                <span aria-hidden="true">·</span>
                <span>Archival Fine-Art Prints</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
