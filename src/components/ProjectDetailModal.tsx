import React, { useEffect } from 'react';
import { ArrowLeft, Expand, X } from 'lucide-react';
import type { Project } from '../types/studio';
import { ResilientImage } from './ResilientImage';
import type { LightboxSlide } from './LightboxModal';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onBookProjectType: (categoryName: string) => void;
  onOpenLightbox: (slides: LightboxSlide[], index: number) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onBookProjectType,
  onOpenLightbox,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [project, onClose]);

  if (!project) return null;

  const allImages = Array.from(
    new Set([project.coverImageUrl, ...project.galleryImages].filter(Boolean))
  );

  const slides: LightboxSlide[] = allImages.map((url, idx) => ({
    id: `${project.id}-${idx}`,
    title: `${project.title} — Plate ${String(idx + 1).padStart(2, '0')}`,
    imageUrl: url,
    categoryName: project.categoryName,
    location: project.location,
    year: project.dateLabel,
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-45 bg-[#0A0A0A] text-[#FAF8F5] overflow-y-auto"
    >
      {/* Top Sticky Bar */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/92 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#D4C3AA] hover:text-[#FAF8F5] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project detail"
            className="w-10 h-10 flex items-center justify-center border border-white/20 text-[#FAF8F5] hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8B0A4]">
          <span className="uppercase tracking-[0.16em] text-[#D4C3AA]">{project.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>{project.location}</span>
          {project.dateLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.dateLabel}</span>
            </>
          )}
          {project.clientName && (
            <>
              <span aria-hidden="true">·</span>
              <span>Client: {project.clientName}</span>
            </>
          )}
        </div>

        <h1 className="mt-4 font-editorial text-4xl sm:text-6xl leading-[1.04] text-[#FAF8F5] [text-wrap:balance]">
          {project.title}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#D4C3AA]/90 max-w-3xl leading-relaxed">
          {project.summary}
        </p>

        {/* Cover Plate */}
        <div className="mt-10">
          <button
            type="button"
            onClick={() => onOpenLightbox(slides, 0)}
            className="group relative block w-full aspect-[16/9] overflow-hidden bg-[#181715] cursor-pointer"
          >
            <ResilientImage
              src={project.coverImageUrl}
              alt={project.title}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              eager
            />
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3.5 py-2 bg-black/70 text-xs text-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="w-3.5 h-3.5" />
              <span>Expand Plate</span>
            </span>
          </button>
        </div>

        {/* Editorial Notes */}
        {project.editorialNotes && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-y border-white/10">
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4C3AA]">
                Directors&apos; Monograph Notes
              </p>
            </div>
            <div className="lg:col-span-8 text-[15px] sm:text-base leading-[1.8] text-[#FAF8F5]/85 whitespace-pre-line">
              {project.editorialNotes}
            </div>
          </div>
        )}

        {/* Story Gallery */}
        {allImages.length > 1 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {allImages.slice(1).map((imgUrl, idx) => (
              <button
                key={`${imgUrl.slice(0, 24)}-${idx}`}
                type="button"
                onClick={() => onOpenLightbox(slides, idx + 1)}
                className="group relative aspect-[4/3] overflow-hidden bg-[#181715] cursor-pointer"
              >
                <ResilientImage
                  src={imgUrl}
                  alt={`${project.title} gallery frame ${idx + 2}`}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center bg-black/65 text-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Expand className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Commission CTA */}
        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5]">
              Commission a similar visual story
            </p>
            <p className="mt-1 text-sm text-[#B8B0A4]">
              Available worldwide for intimate celebrations and brand monographs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onBookProjectType(project.categoryName)}
            className="px-7 py-3.5 text-xs uppercase tracking-[0.14em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Inquire About This Story
          </button>
        </div>
      </div>
    </div>
  );
}
