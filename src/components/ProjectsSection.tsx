import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import type { Project } from '../types/studio';
import { ResilientImage } from './ResilientImage';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
  const { projects } = useStudio();

  return (
    <section id="projects" className="bg-[#0A0A0A] text-[#FAF8F5] py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-white/15">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4C3AA] font-medium mb-3">
              Editorial Monographs
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.06] text-[#FAF8F5] [text-wrap:balance]">
              Featured Projects
            </h2>
          </div>

          <p className="text-sm text-[#B8B0A4] max-w-md leading-relaxed">
            Extended multi-day visual stories documenting architecture, intimacy, and atmosphere
            around the world.
          </p>
        </div>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            return (
              <article
                key={project.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
              >
                {/* Cinematic Cover Image */}
                <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="group block w-full h-full text-left cursor-pointer"
                    aria-label={`Open project ${project.title}`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#181715]">
                      <ResilientImage
                        src={project.coverImageUrl}
                        alt={project.title}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        fallbackTitle={project.title}
                      />
                    </div>
                  </button>
                </div>

                {/* Editorial Details */}
                <div
                  className={`lg:col-span-5 flex flex-col justify-between py-2 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#B8B0A4]">
                      <span className="font-mono text-[#D4C3AA] tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase tracking-[0.14em]">{project.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.location}</span>
                    </div>

                    <h3 className="mt-4 font-editorial text-3xl sm:text-4xl leading-[1.1] text-[#FAF8F5] [text-wrap:balance]">
                      {project.title}
                    </h3>

                    <p className="mt-5 text-[15px] leading-[1.7] text-[#B8B0A4]">
                      {project.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="text-xs text-[#B8B0A4]">
                      {[project.clientName, project.dateLabel].filter(Boolean).join(' · ')}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] font-medium text-[#FAF8F5] hover:text-[#D4C3AA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>View Story</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
