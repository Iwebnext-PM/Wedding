import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_NAV_LINKS } from '../../data/seedData';
import type { HomepageSectionConfig, NavLinkItem, SiteSettings } from '../../types/studio';
import { ImageUploaderField } from './ImageUploaderField';

interface HomepageContentPanelProps {
  mode: 'website-content' | 'homepage' | 'about' | 'navigation';
  onNotify: (msg: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function HomepageContentPanel({
  mode,
  onNotify,
  onDirtyChange,
}: HomepageContentPanelProps) {
  const { siteSettings, pages, saveSiteSettings } = useStudio();
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [saving, setSaving] = useState(false);
  const [dragSectionIdx, setDragSectionIdx] = useState<number | null>(null);
  const [dragNavIdx, setDragNavIdx] = useState<number | null>(null);

  useEffect(() => {
    setForm({
      ...siteSettings,
      navLinks:
        siteSettings.navLinks && siteSettings.navLinks.length > 0
          ? siteSettings.navLinks
          : DEFAULT_NAV_LINKS,
      homepageSections:
        siteSettings.homepageSections && siteSettings.homepageSections.length > 0
          ? siteSettings.homepageSections
          : DEFAULT_HOMEPAGE_SECTIONS,
    });
    onDirtyChange?.(false);
  }, [siteSettings, onDirtyChange]);

  const updateForm = (updater: (prev: SiteSettings) => SiteSettings) => {
    setForm((prev) => updater(prev));
    onDirtyChange?.(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const { id: _id, updatedAt: _up, ...payload } = form;
      await saveSiteSettings(payload);
      onDirtyChange?.(false);
      onNotify('Changes published to the live website.');
    } finally {
      setSaving(false);
    }
  };

  // Drag & drop helpers for Homepage Sections
  const sections = form.homepageSections || DEFAULT_HOMEPAGE_SECTIONS;
  const moveSection = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    updateForm((prev) => ({ ...prev, homepageSections: next }));
  };

  const addCustomSection = () => {
    const newSec: HomepageSectionConfig = {
      id: `sec-custom-${Date.now().toString(36)}`,
      key: 'custom',
      label: 'Custom Editorial Block',
      visible: true,
      eyebrow: 'Studio Journal',
      heading: 'A New Visual Chapter',
      subheading: 'Crafted with medium-format film and directional light.',
      body: 'Describe this special exhibition, seasonal offer, or creative highlight here.',
      buttonText: 'Inquire Now',
      buttonLink: '#contact',
      backgroundTone: 'warm',
    };
    updateForm((prev) => ({
      ...prev,
      homepageSections: [...(prev.homepageSections || sections), newSec],
    }));
  };

  // Drag & drop helpers for Navigation Menu
  const navLinks = form.navLinks || DEFAULT_NAV_LINKS;
  const moveNavLink = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= navLinks.length) return;
    const next = [...navLinks];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    updateForm((prev) => ({ ...prev, navLinks: next }));
  };

  const addNavLink = () => {
    const item: NavLinkItem = {
      id: `nav-${Date.now().toString(36)}`,
      label: 'New Link',
      target: '#portfolio',
      visible: true,
      location: 'both',
    };
    updateForm((prev) => ({ ...prev, navLinks: [...navLinks, item] }));
  };

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
      {/* Header Save Bar */}
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">
            {mode === 'homepage' && 'Homepage Sections, Hero & Layout'}
            {mode === 'about' && 'About Us & Studio Philosophy'}
            {mode === 'navigation' && 'Navigation Menu & Header CTA'}
            {mode === 'website-content' && 'Global Website Copy & Content'}
          </h2>
          <p className="text-xs text-[#6E675E] mt-1">
            {mode === 'homepage' &&
              'Drag sections to reorder your homepage, toggle visibility, edit Hero video/banners, or add custom sections.'}
            {mode === 'about' &&
              'Customize your studio introduction, twin photographers bio, editorial story, and atelier portrait.'}
            {mode === 'navigation' &&
              'Add, reorder, show/hide header and footer navigation links, or link to custom pages.'}
            {mode === 'website-content' &&
              'Edit hero messaging, section headings, subheadings, CTA labels, and links across your website.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Publish Changes'}</span>
        </button>
      </div>

      {/* MODE: HOMEPAGE OR WEBSITE CONTENT -> Hero & CTAs */}
      {(mode === 'homepage' || mode === 'website-content') && (
        <div className="bg-white border border-[#E5DFD5] p-6 space-y-5">
          <h3 className="font-editorial text-2xl text-[#111111] pb-3 border-b border-[#EAE4D9]">
            Hero Banner, Video &amp; Call-To-Action Buttons
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Hero Headline
              </label>
              <input
                type="text"
                required
                value={form.heroHeadline}
                onChange={(e) => updateForm((p) => ({ ...p, heroHeadline: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Hero Subheadline / Description
              </label>
              <textarea
                rows={2}
                required
                value={form.heroSubheadline}
                onChange={(e) => updateForm((p) => ({ ...p, heroSubheadline: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Primary CTA Label
              </label>
              <input
                type="text"
                value={form.heroPrimaryCtaText || ''}
                onChange={(e) =>
                  updateForm((p) => ({ ...p, heroPrimaryCtaText: e.target.value }))
                }
                placeholder="Explore Portfolio"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Primary CTA Target Link
              </label>
              <input
                type="text"
                value={form.heroPrimaryCtaLink || ''}
                onChange={(e) =>
                  updateForm((p) => ({ ...p, heroPrimaryCtaLink: e.target.value }))
                }
                placeholder="#portfolio"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Secondary CTA Label
              </label>
              <input
                type="text"
                value={form.heroSecondaryCtaText || ''}
                onChange={(e) =>
                  updateForm((p) => ({ ...p, heroSecondaryCtaText: e.target.value }))
                }
                placeholder="Book a Session"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Secondary CTA Target Link
              </label>
              <input
                type="text"
                value={form.heroSecondaryCtaLink || ''}
                onChange={(e) =>
                  updateForm((p) => ({ ...p, heroSecondaryCtaLink: e.target.value }))
                }
                placeholder="#contact"
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.11em] text-[#4A4742] font-medium">
                Hero Background Video / Image Banners ({form.heroBanners.length}/6)
              </p>
              {form.heroBanners.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    updateForm((p) => ({ ...p, heroBanners: [...p.heroBanners, ''] }))
                  }
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[#786651] hover:text-[#111111] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              )}
            </div>

            {form.heroBanners.map((banner, idx) => (
              <div key={idx} className="p-4 bg-[#FAF8F5] border border-[#EAE4D9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#6E675E]">
                    Banner #{idx + 1} (Supports .mp4 video or image)
                  </span>
                  {form.heroBanners.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateForm((p) => ({
                          ...p,
                          heroBanners: p.heroBanners.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <ImageUploaderField
                  label={`Hero Banner #${idx + 1}`}
                  value={banner}
                  folder="Banners"
                  onChange={(url) => {
                    const next = [...form.heroBanners];
                    next[idx] = url;
                    updateForm((p) => ({ ...p, heroBanners: next }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE: HOMEPAGE OR WEBSITE CONTENT -> Drag-and-Drop Homepage Sections */}
      {(mode === 'homepage' || mode === 'website-content') && (
        <div className="bg-white border border-[#E5DFD5] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D9]">
            <div>
              <h3 className="font-editorial text-2xl text-[#111111]">
                Homepage Section Order, Visibility &amp; Copy
              </h3>
              <p className="text-xs text-[#6E675E]">
                Drag rows using the handle (or use arrows) to reorder sections on your live homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomSection}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-[0.1em] border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Section</span>
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                draggable
                onDragStart={() => setDragSectionIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragSectionIdx !== null && dragSectionIdx !== idx) {
                    moveSection(dragSectionIdx, idx);
                  }
                  setDragSectionIdx(null);
                }}
                className={`border p-4 transition-colors ${
                  sec.visible ? 'bg-[#FAF8F5] border-[#DFD8CC]' : 'bg-stone-100 border-stone-200 opacity-75'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      title="Drag to reorder"
                      className="cursor-grab text-[#8A8277] hover:text-[#111111]"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-medium text-sm text-[#111111]">{sec.label}</span>
                      <span className="ml-2 font-mono text-[11px] uppercase text-[#786651]">
                        [{sec.key}]
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label="Move section up"
                      className="p-1.5 border border-[#DFD8CC] bg-white disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, idx + 1)}
                      disabled={idx === sections.length - 1}
                      aria-label="Move section down"
                      className="p-1.5 border border-[#DFD8CC] bg-white disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...sections];
                        next[idx] = { ...sec, visible: !sec.visible };
                        updateForm((p) => ({ ...p, homepageSections: next }));
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border cursor-pointer ${
                        sec.visible
                          ? 'bg-white border-[#DFD8CC] text-[#111111]'
                          : 'bg-[#111111] border-[#111111] text-white'
                      }`}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{sec.visible ? 'Visible' : 'Hidden'}</span>
                    </button>
                    {sec.key === 'custom' && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = sections.filter((_, i) => i !== idx);
                          updateForm((p) => ({ ...p, homepageSections: next }));
                        }}
                        aria-label="Delete custom section"
                        className="p-1.5 border border-red-200 text-red-700 bg-white hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable Section Copy */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={sec.eyebrow || ''}
                      onChange={(e) => {
                        const next = [...sections];
                        next[idx] = { ...sec, eyebrow: e.target.value };
                        updateForm((p) => ({ ...p, homepageSections: next }));
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                    />
                  </div>
                  {sec.key !== 'hero' && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={sec.heading || ''}
                        onChange={(e) => {
                          const next = [...sections];
                          next[idx] = { ...sec, heading: e.target.value };
                          updateForm((p) => ({ ...p, homepageSections: next }));
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                      />
                    </div>
                  )}
                  {sec.key !== 'hero' && sec.key !== 'about' && sec.key !== 'testimonials' && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                        Section Description
                      </label>
                      <input
                        type="text"
                        value={sec.subheading || ''}
                        onChange={(e) => {
                          const next = [...sections];
                          next[idx] = { ...sec, subheading: e.target.value };
                          updateForm((p) => ({ ...p, homepageSections: next }));
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Custom Section Extra Fields */}
                {sec.key === 'custom' && (
                  <div className="mt-4 pt-4 border-t border-[#E5DFD5] space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                          Admin Label
                        </label>
                        <input
                          type="text"
                          value={sec.label}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = { ...sec, label: e.target.value };
                            updateForm((p) => ({ ...p, homepageSections: next }));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                          Background Tone
                        </label>
                        <select
                          value={sec.backgroundTone || 'light'}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = {
                              ...sec,
                              backgroundTone: e.target.value as 'light' | 'dark' | 'warm',
                            };
                            updateForm((p) => ({ ...p, homepageSections: next }));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                        >
                          <option value="light">Archival Paper (Light)</option>
                          <option value="warm">Warm Linen</option>
                          <option value="dark">Obsidian (Dark)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={sec.buttonText || ''}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = { ...sec, buttonText: e.target.value };
                            updateForm((p) => ({ ...p, homepageSections: next }));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={sec.buttonLink || ''}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = { ...sec, buttonLink: e.target.value };
                            updateForm((p) => ({ ...p, homepageSections: next }));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
                        Section Body Copy
                      </label>
                      <textarea
                        rows={3}
                        value={sec.body || ''}
                        onChange={(e) => {
                          const next = [...sections];
                          next[idx] = { ...sec, body: e.target.value };
                          updateForm((p) => ({ ...p, homepageSections: next }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-xs"
                      />
                    </div>

                    <ImageUploaderField
                      label="Custom Section Image (Optional)"
                      value={sec.imageUrl || ''}
                      folder="Banners"
                      onChange={(url) => {
                        const next = [...sections];
                        next[idx] = { ...sec, imageUrl: url };
                        updateForm((p) => ({ ...p, homepageSections: next }));
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE: ABOUT US OR WEBSITE CONTENT */}
      {(mode === 'about' || mode === 'website-content') && (
        <div className="bg-white border border-[#E5DFD5] p-6 space-y-5">
          <h3 className="font-editorial text-2xl text-[#111111] pb-3 border-b border-[#EAE4D9]">
            About Us &amp; Founders Story
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={form.aboutEyebrow || ''}
                onChange={(e) => updateForm((p) => ({ ...p, aboutEyebrow: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                About Heading
              </label>
              <input
                type="text"
                required
                value={form.aboutHeading}
                onChange={(e) => updateForm((p) => ({ ...p, aboutHeading: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Brand Story
              </label>
              <textarea
                rows={4}
                required
                value={form.aboutStory}
                onChange={(e) => updateForm((p) => ({ ...p, aboutStory: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Photography Philosophy
              </label>
              <textarea
                rows={3}
                value={form.aboutPhilosophy || ''}
                onChange={(e) => updateForm((p) => ({ ...p, aboutPhilosophy: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Photographers / Founders Title
              </label>
              <input
                type="text"
                value={form.photographerNames || ''}
                onChange={(e) => updateForm((p) => ({ ...p, photographerNames: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                Photographers Bio
              </label>
              <input
                type="text"
                value={form.photographerBio || ''}
                onChange={(e) => updateForm((p) => ({ ...p, photographerBio: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploaderField
                label="Studio Portrait Photograph"
                value={form.aboutImageUrl || ''}
                folder="Branding"
                onChange={(url) => updateForm((p) => ({ ...p, aboutImageUrl: url }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE: NAVIGATION MENU MANAGEMENT */}
      {mode === 'navigation' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5DFD5] p-6 space-y-4">
            <h3 className="font-editorial text-2xl text-[#111111] pb-3 border-b border-[#EAE4D9]">
              Header CTA Button
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                  Header CTA Button Text
                </label>
                <input
                  type="text"
                  value={form.headerCtaText || ''}
                  onChange={(e) => updateForm((p) => ({ ...p, headerCtaText: e.target.value }))}
                  placeholder="Book a Shoot"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1.5">
                  Header CTA Destination
                </label>
                <input
                  type="text"
                  value={form.headerCtaLink || ''}
                  onChange={(e) => updateForm((p) => ({ ...p, headerCtaLink: e.target.value }))}
                  placeholder="#contact"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5DFD5] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D9]">
              <div>
                <h3 className="font-editorial text-2xl text-[#111111]">
                  Header &amp; Footer Menu Links
                </h3>
                <p className="text-xs text-[#6E675E]">
                  Drag items to reorder. Targets support anchors (<code>#portfolio</code>), custom
                  pages (<code>/p/print-editions</code>), or external URLs.
                </p>
              </div>
              <button
                type="button"
                onClick={addNavLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-[0.11em] bg-[#111111] text-[#FAF8F5] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Menu Item</span>
              </button>
            </div>

            {pages.length > 0 && (
              <div className="text-xs text-[#6E675E] bg-[#FAF8F5] border border-[#EAE4D9] p-3">
                <span className="font-medium text-[#111111]">Available Custom Page Slugs:</span>{' '}
                {pages.map((pg) => (
                  <code key={pg.id} className="mx-1.5 px-1.5 py-0.5 bg-white border border-[#DFD8CC]">
                    /p/{pg.slug}
                  </code>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {navLinks.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragNavIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragNavIdx !== null && dragNavIdx !== idx) {
                      moveNavLink(dragNavIdx, idx);
                    }
                    setDragNavIdx(null);
                  }}
                  className="p-4 bg-[#FAF8F5] border border-[#DFD8CC] grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-3 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-[#8A8277] cursor-grab shrink-0" />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...navLinks];
                        next[idx] = { ...item, label: e.target.value };
                        updateForm((p) => ({ ...p, navLinks: next }));
                      }}
                      placeholder="Label"
                      className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs font-medium"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={item.target}
                      onChange={(e) => {
                        const next = [...navLinks];
                        next[idx] = { ...item, target: e.target.value };
                        updateForm((p) => ({ ...p, navLinks: next }));
                      }}
                      placeholder="#about or /p/custom-slug"
                      className="w-full px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={item.location}
                      onChange={(e) => {
                        const next = [...navLinks];
                        next[idx] = {
                          ...item,
                          location: e.target.value as 'header' | 'footer' | 'both',
                        };
                        updateForm((p) => ({ ...p, navLinks: next }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                    >
                      <option value="both">Header &amp; Footer</option>
                      <option value="header">Header Only</option>
                      <option value="footer">Footer Only</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveNavLink(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1.5 border border-[#DFD8CC] bg-white disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNavLink(idx, idx + 1)}
                      disabled={idx === navLinks.length - 1}
                      className="p-1.5 border border-[#DFD8CC] bg-white disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...navLinks];
                        next[idx] = { ...item, visible: !item.visible };
                        updateForm((p) => ({ ...p, navLinks: next }));
                      }}
                      className={`px-2.5 py-1.5 text-xs border cursor-pointer ${
                        item.visible ? 'bg-white border-[#DFD8CC]' : 'bg-[#111111] text-white'
                      }`}
                    >
                      {item.visible ? 'Shown' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = navLinks.filter((_, i) => i !== idx);
                        updateForm((p) => ({ ...p, navLinks: next }));
                      }}
                      className="p-1.5 border border-red-200 text-red-700 bg-white hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
