import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { slugify } from '../../lib/imageUtils';
import type { Project, Service, Testimonial } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';
import { ImageUploaderField } from './ImageUploaderField';

const ICON_OPTIONS = [
  'Camera',
  'Heart',
  'Compass',
  'User',
  'Sparkles',
  'Calendar',
  'Building2',
  'Aperture',
];

export function ProjectsManagerPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { projects, saveProject, deleteProject } = useStudio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('Wedding Photography');
  const [location, setLocation] = useState('');
  const [dateLabel, setDateLabel] = useState('Autumn 2026');
  const [clientName, setClientName] = useState('');
  const [summary, setSummary] = useState('');
  const [editorialNotes, setEditorialNotes] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(projects.length + 1);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategoryName('Wedding Photography');
    setLocation('');
    setDateLabel('Autumn 2026');
    setClientName('');
    setSummary('');
    setEditorialNotes('');
    setCoverImageUrl('');
    setGalleryImages([]);
    setPublished(true);
    setOrder(projects.length + 1);
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
    setPublished(proj.published !== false);
    setOrder(proj.order);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImageUrl.trim()) return;
    setSaving(true);
    try {
      const slug = slugify(title) || `project-${Date.now()}`;
      const id = editingId || `proj-${slug.slice(0, 20)}-${Date.now().toString(36).slice(-3)}`;
      await saveProject(
        id,
        {
          title: title.trim(),
          slug,
          categoryName: categoryName.trim(),
          location: location.trim(),
          dateLabel: dateLabel.trim(),
          clientName: clientName.trim(),
          summary: summary.trim(),
          editorialNotes: editorialNotes.trim(),
          coverImageUrl: coverImageUrl.trim(),
          galleryImages: galleryImages.filter(Boolean).slice(0, 8),
          published,
          order: Number(order) || 1,
        },
        !editingId
      );
      onNotify(editingId ? 'Project updated.' : 'New project published.');
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
          <h3 className="font-editorial text-2xl text-[#111111]">
            {editingId ? 'Edit Featured Project' : 'New Editorial Project'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#6E675E] hover:text-[#111111] cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploaderField
            label="Cover Photograph *"
            value={coverImageUrl}
            folder="Weddings"
            onChange={setCoverImageUrl}
          />

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Client
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Date / Season
              </label>
              <input
                type="text"
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Summary *
            </label>
            <textarea
              rows={2}
              required
              minLength={10}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Editorial Monograph Notes
            </label>
            <textarea
              rows={3}
              value={editorialNotes}
              onChange={(e) => setEditorialNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em] text-[#4A4742]">
                Story Gallery Slides ({galleryImages.length}/8)
              </span>
              {galleryImages.length < 8 && (
                <button
                  type="button"
                  onClick={() => setGalleryImages((p) => [...p, ''])}
                  className="text-xs text-[#786651] hover:text-[#111111] underline cursor-pointer"
                >
                  + Add Slide
                </button>
              )}
            </div>
            {galleryImages.map((gUrl, idx) => (
              <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#EAE4D9] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-mono">Slide #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setGalleryImages((p) => p.filter((_, i) => i !== idx))}
                    className="text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <ImageUploaderField
                  label={`Gallery Slide ${idx + 1}`}
                  value={gUrl}
                  onChange={(url) => {
                    const next = [...galleryImages];
                    next[idx] = url;
                    setGalleryImages(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span>Published</span>
            </label>
            <button
              type="submit"
              disabled={saving || !coverImageUrl}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : editingId ? 'Save Project' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>

      <div className="xl:col-span-7 space-y-4">
        <div className="bg-white border border-[#E5DFD5] p-5">
          <h3 className="font-editorial text-2xl text-[#111111]">
            Featured Projects ({projects.length})
          </h3>
        </div>

        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white border border-[#E5DFD5] p-4 flex flex-col sm:flex-row gap-4 justify-between"
          >
            <div className="flex gap-4 min-w-0">
              <img
                src={proj.coverImageUrl}
                alt={proj.title}
                referrerPolicy="no-referrer"
                className="w-24 h-20 object-cover bg-[#181715] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#786651]">
                  {proj.categoryName} · {proj.location} ·{' '}
                  {proj.published === false ? 'Hidden' : 'Live'}
                </p>
                <h4 className="font-editorial text-xl text-[#111111] truncate">{proj.title}</h4>
                <p className="text-xs text-[#6E675E] line-clamp-2 mt-1">{proj.summary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(proj)}
                className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(proj)}
                className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Featured Project"
        description={`Remove "${deleteTarget?.title || ''}" from Featured Projects?`}
        confirmLabel="Delete Project"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteProject(deleteTarget.id);
            setDeleteTarget(null);
            onNotify('Project deleted.');
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function ServicesManagerPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { services, saveService, deleteService } = useStudio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [iconName, setIconName] = useState('Camera');
  const [features, setFeatures] = useState<string[]>(['']);
  const [enabled, setEnabled] = useState(true);
  const [order, setOrder] = useState(services.length + 1);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStartingPrice('');
    setDeliverables('');
    setImageUrl('');
    setIconName('Camera');
    setFeatures(['']);
    setEnabled(true);
    setOrder(services.length + 1);
  };

  const startEdit = (srv: Service) => {
    setEditingId(srv.id);
    setTitle(srv.title);
    setDescription(srv.description);
    setStartingPrice(srv.startingPrice || '');
    setDeliverables(srv.deliverables || '');
    setImageUrl(srv.imageUrl || '');
    setIconName(srv.iconName || 'Camera');
    setFeatures(srv.features && srv.features.length > 0 ? srv.features : ['']);
    setEnabled(srv.enabled !== false);
    setOrder(srv.order);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = slugify(title) || `service-${Date.now()}`;
      const id = editingId || `srv-${slug.slice(0, 20)}-${Date.now().toString(36).slice(-3)}`;
      await saveService(
        id,
        {
          title: title.trim(),
          slug,
          description: description.trim(),
          startingPrice: startingPrice.trim(),
          deliverables: deliverables.trim(),
          imageUrl: imageUrl.trim(),
          iconName,
          features: features.map((f) => f.trim()).filter(Boolean).slice(0, 10),
          enabled,
          order: Number(order) || 1,
        },
        !editingId
      );
      onNotify(editingId ? 'Service updated.' : 'New photography service added.');
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const reorderService = async (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= services.length) return;
    const list = [...services];
    const [moved] = list.splice(idx, 1);
    list.splice(swapIdx, 0, moved);
    for (let i = 0; i < list.length; i++) {
      const srv = list[i];
      if (srv.order !== i + 1) {
        const { id, createdAt: _c, updatedAt: _u, ...rest } = srv;
        await saveService(id, { ...rest, order: i + 1 }, false);
      }
    }
    onNotify('Service order updated.');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
          <h3 className="font-editorial text-2xl text-[#111111]">
            {editingId ? 'Edit Photography Service' : 'Add Photography Service'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#6E675E] hover:text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploaderField
            label="Service Card Image (Optional)"
            value={imageUrl}
            folder="General"
            onChange={setImageUrl}
          />

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Starting Price
              </label>
              <input
                type="text"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="From €3,500"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Lucide Icon
              </label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.1em] text-[#4A4742]">
                Service Features List ({features.length}/10)
              </label>
              {features.length < 10 && (
                <button
                  type="button"
                  onClick={() => setFeatures((p) => [...p, ''])}
                  className="text-xs text-[#786651] hover:text-[#111111] underline cursor-pointer"
                >
                  + Add Bullet
                </button>
              )}
            </div>
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => {
                    const next = [...features];
                    next[idx] = e.target.value;
                    setFeatures(next);
                  }}
                  placeholder={`Feature #${idx + 1}`}
                  className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFeatures((p) => p.filter((_, i) => i !== idx))}
                    className="p-1 text-red-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>Enabled on Website</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
            >
              {saving ? 'Saving...' : editingId ? 'Save Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>

      <div className="xl:col-span-7 space-y-3">
        <div className="bg-white border border-[#E5DFD5] p-5">
          <h3 className="font-editorial text-2xl text-[#111111]">
            Photography Services ({services.length})
          </h3>
        </div>

        {services.map((srv, idx) => (
          <div
            key={srv.id}
            className={`bg-white border p-4 flex items-center justify-between gap-4 ${
              srv.enabled === false ? 'border-stone-300 opacity-70' : 'border-[#E5DFD5]'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {srv.imageUrl && (
                <img
                  src={srv.imageUrl}
                  alt={srv.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover bg-[#181715] shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-mono text-[#786651]">
                  #{srv.order} · {srv.iconName || 'Camera'} · {srv.startingPrice || 'Bespoke'} ·{' '}
                  {srv.enabled === false ? 'Disabled' : 'Active'}
                </p>
                <h4 className="font-editorial text-xl text-[#111111] truncate">{srv.title}</h4>
                <p className="text-xs text-[#6E675E] truncate">{srv.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => void reorderService(idx, -1)}
                className="p-1.5 border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === services.length - 1}
                onClick={() => void reorderService(idx, 1)}
                className="p-1.5 border border-[#DFD8CC] disabled:opacity-35 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { id, createdAt: _c, updatedAt: _u, ...rest } = srv;
                  await saveService(id, { ...rest, enabled: srv.enabled === false }, false);
                }}
                title={srv.enabled === false ? 'Enable' : 'Disable'}
                className="p-1.5 border border-[#DFD8CC] cursor-pointer"
              >
                {srv.enabled === false ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => startEdit(srv)}
                className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(srv)}
                className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Service"
        description={`Remove "${deleteTarget?.title || ''}" from your services catalog?`}
        confirmLabel="Delete Service"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteService(deleteTarget.id);
            setDeleteTarget(null);
            onNotify('Service deleted.');
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function TestimonialsManagerPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { testimonials, saveTestimonial, deleteTestimonial } = useStudio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(testimonials.length + 1);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setClientName('');
    setClientRole('');
    setQuote('');
    setRating(5);
    setAvatarUrl('');
    setFeatured(true);
    setPublished(true);
    setOrder(testimonials.length + 1);
  };

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setClientName(t.clientName);
    setClientRole(t.clientRole);
    setQuote(t.quote);
    setRating(t.rating);
    setAvatarUrl(t.avatarUrl || '');
    setFeatured(Boolean(t.featured));
    setPublished(t.published !== false);
    setOrder(t.order);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editingId || `test-${Date.now().toString(36)}`;
      await saveTestimonial(
        id,
        {
          clientName: clientName.trim(),
          clientRole: clientRole.trim(),
          quote: quote.trim(),
          rating: Number(rating) || 5,
          avatarUrl: avatarUrl.trim(),
          featured,
          published,
          order: Number(order) || 1,
        },
        !editingId
      );
      onNotify(editingId ? 'Testimonial updated.' : 'Client review added.');
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
          <h3 className="font-editorial text-2xl text-[#111111]">
            {editingId ? 'Edit Testimonial' : 'Add Client Testimonial'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#6E675E] hover:text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploaderField
            label="Client Portrait / Avatar"
            value={avatarUrl}
            maxDimension={800}
            folder="General"
            onChange={setAvatarUrl}
          />
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Commission / Role *
              </label>
              <input
                type="text"
                required
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Star Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Client Review Quote *
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span>Published</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
            >
              {saving ? 'Saving...' : editingId ? 'Save Review' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>

      <div className="xl:col-span-7 space-y-3">
        <div className="bg-white border border-[#E5DFD5] p-5">
          <h3 className="font-editorial text-2xl text-[#111111]">
            Client Testimonials ({testimonials.length})
          </h3>
        </div>

        {testimonials.map((t) => (
          <div
            key={t.id}
            className={`bg-white border p-4 flex items-start justify-between gap-4 ${
              t.published === false ? 'border-stone-300 opacity-70' : 'border-[#E5DFD5]'
            }`}
          >
            <div className="flex gap-4 min-w-0">
              {t.avatarUrl && (
                <img
                  src={t.avatarUrl}
                  alt={t.clientName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover bg-[#181715] shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#786651]">
                  <span className="font-mono">{t.rating}/5 ★</span>
                  {t.featured && <Star className="w-3 h-3 fill-[#786651]" />}
                  <span>· {t.published === false ? 'Hidden' : 'Published'}</span>
                </div>
                <h4 className="font-editorial text-xl text-[#111111]">{t.clientName}</h4>
                <p className="text-xs text-[#6E675E]">{t.clientRole}</p>
                <p className="text-xs text-[#3A3733] mt-1.5 italic line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  const { id, createdAt: _c, updatedAt: _u, ...rest } = t;
                  await saveTestimonial(id, { ...rest, published: t.published === false }, false);
                }}
                className="p-1.5 border border-[#DFD8CC] cursor-pointer"
              >
                {t.published === false ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => startEdit(t)}
                className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(t)}
                className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Testimonial"
        description={`Delete review from "${deleteTarget?.clientName || ''}"?`}
        confirmLabel="Delete Review"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteTestimonial(deleteTarget.id);
            setDeleteTarget(null);
            onNotify('Testimonial deleted.');
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
