import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxSlide {
  id: string;
  title: string;
  imageUrl: string;
  categoryName?: string;
  location?: string;
  cameraSpecs?: string;
  year?: string;
}

interface LightboxModalProps {
  slides: LightboxSlide[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function LightboxModal({
  slides,
  activeIndex,
  onClose,
  onChangeIndex,
}: LightboxModalProps) {
  const isOpen = activeIndex !== null && slides[activeIndex] !== undefined;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + slides.length) % slides.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, slides.length, onClose, onChangeIndex]);

  if (!isOpen || activeIndex === null) return null;

  const current = slides[activeIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      className="fixed inset-0 z-50 bg-[#050505]/96 text-[#FAF8F5] flex flex-col justify-between p-4 sm:p-8"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[#B8B0A4]">
          <span>
            {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          {current.categoryName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-sans uppercase tracking-[0.14em] text-[#D4C3AA]">
                {current.categoryName}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="w-11 h-11 flex items-center justify-center border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-0">
        {slides.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex - 1 + slides.length) % slides.length)}
            aria-label="Previous photograph"
            className="absolute left-0 sm:left-2 z-10 w-11 h-11 flex items-center justify-center bg-black/50 border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <img
          src={current.imageUrl}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="max-h-[72vh] max-w-[88vw] object-contain select-none"
        />

        {slides.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex + 1) % slides.length)}
            aria-label="Next photograph"
            className="absolute right-0 sm:right-2 z-10 w-11 h-11 flex items-center justify-center bg-black/50 border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Caption & EXIF Metadata */}
      <div className="max-w-4xl mx-auto w-full border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-editorial text-2xl text-[#FAF8F5]">{current.title}</h3>
          {(current.location || current.year) && (
            <p className="text-xs text-[#B8B0A4] mt-0.5">
              {[current.location, current.year].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {current.cameraSpecs && (
          <p className="font-mono text-xs text-[#D4C3AA] tracking-wide">{current.cameraSpecs}</p>
        )}
      </div>
    </div>
  );
}
