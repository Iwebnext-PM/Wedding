import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { optimizeImageFile, toSafeId, toSlug } from '../../lib/imageUtils';
import type { Project, Service, Testimonial } from '../../types/studio';
import { ImageUploaderField } from './ImageUploaderField';

export function ProjectsManager() {
  const { projects, categories, saveProject, deleteProject } = useStudio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState(categories[0]?.name || 'Wedding Photography');
  const [location, setLocation] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [clientName, setClientName] = useState('');
  const [summary, setSummary] = useState('');
  const [editorialNotes, setEditorialNotes] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [order, setOrder] = useState(projects.length + 1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategoryName(categories[0]?.name || 'Wedding Photography');
    setLocation('');
    setDateLabel('');
    setClientName('');
    setSummary('');
    setEditorialNotes('');
    setCoverImageUrl('');
    setGalleryImages([]);
    setOrder(projects.length + 1);
  };

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryImages.length >= 8) {
      setFeedback('Maximum 8 gallery images allowed per project.');
      return;
    }
    try {
      const res = await optimizeImageFile(file, 1400);
      setGalleryImages((prev) => [...prev, res.dataUrl]);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to upload gallery image.');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    if (title.trim().length < 2 || summary.trim().length < 10 || !coverImageUrl.trim()) {
      setFeedback('Title, summary (10+ chars), and cover image are required.');
      return;
    }
    setBusy(true);
    try {
      const isNew = !editingId;
      const id = editingId || toSafeId('proj', title);
      await saveProject(
        id,
        {
          title: title.trim(),
          slug: toSlug(title),
          categoryName: categoryName.trim(),
          location: location.trim() || 'International',
          dateLabel: dateLabel.trim(),
          clientName: clientName.trim(),
          summary: summary.trim(),
          editorialNotes: editorialNotes.trim(),
          coverImageUrl: coverImageUrl.trim(),
          galleryImages: galleryImages.slice(0, 8),
          order: Number(order) || 0,
        },
        isNew
      );
      resetForm();
      setFeedback(isNew ? 'Featured project created.' : 'Featured project updated.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (proj: Project) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setCategoryName(proj.categoryName);
    setLocation(proj.location);
    setDateLabel(proj.dateLabel || '');
    setClientName(proj.clientName || '');
    setSummary(proj.summary);
    setEditorialNotes(proj.editorialNotes || '');
    setCoverImageUrl(proj.coverImageUrl);
    setGalleryImages(proj.galleryImages || []);
    setOrder(proj.order);
    setFeedback('');
  };

  return (
    <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E5DFD5]">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">Featured Projects</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Curate multi-image editorial stories with location, client credits, and notes.
          </p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#111111] cursor-pointer"
          >
            + New Project
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 pb-8 border-b border-[#E5DFD5]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vows Beneath Como Stone"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Category *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Location *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lake Como, Italy"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Client Name
            </label>
            <input
              type="text"
              maxLength={120}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Season / Date Label
            </label>
            <input
              type="text"
              maxLength={60}
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Autumn 2026"
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
              max={1000}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
            Editorial Summary (min 10 chars) *
          </label>
          <textarea
            rows={2}
            required
            maxLength={600}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
            Directors&apos; Monograph Notes
          </label>
          <textarea
            rows={3}
            maxLength={3000}
            value={editorialNotes}
            onChange={(e) => setEditorialNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
          />
        </div>

        <ImageUploaderField
          label="Project Cover Image *"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
        />

        {/* Project Gallery Images */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-[#4A4742] font-medium">
              Project Gallery Frames ({galleryImages.length} / 8)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3.5 py-2 text-xs uppercase tracking-[0.1em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer">
                + Upload Frame
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGalleryImage}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                value={galleryUrlInput}
                onChange={(e) => setGalleryUrlInput(e.target.value)}
                placeholder="Or paste gallery image URL..."
                className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs w-52"
              />
              <button
                type="button"
                onClick={() => {
                  if (galleryUrlInput.trim() && galleryImages.length < 8) {
                    setGalleryImages((prev) => [...prev, galleryUrlInput.trim()]);
                    setGalleryUrlInput('');
                  }
                }}
                className="px-3 py-2 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
              >
                Add URL
              </button>
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryImages.map((url, idx) => (
                <div key={`${url.slice(0, 20)}-${idx}`} className="relative aspect-[4/3] bg-[#181715]">
                  <img
                    src={url}
                    alt={`Gallery frame ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    aria-label="Remove gallery frame"
                    className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center bg-black/75 text-white hover:bg-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {feedback && <span className="text-xs text-[#5E4E3B]">{feedback}</span>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{busy ? 'Saving...' : editingId ? 'Update Project' : 'Publish Project'}</span>
          </button>
        </div>
      </form>

      <div className="divide-y divide-[#E5DFD5]">
        {projects.map((proj) => (
          <div key={proj.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={proj.coverImageUrl}
                alt={proj.title}
                referrerPolicy="no-referrer"
                className="w-20 h-14 object-cover bg-[#181715] shrink-0"
              />
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#786651]">
                  {proj.categoryName} · {proj.location}
                </p>
                <h3 className="font-editorial text-xl text-[#111111]">{proj.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(proj)}
                className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void deleteProject(proj.id)}
                className="px-3 py-1.5 text-xs border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesTestimonialsManager() {
  const {
    services,
    testimonials,
    saveService,
    deleteService,
    saveTestimonial,
    deleteTestimonial,
  } = useStudio();

  // Services state
  const [editingSrvId, setEditingSrvId] = useState<string | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvDeliverables, setSrvDeliverables] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvOrder, setSrvOrder] = useState(services.length + 1);
  const [srvBusy, setSrvBusy] = useState(false);
  const [srvFeedback, setSrvFeedback] = useState('');

  // Testimonials state
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testQuote, setTestQuote] = useState('');
  const [testRating, setTestRating] = useState(5);
  const [testAvatar, setTestAvatar] = useState('');
  const [testOrder, setTestOrder] = useState(testimonials.length + 1);
  const [testBusy, setTestBusy] = useState(false);
  const [testFeedback, setTestFeedback] = useState('');

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSrvFeedback('');
    if (srvTitle.trim().length < 2 || srvDesc.trim().length < 10) {
      setSrvFeedback('Service title and description (10+ chars) are required.');
      return;
    }
    setSrvBusy(true);
    try {
      const isNew = !editingSrvId;
      const id = editingSrvId || toSafeId('srv', srvTitle);
      await saveService(
        id,
        {
          title: srvTitle.trim(),
          slug: toSlug(srvTitle),
          description: srvDesc.trim(),
          deliverables: srvDeliverables.trim(),
          startingPrice: srvPrice.trim(),
          order: Number(srvOrder) || 0,
        },
        isNew
      );
      setEditingSrvId(null);
      setSrvTitle('');
      setSrvDesc('');
      setSrvDeliverables('');
      setSrvPrice('');
      setSrvOrder(services.length + 1);
      setSrvFeedback(isNew ? 'Service added.' : 'Service updated.');
    } catch (err) {
      setSrvFeedback(err instanceof Error ? err.message : 'Failed to save service.');
    } finally {
      setSrvBusy(false);
    }
  };

  const startEditService = (srv: Service) => {
    setEditingSrvId(srv.id);
    setSrvTitle(srv.title);
    setSrvDesc(srv.description);
    setSrvDeliverables(srv.deliverables || '');
    setSrvPrice(srv.startingPrice || '');
    setSrvOrder(srv.order);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestFeedback('');
    if (testName.trim().length < 2 || testQuote.trim().length < 10) {
      setTestFeedback('Client name and quote (10+ chars) are required.');
      return;
    }
    setTestBusy(true);
    try {
      const isNew = !editingTestId;
      const id = editingTestId || toSafeId('test', testName);
      await saveTestimonial(
        id,
        {
          clientName: testName.trim(),
          clientRole: testRole.trim() || 'Private Commission',
          quote: testQuote.trim(),
          rating: Math.min(5, Math.max(1, Number(testRating) || 5)),
          avatarUrl: testAvatar.trim(),
          order: Number(testOrder) || 0,
        },
        isNew
      );
      setEditingTestId(null);
      setTestName('');
      setTestRole('');
      setTestQuote('');
      setTestRating(5);
      setTestAvatar('');
      setTestOrder(testimonials.length + 1);
      setTestFeedback(isNew ? 'Testimonial added.' : 'Testimonial updated.');
    } catch (err) {
      setTestFeedback(err instanceof Error ? err.message : 'Failed to save testimonial.');
    } finally {
      setTestBusy(false);
    }
  };

  const startEditTestimonial = (t: Testimonial) => {
    setEditingTestId(t.id);
    setTestName(t.clientName);
    setTestRole(t.clientRole);
    setTestQuote(t.quote);
    setTestRating(t.rating);
    setTestAvatar(t.avatarUrl || '');
    setTestOrder(t.order);
  };

  return (
    <div className="space-y-12">
      {/* Services Manager */}
      <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E5DFD5]">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Photography Services
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Manage service offerings, deliverables, and starting prices.
            </p>
          </div>
          {editingSrvId && (
            <button
              type="button"
              onClick={() => {
                setEditingSrvId(null);
                setSrvTitle('');
                setSrvDesc('');
                setSrvDeliverables('');
                setSrvPrice('');
              }}
              className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#111111] cursor-pointer"
            >
              + New Service
            </button>
          )}
        </div>

        <form onSubmit={handleSaveService} className="space-y-4 pb-6 border-b border-[#E5DFD5]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Service Title *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={srvTitle}
                onChange={(e) => setSrvTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Starting Price
              </label>
              <input
                type="text"
                maxLength={60}
                value={srvPrice}
                onChange={(e) => setSrvPrice(e.target.value)}
                placeholder="From €3,400"
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
                max={1000}
                value={srvOrder}
                onChange={(e) => setSrvOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Description (min 10 chars) *
            </label>
            <textarea
              rows={2}
              required
              maxLength={600}
              value={srvDesc}
              onChange={(e) => setSrvDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Key Deliverables
            </label>
            <input
              type="text"
              maxLength={240}
              value={srvDeliverables}
              onChange={(e) => setSrvDeliverables(e.target.value)}
              placeholder="2 Principal Photographers · Fine-Art Linen Album"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {srvFeedback && <span className="text-xs text-[#5E4E3B]">{srvFeedback}</span>}
            <button
              type="submit"
              disabled={srvBusy}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
            >
              {srvBusy ? 'Saving...' : editingSrvId ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>

        <div className="divide-y divide-[#E5DFD5]">
          {services.map((srv) => (
            <div key={srv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-[#111111]">
                  {srv.title}{' '}
                  {srv.startingPrice && (
                    <span className="font-mono text-xs text-[#786651] ml-2">
                      {srv.startingPrice}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#6E675E] mt-0.5 line-clamp-1">{srv.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEditService(srv)}
                  className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deleteService(srv.id)}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Manager */}
      <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E5DFD5]">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Client Testimonials
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Add, edit, or remove client reviews featured in the homepage slider.
            </p>
          </div>
          {editingTestId && (
            <button
              type="button"
              onClick={() => {
                setEditingTestId(null);
                setTestName('');
                setTestRole('');
                setTestQuote('');
                setTestAvatar('');
              }}
              className="px-4 py-2 text-xs uppercase tracking-[0.12em] border border-[#111111] cursor-pointer"
            >
              + New Testimonial
            </button>
          )}
        </div>

        <form onSubmit={handleSaveTestimonial} className="space-y-4 pb-6 border-b border-[#E5DFD5]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Role / Commission *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={testRole}
                onChange={(e) => setTestRole(e.target.value)}
                placeholder="Wedding Commission · Lake Como"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Rating (1–5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={testRating}
                onChange={(e) => setTestRating(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Order
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={testOrder}
                onChange={(e) => setTestOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Client Quote (min 10 chars) *
            </label>
            <textarea
              rows={3}
              required
              maxLength={1000}
              value={testQuote}
              onChange={(e) => setTestQuote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <ImageUploaderField
            label="Client Portrait Avatar"
            value={testAvatar}
            onChange={setTestAvatar}
            maxDimension={600}
          />

          <div className="flex items-center justify-end gap-3">
            {testFeedback && <span className="text-xs text-[#5E4E3B]">{testFeedback}</span>}
            <button
              type="submit"
              disabled={testBusy}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
            >
              {testBusy ? 'Saving...' : editingTestId ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
          </div>
        </form>

        <div className="divide-y divide-[#E5DFD5]">
          {testimonials.map((t) => (
            <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-[#111111]">
                  {t.clientName}{' '}
                  <span className="text-xs text-[#786651] ml-2">{t.clientRole}</span>
                </p>
                <p className="text-xs text-[#6E675E] mt-1 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEditTestimonial(t)}
                  className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deleteTestimonial(t.id)}
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
