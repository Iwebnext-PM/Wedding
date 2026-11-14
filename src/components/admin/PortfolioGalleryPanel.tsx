import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FolderOpen,
  GripVertical,
  Plus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { optimizeImageFile, slugify } from '../../lib/imageUtils';
import type { Album, AspectRatioType, Category, PortfolioItem } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';
import { ImageUploaderField } from './ImageUploaderField';

interface PortfolioGalleryPanelProps {
  mode: 'portfolio' | 'gallery' | 'categories';
  onNotify: (msg: string) => void;
}

export function PortfolioGalleryPanel({ mode, onNotify }: PortfolioGalleryPanelProps) {
  const {
    categories,
    albums,
    portfolioItems,
    saveCategory,
    deleteCategory,
    saveAlbum,
    deleteAlbum,
    savePortfolioItem,
    deletePortfolioItem,
    saveMediaAsset,
  } = useStudio();

  // Multi-upload state
  const multiInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkCategoryId, setBulkCategoryId] = useState(categories[0]?.id || 'cat-wedding');
  const [bulkAlbumId, setBulkAlbumId] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  // Portfolio item editor
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [filterCatId, setFilterCatId] = useState('all');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-wedding');
  const [albumId, setAlbumId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('portrait');
  const [location, setLocation] = useState('');
  const [cameraSpecs, setCameraSpecs] = useState('');
  const [year, setYear] = useState('2026');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(portfolioItems.length + 1);
  const [saving, setSaving] = useState(false);

  // Album state
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albTitle, setAlbTitle] = useState('');
  const [albDesc, setAlbDesc] = useState('');
  const [albCover, setAlbCover] = useState('');
  const [albCatId, setAlbCatId] = useState(categories[0]?.id || 'cat-wedding');
  const [albPublished, setAlbPublished] = useState(true);

  // Category state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState(categories.length + 1);

  // Confirm delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    kind: 'item' | 'album' | 'category';
    id: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const displayedItems = useMemo(() => {
    if (filterCatId === 'all') return portfolioItems;
    return portfolioItems.filter((item) => item.categoryId === filterCatId);
  }, [portfolioItems, filterCatId]);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBulkUploading(true);
    const chosenCat = categories.find((c) => c.id === bulkCategoryId) || categories[0];

    try {
      let nextOrder = portfolioItems.length + 1;
      for (const file of files) {
        const res = await optimizeImageFile(file, 1600);
        const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 120);
        const aspect: AspectRatioType =
          res.width === res.height
            ? 'square'
            : res.height > res.width
            ? 'portrait'
            : 'landscape';
        const itemId = `work-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        await savePortfolioItem(
          itemId,
          {
            title: cleanTitle || 'Studio Frame',
            description: '',
            altText: cleanTitle || 'TWINS photography frame',
            categoryId: chosenCat.id,
            categoryName: chosenCat.name,
            albumId: bulkAlbumId || undefined,
            imageUrl: res.dataUrl,
            aspectRatio: aspect,
            location: '',
            cameraSpecs: '',
            year: String(new Date().getFullYear()),
            featured: false,
            published: true,
            order: nextOrder++,
          },
          true
        );

        await saveMediaAsset(
          `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          {
            name: file.name.slice(0, 140),
            url: res.dataUrl,
            mediaType: 'image',
            folder: chosenCat.name.slice(0, 40),
            altText: cleanTitle,
            width: res.width,
            height: res.height,
            sizeBytes: res.sizeBytes,
          },
          true
        );
      }
      onNotify(`Uploaded and published ${files.length} image(s) to ${chosenCat.name}.`);
    } finally {
      setBulkUploading(false);
      if (multiInputRef.current) multiInputRef.current.value = '';
    }
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setAltText('');
    setCategoryId(categories[0]?.id || 'cat-wedding');
    setAlbumId('');
    setImageUrl('');
    setAspectRatio('portrait');
    setLocation('');
    setCameraSpecs('');
    setYear('2026');
    setFeatured(false);
    setPublished(true);
    setOrder(portfolioItems.length + 1);
    setShowItemForm(false);
  };

  const startEditItem = (item: PortfolioItem) => {
    setEditingItemId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setAltText(item.altText || '');
    setCategoryId(item.categoryId);
    setAlbumId(item.albumId || '');
    setImageUrl(item.imageUrl);
    setAspectRatio(item.aspectRatio);
    setLocation(item.location || '');
    setCameraSpecs(item.cameraSpecs || '');
    setYear(item.year || '2026');
    setFeatured(item.featured);
    setPublished(item.published !== false);
    setOrder(item.order);
    setShowItemForm(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setSaving(true);
    const cat = categories.find((c) => c.id === categoryId) || categories[0];
    try {
      const id = editingItemId || `work-${Date.now().toString(36)}`;
      await savePortfolioItem(
        id,
        {
          title: title.trim(),
          description: description.trim(),
          altText: altText.trim() || title.trim(),
          categoryId: cat.id,
          categoryName: cat.name,
          albumId: albumId || undefined,
          imageUrl: imageUrl.trim(),
          aspectRatio,
          location: location.trim(),
          cameraSpecs: cameraSpecs.trim(),
          year: year.trim(),
          featured,
          published,
          order: Number(order) || 1,
        },
        !editingItemId
      );
      resetItemForm();
      onNotify(editingItemId ? 'Photograph updated.' : 'New photograph added to portfolio.');
    } finally {
      setSaving(false);
    }
  };

  const toggleItemFlag = async (item: PortfolioItem, field: 'featured' | 'published') => {
    const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
    await savePortfolioItem(
      id,
      {
        ...rest,
        [field]: field === 'published' ? item.published === false : !item.featured,
      },
      false
    );
  };

  const reorderPortfolio = async (fromIdx: number, toIdx: number) => {
    if (filterCatId !== 'all' || toIdx < 0 || toIdx >= portfolioItems.length) return;
    const reordered = [...portfolioItems];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    for (let i = 0; i < reordered.length; i++) {
      const item = reordered[i];
      if (item.order !== i + 1) {
        const { id, createdAt: _c, updatedAt: _u, ...rest } = item;
        await savePortfolioItem(id, { ...rest, order: i + 1 }, false);
      }
    }
    onNotify('Gallery display order updated.');
  };

  // Album Handlers
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albTitle.trim()) return;
    setSaving(true);
    try {
      const slug = slugify(albTitle) || `album-${Date.now()}`;
      const id = editingAlbumId || `alb-${slug.slice(0, 24)}-${Date.now().toString(36).slice(-3)}`;
      await saveAlbum(
        id,
        {
          title: albTitle.trim(),
          slug,
          description: albDesc.trim(),
          coverImageUrl: albCover.trim(),
          categoryId: albCatId,
          published: albPublished,
          order: editingAlbumId
            ? albums.find((a) => a.id === editingAlbumId)?.order || 1
            : albums.length + 1,
        },
        !editingAlbumId
      );
      setEditingAlbumId(null);
      setAlbTitle('');
      setAlbDesc('');
      setAlbCover('');
      onNotify('Gallery album saved.');
    } finally {
      setSaving(false);
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSaving(true);
    try {
      const slug = slugify(catName) || `cat-${Date.now()}`;
      const id = editingCatId || `cat-${slug.slice(0, 24)}`;
      await saveCategory(
        id,
        {
          name: catName.trim(),
          slug,
          description: catDesc.trim(),
          order: Number(catOrder) || categories.length + 1,
        },
        !editingCatId
      );
      setEditingCatId(null);
      setCatName('');
      setCatDesc('');
      setCatOrder(categories.length + 2);
      onNotify(editingCatId ? 'Category updated.' : 'New category created.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (deleteConfirm.kind === 'item') await deletePortfolioItem(deleteConfirm.id);
      if (deleteConfirm.kind === 'album') await deleteAlbum(deleteConfirm.id);
      if (deleteConfirm.kind === 'category') await deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
      onNotify(`Deleted "${deleteConfirm.label}".`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* MODE: PORTFOLIO MANAGEMENT */}
      {mode === 'portfolio' && (
        <>
          <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl text-[#111111]">
                Portfolio Management &amp; Multi-Upload
              </h2>
              <p className="text-xs text-[#6E675E] mt-1">
                Upload multiple photographs at once, drag cards to reorder, edit alt text, or
                publish/hide frames.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Bulk upload category"
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cat: {c.name}
                  </option>
                ))}
              </select>

              {albums.length > 0 && (
                <select
                  aria-label="Bulk upload album"
                  value={bulkAlbumId}
                  onChange={(e) => setBulkAlbumId(e.target.value)}
                  className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
                >
                  <option value="">No Album</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      Album: {a.title}
                    </option>
                  ))}
                </select>
              )}

              <input
                ref={multiInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => multiInputRef.current?.click()}
                disabled={bulkUploading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.11em] font-medium border border-[#111111] text-[#111111] hover:bg-[#F3EFE8] disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{bulkUploading ? 'Uploading...' : 'Multi-Image Upload'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetItemForm();
                  setShowItemForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photograph</span>
              </button>
            </div>
          </div>

          {/* Single Photograph Editor Drawer */}
          {showItemForm && (
            <form
              onSubmit={handleSaveItem}
              className="bg-white border border-[#111111] p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
                <h3 className="font-editorial text-2xl">
                  {editingItemId ? 'Edit Photograph' : 'Add New Portfolio Frame'}
                </h3>
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="text-xs uppercase tracking-[0.1em] text-[#6E675E] hover:text-[#111111] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <ImageUploaderField
                label="Photograph *"
                value={imageUrl}
                folder="Weddings"
                onChange={setImageUrl}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Album (Optional)
                  </label>
                  <select
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  >
                    <option value="">None</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    SEO Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descriptive alt text for search & accessibility"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  >
                    <option value="portrait">Portrait (3:4)</option>
                    <option value="landscape">Landscape (4:3)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Caption / Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                    Camera Specs
                  </label>
                  <input
                    type="text"
                    value={cameraSpecs}
                    onChange={(e) => setCameraSpecs(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#EAE4D9]">
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                    <span>Published (Visible on live site)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                    />
                    <span>Featured Highlight</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving || !imageUrl}
                  className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Photograph'}
                </button>
              </div>
            </form>
          )}

          {/* Category Filter + Grid */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterCatId('all')}
                className={`px-3 py-1.5 text-xs cursor-pointer ${
                  filterCatId === 'all'
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-[#DFD8CC]'
                }`}
              >
                All ({portfolioItems.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilterCatId(c.id)}
                  className={`px-3 py-1.5 text-xs cursor-pointer ${
                    filterCatId === c.id
                      ? 'bg-[#111111] text-white'
                      : 'bg-white border border-[#DFD8CC]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {filterCatId === 'all' && (
              <p className="text-[11px] text-[#6E675E]">
                Tip: Drag cards or click arrows to reorder portfolio sequence.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedItems.map((item, idx) => {
              const isPub = item.published !== false;
              return (
                <div
                  key={item.id}
                  draggable={filterCatId === 'all'}
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== idx) {
                      void reorderPortfolio(dragIdx, idx);
                    }
                    setDragIdx(null);
                  }}
                  className={`bg-white border overflow-hidden flex flex-col justify-between ${
                    isPub ? 'border-[#E5DFD5]' : 'border-stone-300 opacity-75'
                  }`}
                >
                  <div>
                    <div className="aspect-[4/3] bg-[#181715] relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.altText || item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {filterCatId === 'all' && (
                        <div className="absolute top-2 left-2 p-1 bg-black/65 text-white cursor-grab">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {!isPub && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono uppercase">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[#786651]">
                        {item.categoryName}
                      </p>
                      <h4 className="mt-1 font-editorial text-xl text-[#111111] truncate">
                        {item.title}
                      </h4>
                      {item.altText && (
                        <p className="mt-1 text-[11px] text-[#6E675E] truncate">Alt: {item.altText}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        className="px-2.5 py-1 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleItemFlag(item, 'published')}
                        title={isPub ? 'Hide from website' : 'Publish to website'}
                        className="p-1.5 border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                      >
                        {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleItemFlag(item, 'featured')}
                        title="Toggle Featured"
                        className={`p-1.5 border cursor-pointer ${
                          item.featured
                            ? 'bg-[#111111] border-[#111111] text-[#D4C3AA]'
                            : 'border-[#DFD8CC] text-[#6E675E]'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {filterCatId === 'all' && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => void reorderPortfolio(idx, idx - 1)}
                            className="p-1 border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === displayedItems.length - 1}
                            onClick={() => void reorderPortfolio(idx, idx + 1)}
                            className="p-1 border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({ kind: 'item', id: item.id, label: item.title })
                        }
                        className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODE: GALLERY ALBUMS MANAGEMENT */}
      {mode === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
            <h2 className="font-editorial text-2xl text-[#111111]">
              {editingAlbumId ? 'Edit Gallery Album' : 'Create Gallery Album'}
            </h2>
            <form onSubmit={handleSaveAlbum} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  value={albTitle}
                  onChange={(e) => setAlbTitle(e.target.value)}
                  placeholder="Italian Villas & Stone Light"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Primary Category
                </label>
                <select
                  value={albCatId}
                  onChange={(e) => setAlbCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={albDesc}
                  onChange={(e) => setAlbDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <ImageUploaderField
                label="Album Cover Image"
                value={albCover}
                folder="Weddings"
                onChange={setAlbCover}
              />
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={albPublished}
                  onChange={(e) => setAlbPublished(e.target.checked)}
                />
                <span>Published on public portfolio archive</span>
              </label>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
                >
                  {editingAlbumId ? 'Update Album' : 'Create Album'}
                </button>
                {editingAlbumId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAlbumId(null);
                      setAlbTitle('');
                      setAlbDesc('');
                      setAlbCover('');
                    }}
                    className="px-4 py-2.5 text-xs uppercase tracking-[0.11em] border border-[#DFD8CC] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E5DFD5] p-5">
              <h3 className="font-editorial text-2xl text-[#111111]">
                Curated Gallery Albums ({albums.length})
              </h3>
              <p className="text-xs text-[#6E675E] mt-1">
                Assign photographs to albums inside Portfolio Management so visitors can filter by
                curated series.
              </p>
            </div>

            {albums.map((alb: Album) => {
              const count = portfolioItems.filter((p) => p.albumId === alb.id).length;
              return (
                <div
                  key={alb.id}
                  className="bg-white border border-[#E5DFD5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-16 bg-[#181715] shrink-0 overflow-hidden flex items-center justify-center">
                      {alb.coverImageUrl ? (
                        <img
                          src={alb.coverImageUrl}
                          alt={alb.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FolderOpen className="w-5 h-5 text-[#8A8277]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-editorial text-xl text-[#111111] truncate">{alb.title}</h4>
                      <p className="text-xs text-[#6E675E] font-mono tabular-nums">
                        {count} frame(s) · {alb.published ? 'Published' : 'Hidden'}
                      </p>
                      {alb.description && (
                        <p className="text-xs text-[#4A4742] mt-1 line-clamp-1">{alb.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAlbumId(alb.id);
                        setAlbTitle(alb.title);
                        setAlbDesc(alb.description || '');
                        setAlbCover(alb.coverImageUrl || '');
                        setAlbCatId(alb.categoryId || categories[0]?.id || '');
                        setAlbPublished(alb.published);
                      }}
                      className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({ kind: 'album', id: alb.id, label: alb.title })
                      }
                      className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE: PHOTOGRAPHY CATEGORIES */}
      {mode === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
            <h2 className="font-editorial text-2xl text-[#111111]">
              {editingCatId ? 'Rename / Edit Category' : 'Add Photography Category'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Architectural Photography"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value))}
                  className="w-28 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
                >
                  {editingCatId ? 'Save Category' : 'Create Category'}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatDesc('');
                    }}
                    className="px-4 py-2.5 text-xs uppercase tracking-[0.11em] border border-[#DFD8CC] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E5DFD5] divide-y divide-[#EAE4D9]">
            {categories.map((cat: Category) => {
              const count = portfolioItems.filter((p) => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#786651] tabular-nums">
                        #{cat.order}
                      </span>
                      <h4 className="font-editorial text-xl text-[#111111]">{cat.name}</h4>
                      <span className="text-xs font-mono text-[#8A8277]">({count} works)</span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-[#6E675E] mt-1">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatName(cat.name);
                        setCatDesc(cat.description || '');
                        setCatOrder(cat.order);
                      }}
                      className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({ kind: 'category', id: cat.id, label: cat.name })
                      }
                      className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteConfirm)}
        title={`Delete ${deleteConfirm?.kind || 'Item'}`}
        description={`Are you sure you want to delete "${deleteConfirm?.label || ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
