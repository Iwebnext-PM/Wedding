import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { toSafeId, toSlug } from '../../lib/imageUtils';
import type { AspectRatioType, Category, PortfolioItem } from '../../types/studio';
import { ImageUploaderField } from './ImageUploaderField';

export function PortfolioManager() {
  const {
    categories,
    portfolioItems,
    saveCategory,
    deleteCategory,
    savePortfolioItem,
    deletePortfolioItem,
  } = useStudio();

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState(categories.length + 1);
  const [catBusy, setCatBusy] = useState(false);
  const [catFeedback, setCatFeedback] = useState('');

  // Portfolio Item Form State
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workTitle, setWorkTitle] = useState('');
  const [workCatId, setWorkCatId] = useState(categories[0]?.id || '');
  const [workImageUrl, setWorkImageUrl] = useState('');
  const [workAspect, setWorkAspect] = useState<AspectRatioType>('portrait');
  const [workLocation, setWorkLocation] = useState('');
  const [workSpecs, setWorkSpecs] = useState('');
  const [workYear, setWorkYear] = useState('2026');
  const [workFeatured, setWorkFeatured] = useState(true);
  const [workOrder, setWorkOrder] = useState(portfolioItems.length + 1);
  const [workBusy, setWorkBusy] = useState(false);
  const [workFeedback, setWorkFeedback] = useState('');
  const [filterCatId, setFilterCatId] = useState('all');

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
    setCatOrder(categories.length + 1);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFeedback('');
    if (catName.trim().length < 2) {
      setCatFeedback('Category name must be at least 2 characters.');
      return;
    }
    setCatBusy(true);
    try {
      const isNew = !editingCatId;
      const id = editingCatId || toSafeId('cat', catName);
      await saveCategory(
        id,
        {
          name: catName.trim(),
          slug: toSlug(catName),
          description: catDesc.trim(),
          order: Number(catOrder) || 0,
        },
        isNew
      );
      resetCategoryForm();
      setCatFeedback(isNew ? 'Category created.' : 'Category updated.');
    } catch (err) {
      setCatFeedback(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setCatBusy(false);
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatOrder(cat.order);
    setCatFeedback('');
  };

  const resetWorkForm = () => {
    setEditingWorkId(null);
    setWorkTitle('');
    setWorkCatId(categories[0]?.id || '');
    setWorkImageUrl('');
    setWorkAspect('portrait');
    setWorkLocation('');
    setWorkSpecs('');
    setWorkYear('2026');
    setWorkFeatured(true);
    setWorkOrder(portfolioItems.length + 1);
  };

  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkFeedback('');
    const selectedCat = categories.find((c) => c.id === workCatId) || categories[0];
    if (!selectedCat) {
      setWorkFeedback('Please create a category first.');
      return;
    }
    if (workTitle.trim().length < 2) {
      setWorkFeedback('Title must be at least 2 characters.');
      return;
    }
    if (!workImageUrl.trim()) {
      setWorkFeedback('Please upload or provide an image URL.');
      return;
    }

    setWorkBusy(true);
    try {
      const isNew = !editingWorkId;
      const id = editingWorkId || toSafeId('work', workTitle);
      await savePortfolioItem(
        id,
        {
          title: workTitle.trim(),
          categoryId: selectedCat.id,
          categoryName: selectedCat.name,
          imageUrl: workImageUrl.trim(),
          aspectRatio: workAspect,
          location: workLocation.trim(),
          cameraSpecs: workSpecs.trim(),
          year: workYear.trim() || '2026',
          featured: workFeatured,
          order: Number(workOrder) || 0,
        },
        isNew
      );
      resetWorkForm();
      setWorkFeedback(isNew ? 'Photograph published to portfolio.' : 'Photograph updated.');
    } catch (err) {
      setWorkFeedback(err instanceof Error ? err.message : 'Failed to save photograph.');
    } finally {
      setWorkBusy(false);
    }
  };

  const startEditWork = (item: PortfolioItem) => {
    setEditingWorkId(item.id);
    setWorkTitle(item.title);
    setWorkCatId(item.categoryId);
    setWorkImageUrl(item.imageUrl);
    setWorkAspect(item.aspectRatio);
    setWorkLocation(item.location || '');
    setWorkSpecs(item.cameraSpecs || '');
    setWorkYear(item.year || '2026');
    setWorkFeatured(item.featured);
    setWorkOrder(item.order);
    setWorkFeedback('');
  };

  const visibleItems =
    filterCatId === 'all'
      ? portfolioItems
      : portfolioItems.filter((item) => item.categoryId === filterCatId);

  return (
    <div className="space-y-12">
      {/* Portfolio Images Manager */}
      <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Portfolio Photographs
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Upload high-resolution work, assign categories, and edit EXIF captions.
            </p>
          </div>
          {editingWorkId && (
            <button
              type="button"
              onClick={resetWorkForm}
              className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] transition-colors cursor-pointer"
            >
              + New Photograph
            </button>
          )}
        </div>

        <form onSubmit={handleSaveWork} className="mt-6 space-y-5 pb-8 border-b border-[#E5DFD5]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                maxLength={140}
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                placeholder="Villa Balbiano Ceremony"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Category *
              </label>
              <select
                value={workCatId}
                onChange={(e) => setWorkCatId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={workAspect}
                onChange={(e) => setWorkAspect(e.target.value as AspectRatioType)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              >
                <option value="portrait">Portrait (3:4)</option>
                <option value="landscape">Landscape (4:3)</option>
                <option value="square">Square (1:1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Location
              </label>
              <input
                type="text"
                maxLength={120}
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="Lake Como, Italy"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Camera / EXIF Specs
              </label>
              <input
                type="text"
                maxLength={120}
                value={workSpecs}
                onChange={(e) => setWorkSpecs(e.target.value)}
                placeholder="Leica SL3 · 50mm f/1.4 · ISO 200"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                  Year
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={workYear}
                  onChange={(e) => setWorkYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                  Order
                </label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={workOrder}
                  onChange={(e) => setWorkOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <ImageUploaderField
            label="Photograph Image *"
            value={workImageUrl}
            onChange={setWorkImageUrl}
            helperText="Automatically compressed to high-clarity WebP/JPEG for fast gallery loading."
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-[#4A4742] cursor-pointer">
              <input
                type="checkbox"
                checked={workFeatured}
                onChange={(e) => setWorkFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#111111]"
              />
              <span>Mark as Featured Work</span>
            </label>

            <div className="flex items-center gap-3">
              {workFeedback && <span className="text-xs text-[#5E4E3B]">{workFeedback}</span>}
              <button
                type="submit"
                disabled={workBusy}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{workBusy ? 'Saving...' : editingWorkId ? 'Update Photograph' : 'Publish Photograph'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Filter & Existing Portfolio List */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6E675E] font-mono tabular-nums">
            {visibleItems.length} Published Frames
          </p>
          <select
            value={filterCatId}
            onChange={(e) => setFilterCatId(e.target.value)}
            aria-label="Filter portfolio items by category"
            className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item) => (
            <div key={item.id} className="border border-[#E5DFD5] bg-[#FAF8F5] flex flex-col">
              <div className="aspect-[4/3] bg-[#181715] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#786651]">
                    {item.categoryName} · #{item.order}
                  </p>
                  <h3 className="mt-1 font-editorial text-xl text-[#111111]">{item.title}</h3>
                  {item.location && <p className="text-xs text-[#6E675E] mt-0.5">{item.location}</p>}
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => startEditWork(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deletePortfolioItem(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-red-200 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Manager */}
      <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Photography Categories
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Manage portfolio filter tabs and URL-friendly category slugs.
            </p>
          </div>
          {editingCatId && (
            <button
              type="button"
              onClick={resetCategoryForm}
              className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#111111] text-[#111111] cursor-pointer"
            >
              + New Category
            </button>
          )}
        </div>

        <form onSubmit={handleSaveCategory} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b border-[#E5DFD5]">
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Editorial Architecture"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              maxLength={300}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Concise description of this photography discipline"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="w-20">
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Order
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={catOrder}
                onChange={(e) => setCatOrder(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
              />
            </div>
            <button
              type="submit"
              disabled={catBusy}
              className="flex-1 py-2.5 px-4 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {catBusy ? 'Saving...' : editingCatId ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>

        {catFeedback && <p className="mt-3 text-xs text-[#5E4E3B]">{catFeedback}</p>}

        <div className="mt-5 divide-y divide-[#E5DFD5]">
          {categories.map((cat) => (
            <div key={cat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-[#111111]">
                  {cat.name}{' '}
                  <span className="font-mono text-xs text-[#6E675E] ml-2">/{cat.slug}</span>
                </p>
                {cat.description && <p className="text-xs text-[#6E675E] mt-0.5">{cat.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs text-[#6E675E] mr-2 tabular-nums">
                  Order {cat.order}
                </span>
                <button
                  type="button"
                  onClick={() => startEditCategory(cat)}
                  className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deleteCategory(cat.id)}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
