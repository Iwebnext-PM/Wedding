import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface ServicesSectionProps {
  onInquireService: (serviceTitle: string) => void;
}

export function ServicesSection({ onInquireService }: ServicesSectionProps) {
  const { services } = useStudio();

  return (
    <section
      id="services"
      className="bg-[#FAF8F5] text-[#111111] py-20 sm:py-28 border-b border-[#E5DFD5]"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#E5DFD5]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#786651] font-medium mb-3">
              Commissions &amp; Craft
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.06] text-[#111111] [text-wrap:balance]">
              Our Services
            </h2>
          </div>

          <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
            Every engagement includes bespoke pre-production direction, archival color grading,
            and private high-resolution gallery delivery.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5DFD5] border border-[#E5DFD5]">
          {services.map((srv, idx) => (
            <article
              key={srv.id}
              className="bg-[#FAF8F5] p-7 sm:p-8 flex flex-col justify-between hover:bg-[#F3EFE8] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#786651] tabular-nums">
                  <span>{String(idx + 1).padStart(2, '0')}.</span>
                  {srv.startingPrice && <span>{srv.startingPrice}</span>}
                </div>

                <h3 className="mt-5 font-editorial text-2xl sm:text-[26px] leading-snug text-[#111111]">
                  {srv.title}
                </h3>

                <p className="mt-3.5 text-sm leading-[1.7] text-[#4A4742]">{srv.description}</p>

                {srv.deliverables && (
                  <p className="mt-5 pt-4 border-t border-[#E5DFD5] text-xs leading-relaxed text-[#6E675E]">
                    {srv.deliverables}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onInquireService(srv.title)}
                className="mt-7 inline-flex items-center justify-between w-full py-2.5 px-4 text-xs uppercase tracking-[0.12em] font-medium border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                <span>Inquire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
