import React, { useMemo, useState } from 'react';
import { Expand, FolderOpen } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import type { HomepageSectionConfig, PortfolioItem } from '../types/studio';
import { ResilientImage } from './ResilientImage';
import type { LightboxSlide } from './LightboxModal';

interface PortfolioSectionProps {
  sectionConfig?: HomepageSectionConfig;
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  onOpenLightbox: (slides: LightboxSlide[], startIndex: number) => void;
}

function aspectClassForItem(item: PortfolioItem): string {
  switch (item.aspectRatio) {
    case 'portrait':
      return 'aspect-[3/4]';
    case 'square':
      return 'aspect-square';
    case 'landscape':
    default:
      return 'aspect-[4/3]';
  }
}

export function PortfolioSection({
  sectionConfig,
  selectedCategorySlug,
  onSelectCategory,
  onOpenLightbox,
}: PortfolioSectionProps) {
  const { categories, albums, portfolioItems } = useStudio();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');

  const publishedItems = useMemo(
    () => portfolioItems.filter((item) => item.published !== false),
    [portfolioItems]
  );

  const publishedAlbums = useMemo(
    () => albums.filter((alb) => alb.published !== false),
    [albums]
  );

  const filteredItems = useMemo(() => {
    let list = publishedItems;

    if (selectedAlbumId !== 'all') {
      list = list.filter((item) => item.albumId === selectedAlbumId);
    }

    if (selectedCategorySlug !== 'all') {
      const matchedCat = categories.find((c) => c.slug === selectedCategorySlug);
      if (matchedCat) {
        list = list.filter(
          (item) =>
            item.categoryId === matchedCat.id ||
            item.categoryName.toLowerCase() === matchedCat.name.toLowerCase()
        );
      }
    }

    return list;
  }, [selectedCategorySlug, selectedAlbumId, categories, publishedItems]);

  const lightboxSlides: LightboxSlide[] = useMemo(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        categoryName: item.categoryName,
        location: item.location,
        cameraSpecs: item.cameraSpecs,
        year: item.year,
      })),
    [filteredItems]
  );

  const eyebrow = sectionConfig?.eyebrow?.trim() || 'Curated Archive';
  const heading = sectionConfig?.heading?.trim() || 'Photography Portfolio';
  const subheading =
    sectionConfig?.subheading?.trim() ||
    'Selected commissions across weddings, editorial fashion, intimate portraiture, and architectural still life. Click any frame for full-screen inspection.';

  return (
    <section id="portfolio" className="bg-[#FAF8F5] text-[#111111] py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
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

        {/* Category Filters */}
        <div className="mt-8 flex flex-col gap-4">
          <div
            role="tablist"
            aria-label="Portfolio categories"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategorySlug === 'all'}
              onClick={() => {
                setSelectedAlbumId('all');
                onSelectCategory('all');
              }}
              className={`px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategorySlug === 'all' && selectedAlbumId === 'all'
                  ? 'bg-[#111111] text-[#FAF8F5]'
                  : 'bg-transparent text-[#4A4742] border border-[#DFD8CC] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              All Works
            </button>

            {categories.map((cat) => {
              const active = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedAlbumId('all');
                    onSelectCategory(cat.slug);
                  }}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#111111] text-[#FAF8F5]'
                      : 'bg-transparent text-[#4A4742] border border-[#DFD8CC] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Curated Gallery Albums Strip (when published albums exist) */}
          {publishedAlbums.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EAE4D9]">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#786651] font-medium mr-1">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Curated Albums:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedAlbumId('all')}
                className={`text-xs px-3 py-1 transition-colors cursor-pointer ${
                  selectedAlbumId === 'all'
                    ? 'bg-[#E9E2D6] text-[#111111] font-medium'
                    : 'text-[#57534E] hover:text-[#111111]'
                }`}
              >
                All Series
              </button>
              {publishedAlbums.map((alb) => (
                <button
                  key={alb.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory('all');
                    setSelectedAlbumId(alb.id);
                  }}
                  className={`text-xs px-3 py-1 transition-colors cursor-pointer ${
                    selectedAlbumId === alb.id
                      ? 'bg-[#E9E2D6] text-[#111111] font-medium'
                      : 'text-[#57534E] hover:text-[#111111]'
                  }`}
                >
                  {alb.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asymmetrical Masonry Gallery */}
        {filteredItems.length === 0 ? (
          <div className="mt-12 py-20 border border-[#E5DFD5] text-center">
            <p className="font-editorial text-2xl text-[#111111]">
              No photographs published in this selection yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedAlbumId('all');
                onSelectCategory('all');
              }}
              className="mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.12em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] transition-colors cursor-pointer"
            >
              Show All Works
            </button>
          </div>
        ) : (
          <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item, idx) => (
              <article
                key={item.id}
                className="break-inside-avoid group relative overflow-hidden bg-[#181715]"
              >
                <button
                  type="button"
                  onClick={() => onOpenLightbox(lightboxSlides, idx)}
                  aria-label={`View ${item.title} in full screen`}
                  className="block w-full text-left cursor-pointer focus-visible:outline-[#9E896F]"
                >
                  <div className={`relative w-full overflow-hidden ${aspectClassForItem(item)}`}>
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.altText || `${item.title} — ${item.categoryName}`}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      fallbackTitle={item.title}
                    />

                    {/* Subtle Gradient Scrim on Hover */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />

                    <div className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-black/55 text-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Expand className="w-4 h-4" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 text-[#FAF8F5] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#D4C3AA]">
                        {[item.categoryName, item.location].filter(Boolean).join(' · ')}
                      </p>
                      <h3 className="mt-1 font-editorial text-2xl leading-tight">{item.title}</h3>
                      {item.cameraSpecs && (
                        <p className="mt-1.5 font-mono text-[11px] text-[#FAF8F5]/75">
                          {item.cameraSpecs}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
