import React, { useMemo } from 'react';
import {
  Aperture,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  Compass,
  Heart,
  Sparkles,
  User,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import type { HomepageSectionConfig } from '../types/studio';
import { ResilientImage } from './ResilientImage';

interface ServicesSectionProps {
  sectionConfig?: HomepageSectionConfig;
  onInquireService: (serviceTitle: string) => void;
}

function ServiceIcon({ name }: { name?: string }) {
  const cls = 'w-4 h-4 text-[#786651] shrink-0';
  switch (name) {
    case 'Heart':
      return <Heart className={cls} />;
    case 'Compass':
      return <Compass className={cls} />;
    case 'User':
      return <User className={cls} />;
    case 'Sparkles':
      return <Sparkles className={cls} />;
    case 'Calendar':
      return <Calendar className={cls} />;
    case 'Building2':
      return <Building2 className={cls} />;
    case 'Aperture':
      return <Aperture className={cls} />;
    case 'Camera':
    default:
      return <Camera className={cls} />;
  }
}

export function ServicesSection({ sectionConfig, onInquireService }: ServicesSectionProps) {
  const { services } = useStudio();

  const activeServices = useMemo(
    () => services.filter((srv) => srv.enabled !== false),
    [services]
  );

  if (activeServices.length === 0) return null;

  const eyebrow = sectionConfig?.eyebrow?.trim() || 'Commissions & Craft';
  const heading = sectionConfig?.heading?.trim() || 'Our Services';
  const subheading =
    sectionConfig?.subheading?.trim() ||
    'Every engagement includes bespoke pre-production direction, archival color grading, and private high-resolution gallery delivery.';

  return (
    <section
      id="services"
      className="bg-[#FAF8F5] text-[#111111] py-20 sm:py-28 border-b border-[#E5DFD5]"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#E5DFD5]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#786651] font-medium mb-3">
              {eyebrow}
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.06] text-[#111111] [text-wrap:balance]">
              {heading}
            </h2>
          </div>

          <p className="text-sm text-[#57534E] max-w-md leading-relaxed">{subheading}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5DFD5] border border-[#E5DFD5]">
          {activeServices.map((srv, idx) => (
            <article
              key={srv.id}
              className="bg-[#FAF8F5] flex flex-col justify-between hover:bg-[#F3EFE8] transition-colors"
            >
              <div>
                {srv.imageUrl && (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#181715]">
                    <ResilientImage
                      src={srv.imageUrl}
                      alt={srv.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                      fallbackTitle={srv.title}
                    />
                  </div>
                )}

                <div className="p-7 sm:p-8">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#786651] tabular-nums">
                    <span className="inline-flex items-center gap-2">
                      <ServiceIcon name={srv.iconName} />
                      <span>{String(idx + 1).padStart(2, '0')}.</span>
                    </span>
                    {srv.startingPrice && <span>{srv.startingPrice}</span>}
                  </div>

                  <h3 className="mt-4 font-editorial text-2xl sm:text-[26px] leading-snug text-[#111111]">
                    {srv.title}
                  </h3>

                  <p className="mt-3 text-sm leading-[1.7] text-[#4A4742]">{srv.description}</p>

                  {srv.features && srv.features.length > 0 ? (
                    <ul className="mt-5 pt-4 border-t border-[#E5DFD5] space-y-1.5">
                      {srv.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-[#57534E]">
                          <Check className="w-3.5 h-3.5 text-[#786651] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  ) : srv.deliverables ? (
                    <p className="mt-5 pt-4 border-t border-[#E5DFD5] text-xs leading-relaxed text-[#6E675E]">
                      {srv.deliverables}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="px-7 sm:px-8 pb-7 sm:pb-8">
                <button
                  type="button"
                  onClick={() => onInquireService(srv.title)}
                  className="inline-flex items-center justify-between w-full py-2.5 px-4 text-xs uppercase tracking-[0.12em] font-medium border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span>Inquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
