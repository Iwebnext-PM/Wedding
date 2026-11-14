import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  GripVertical,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { slugify } from '../../lib/imageUtils';
import type { CustomPage, PageBlockType, PageSectionBlock } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';
import { ImageUploaderField } from './ImageUploaderField';
import { CustomPageView } from '../CustomPageView';

interface PageBuilderPanelProps {
  onNotify: (msg: string) => void;
}

function createEmptyBlock(type: PageBlockType): PageSectionBlock {
  return {
    id: `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    type,
    heading:
      type === 'hero'
        ? 'Editorial Exhibition Headline'
        : type === 'cta'
        ? 'Commission a Private Shoot'
        : 'Section Heading',
    subheading: type === 'hero' ? 'Crafted between Milan, Paris, and Kyoto.' : '',
    body:
      type === 'text' || type === 'split'
        ? 'Share your story, exhibition manifesto, or commissioning details here.'
        : '',
    imageUrl: '',
    galleryUrls: [],
    buttonText: type === 'cta' || type === 'split' ? 'Book a Session' : '',
    buttonLink: '#contact',
    backgroundColor: type === 'hero' ? '#0A0A0A' : '#FAF8F5',
    textColor: type === 'hero' ? '#FAF8F5' : '#111111',
  };
}

export function PageBuilderPanel({ onNotify }: PageBuilderPanelProps) {
  const { pages, savePage, deletePage } = useStudio();

  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragBlockIdx, setDragBlockIdx] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openNewPage = () => {
    setIsNew(true);
    setEditingPage({
      id: `page-${Date.now().toString(36)}`,
      title: 'New Studio Page',
      slug: `studio-page-${Date.now().toString(36).slice(-4)}`,
      status: 'draft',
      order: pages.length + 1,
      seoTitle: '',
      seoDescription: '',
      sections: [createEmptyBlock('hero'), createEmptyBlock('text')],
    });
  };

  const openEditPage = (pg: CustomPage) => {
    setIsNew(false);
    setEditingPage({
      ...pg,
      sections: pg.sections.map((s) => ({ ...s })),
    });
  };

  const handleDuplicate = async (pg: CustomPage) => {
    const newId = `page-${Date.now().toString(36)}`;
    const newSlug = `${pg.slug}-copy-${Date.now().toString(36).slice(-3)}`;
    await savePage(
      newId,
      {
        title: `${pg.title} (Copy)`,
        slug: newSlug,
        status: 'draft',
        sections: pg.sections.map((s, idx) => ({ ...s, id: `blk-${Date.now()}-${idx}` })),
        seoTitle: pg.seoTitle,
        seoDescription: pg.seoDescription,
        seoKeywords: pg.seoKeywords,
        ogTitle: pg.ogTitle,
        ogDescription: pg.ogDescription,
        ogImage: pg.ogImage,
        canonicalUrl: pg.canonicalUrl,
        noIndex: pg.noIndex,
        order: pages.length + 1,
      },
      true
    );
    onNotify(`Duplicated "${pg.title}" as draft.`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSaving(true);
    try {
      const cleanSlug = slugify(editingPage.slug || editingPage.title) || `page-${Date.now()}`;
      const { id, createdAt: _c, updatedAt: _u, ...payload } = editingPage;
      await savePage(id, { ...payload, slug: cleanSlug }, isNew);
      setEditingPage(null);
      onNotify(`Page "${editingPage.title}" saved.`);
    } finally {
      setSaving(false);
    }
  };

  const moveBlock = (fromIdx: number, toIdx: number) => {
    if (!editingPage) return;
    const list = [...editingPage.sections];
    if (toIdx < 0 || toIdx >= list.length) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setEditingPage({ ...editingPage, sections: list });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePage(deleteTarget.id);
      setDeleteTarget(null);
      onNotify(`Deleted page "${deleteTarget.title}".`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">
            Page Management &amp; Visual Builder
          </h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Create custom exhibition pages (<code>/p/your-slug</code>), build section layouts,
            toggle Draft/Published status, and preview live output.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewPage}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-[#E5DFD5] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EAE4D9] bg-[#FAF8F5] text-[11px] uppercase tracking-[0.12em] text-[#6E675E]">
              <th className="py-3 px-4 font-medium">Page Title</th>
              <th className="py-3 px-4 font-medium">URL Route</th>
              <th className="py-3 px-4 font-medium">Blocks</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE4D9] text-sm">
            {pages.map((pg) => (
              <tr key={pg.id} className="hover:bg-[#FAF8F5]/70">
                <td className="py-3.5 px-4 font-medium text-[#111111]">{pg.title}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-[#786651]">/p/{pg.slug}</td>
                <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#57534E]">
                  {pg.sections.length}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-mono ${
                      pg.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                    }`}
                  >
                    {pg.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEditPage(pg)}
                    className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                  >
                    Edit Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDuplicate(pg)}
                    title="Duplicate page"
                    className="p-1.5 border border-[#DFD8CC] hover:border-[#111111] cursor-pointer inline-flex items-center"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(pg)}
                    title="Delete page"
                    className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer inline-flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Page Builder Editor */}
      {editingPage && (
        <form onSubmit={handleSave} className="bg-white border border-[#111111] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE4D9]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#786651]">
                Visual Page Builder
              </p>
              <h3 className="font-editorial text-3xl text-[#111111]">{editingPage.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-[0.11em] border border-[#111111] text-[#111111] hover:bg-[#F3EFE8] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Page</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Page'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="p-2 text-[#6E675E] hover:text-[#111111] cursor-pointer"
                aria-label="Close builder"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Meta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: slugify(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                Publication Status
              </label>
              <select
                value={editingPage.status}
                onChange={(e) =>
                  setEditingPage({
                    ...editingPage,
                    status: e.target.value as 'draft' | 'published',
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              >
                <option value="draft">Draft (Hidden from public)</option>
                <option value="published">Published (Live at /p/{editingPage.slug})</option>
              </select>
            </div>
          </div>

          {/* Add Section Block Toolbar */}
          <div className="p-4 bg-[#FAF8F5] border border-[#EAE4D9] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.12em] text-[#4A4742] font-medium">
              Add Content Block:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {(['hero', 'text', 'split', 'gallery', 'cta'] as PageBlockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setEditingPage({
                      ...editingPage,
                      sections: [...editingPage.sections, createEmptyBlock(type)],
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-[0.1em] bg-white border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag-and-Drop Sections Stack */}
          <div className="space-y-4">
            {editingPage.sections.map((blk, idx) => (
              <div
                key={blk.id}
                draggable
                onDragStart={() => setDragBlockIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragBlockIdx !== null && dragBlockIdx !== idx) {
                    moveBlock(dragBlockIdx, idx);
                  }
                  setDragBlockIdx(null);
                }}
                className="border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E5DFD5]">
                  <div className="flex items-center gap-2.5">
                    <GripVertical className="w-4 h-4 text-[#8A8277] cursor-grab" />
                    <span className="font-mono text-xs uppercase px-2 py-0.5 bg-[#111111] text-[#FAF8F5]">
                      {blk.type}
                    </span>
                    <span className="text-xs text-[#6E675E] font-mono">Block #{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1.5 bg-white border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, idx + 1)}
                      disabled={idx === editingPage.sections.length - 1}
                      className="p-1.5 bg-white border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPage({
                          ...editingPage,
                          sections: editingPage.sections.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                      Block Heading
                    </label>
                    <input
                      type="text"
                      required
                      value={blk.heading}
                      onChange={(e) => {
                        const next = [...editingPage.sections];
                        next[idx] = { ...blk, heading: e.target.value };
                        setEditingPage({ ...editingPage, sections: next });
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                      Subheading (Optional)
                    </label>
                    <input
                      type="text"
                      value={blk.subheading || ''}
                      onChange={(e) => {
                        const next = [...editingPage.sections];
                        next[idx] = { ...blk, subheading: e.target.value };
                        setEditingPage({ ...editingPage, sections: next });
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-sm"
                    />
                  </div>
                </div>

                {(blk.type === 'text' || blk.type === 'split' || blk.type === 'cta') && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                      Rich Copy / Paragraphs
                    </label>
                    <textarea
                      rows={3}
                      value={blk.body || ''}
                      onChange={(e) => {
                        const next = [...editingPage.sections];
                        next[idx] = { ...blk, body: e.target.value };
                        setEditingPage({ ...editingPage, sections: next });
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-sm"
                    />
                  </div>
                )}

                {(blk.type === 'hero' || blk.type === 'split') && (
                  <ImageUploaderField
                    label="Block Visual / Image"
                    value={blk.imageUrl || ''}
                    folder="General"
                    onChange={(url) => {
                      const next = [...editingPage.sections];
                      next[idx] = { ...blk, imageUrl: url };
                      setEditingPage({ ...editingPage, sections: next });
                    }}
                  />
                )}

                {blk.type === 'gallery' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[#4A4742]">
                        Gallery Frames ({(blk.galleryUrls || []).length}/6)
                      </span>
                      {(blk.galleryUrls || []).length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...editingPage.sections];
                            next[idx] = {
                              ...blk,
                              galleryUrls: [...(blk.galleryUrls || []), ''],
                            };
                            setEditingPage({ ...editingPage, sections: next });
                          }}
                          className="text-xs text-[#786651] hover:text-[#111111] underline cursor-pointer"
                        >
                          + Add Gallery Frame
                        </button>
                      )}
                    </div>
                    {(blk.galleryUrls || []).map((gUrl, gIdx) => (
                      <div key={gIdx} className="p-3 bg-white border border-[#EAE4D9] space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono">Frame #{gIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...editingPage.sections];
                              next[idx] = {
                                ...blk,
                                galleryUrls: (blk.galleryUrls || []).filter((_, i) => i !== gIdx),
                              };
                              setEditingPage({ ...editingPage, sections: next });
                            }}
                            className="text-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <ImageUploaderField
                          label={`Gallery Image #${gIdx + 1}`}
                          value={gUrl}
                          onChange={(url) => {
                            const urls = [...(blk.galleryUrls || [])];
                            urls[gIdx] = url;
                            const next = [...editingPage.sections];
                            next[idx] = { ...blk, galleryUrls: urls };
                            setEditingPage({ ...editingPage, sections: next });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#E5DFD5]">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#6E675E] mb-1">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={blk.buttonText || ''}
                      onChange={(e) => {
                        const next = [...editingPage.sections];
                        next[idx] = { ...blk, buttonText: e.target.value };
                        setEditingPage({ ...editingPage, sections: next });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DFD8CC] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#6E675E] mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={blk.buttonLink || ''}
                      onChange={(e) => {
                        const next = [...editingPage.sections];
                        next[idx] = { ...blk, buttonLink: e.target.value };
                        setEditingPage({ ...editingPage, sections: next });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DFD8CC] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#6E675E] mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={blk.backgroundColor || '#FAF8F5'}
                        onChange={(e) => {
                          const next = [...editingPage.sections];
                          next[idx] = { ...blk, backgroundColor: e.target.value };
                          setEditingPage({ ...editingPage, sections: next });
                        }}
                        className="w-8 h-8 border border-[#DFD8CC] cursor-pointer"
                      />
                      <span className="font-mono text-xs">{blk.backgroundColor || '#FAF8F5'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#6E675E] mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={blk.textColor || '#111111'}
                        onChange={(e) => {
                          const next = [...editingPage.sections];
                          next[idx] = { ...blk, textColor: e.target.value };
                          setEditingPage({ ...editingPage, sections: next });
                        }}
                        className="w-8 h-8 border border-[#DFD8CC] cursor-pointer"
                      />
                      <span className="font-mono text-xs">{blk.textColor || '#111111'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* Live Visual Preview Modal */}
      {previewOpen && editingPage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 overflow-y-auto"
        >
          <div className="sticky top-0 z-20 bg-[#111111] text-[#FAF8F5] px-6 py-3 flex items-center justify-between border-b border-white/15">
            <span className="text-xs uppercase tracking-[0.14em] text-[#D4C3AA]">
              Live Page Preview — /p/{editingPage.slug}
            </span>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-1.5 text-xs uppercase tracking-[0.11em] bg-[#FAF8F5] text-[#0A0A0A] cursor-pointer"
            >
              Close Preview
            </button>
          </div>
          <div className="bg-[#FAF8F5] min-h-screen">
            <CustomPageView
              page={editingPage}
              onBackHome={() => setPreviewOpen(false)}
              onNavigateTarget={() => setPreviewOpen(false)}
              onOpenLightbox={() => undefined}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Custom Page"
        description={`Permanently delete "${deleteTarget?.title || ''}" (/p/${deleteTarget?.slug || ''})?`}
        confirmLabel="Delete Page"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
