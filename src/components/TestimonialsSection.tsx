import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { ResilientImage } from './ResilientImage';

export function TestimonialsSection() {
  const { testimonials } = useStudio();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= testimonials.length) {
      setActiveIndex(0);
    }
  }, [testimonials.length, activeIndex]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[activeIndex] || testimonials[0];
  const ratingValue = Math.min(5, Math.max(1, Math.round(current.rating || 5)));

  return (
    <section
      id="testimonials"
      className="bg-[#111111] text-[#FAF8F5] py-20 sm:py-28 border-b border-white/10"
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-10 border-b border-white/15">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4C3AA] font-medium mb-3">
              Client Reflections
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.06] text-[#FAF8F5]">
              Words From Our Clients
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
              }
              aria-label="Previous testimonial"
              className="w-11 h-11 flex items-center justify-center border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
              aria-label="Next testimonial"
              className="w-11 h-11 flex items-center justify-center border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Testimonial Stage */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3 flex md:flex-col items-center md:items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden bg-[#1D1B19] shrink-0">
              <ResilientImage
                src={current.avatarUrl || ''}
                alt={current.clientName}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                fallbackTitle={current.clientName.slice(0, 2).toUpperCase()}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[#D4C3AA]" aria-label={`${ratingValue} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < ratingValue ? 'fill-[#D4C3AA] text-[#D4C3AA]' : 'text-white/25'
                    }`}
                  />
                ))}
                <span className="ml-1.5 font-mono text-xs tabular-nums text-[#B8B0A4]">
                  {ratingValue}.0 / 5.0
                </span>
              </div>
              <p className="mt-2 font-editorial text-xl text-[#FAF8F5]">{current.clientName}</p>
              <p className="text-xs text-[#B8B0A4] mt-0.5">{current.clientRole}</p>
            </div>
          </div>

          <div className="md:col-span-9">
            <blockquote className="font-editorial italic text-2xl sm:text-3xl lg:text-[34px] leading-[1.35] text-[#FAF8F5]/95">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
          </div>
        </div>

        {/* Slide Index Bar */}
        {testimonials.length > 1 && (
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Show testimonial from ${t.clientName}`}
                  className={`h-1.5 transition-all cursor-pointer ${
                    idx === activeIndex ? 'w-10 bg-[#D4C3AA]' : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <span className="font-mono text-xs tabular-nums text-[#B8B0A4]">
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
