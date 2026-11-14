import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { isVideoUrl, optimizeImageFile } from '../../lib/imageUtils';
import type { InquiryStatus, SiteSettings } from '../../types/studio';
import { ImageUploaderField } from './ImageUploaderField';

export function InquiriesManager() {
  const { inquiries, updateInquiry, deleteInquiry } = useStudio();
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered =
    statusFilter === 'all' ? inquiries : inquiries.filter((i) => i.status === statusFilter);

  const handleSaveInquiry = async (id: string, status: InquiryStatus) => {
    setSavingId(id);
    try {
      const existing = inquiries.find((i) => i.id === id);
      const notes = notesDraft[id] ?? existing?.adminNotes ?? '';
      await updateInquiry(id, status, notes);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5DFD5]">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">Booking Inquiries</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Review incoming client commissions, update booking status, and record studio notes.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', 'new', 'reviewed', 'booked', 'archived'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111111] text-[#FAF8F5]'
                  : 'bg-[#FAF8F5] text-[#4A4742] border border-[#DFD8CC]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center border border-[#E5DFD5] bg-[#FAF8F5]">
          <p className="font-editorial text-2xl text-[#111111]">No booking inquiries in this view.</p>
          <p className="text-xs text-[#6E675E] mt-1">
            Client submissions from the Contact &amp; Booking form appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((inq) => (
            <article key={inq.id} className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#786651]">
                    <span className="uppercase tracking-[0.14em] font-semibold text-[#111111]">
                      Status: {inq.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{inq.serviceName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Event: {inq.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inq.location}</span>
                  </div>
                  <h3 className="mt-1.5 font-editorial text-2xl text-[#111111]">{inq.name}</h3>
                  <p className="text-xs text-[#4A4742] mt-0.5">
                    {inq.email} · {inq.phone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={inq.status}
                    aria-label={`Change status for ${inq.name}`}
                    disabled={savingId === inq.id}
                    onChange={(e) =>
                      void handleSaveInquiry(inq.id, e.target.value as InquiryStatus)
                    }
                    className="px-3 py-2 bg-white border border-[#DFD8CC] text-xs uppercase tracking-[0.08em]"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="booked">Booked</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => void deleteInquiry(inq.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#3A3733] bg-white border border-[#E5DFD5] p-4">
                {inq.message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={1000}
                  value={notesDraft[inq.id] ?? inq.adminNotes ?? ''}
                  onChange={(e) =>
                    setNotesDraft((prev) => ({ ...prev, [inq.id]: e.target.value }))
                  }
                  placeholder="Private studio notes (quote sent, call scheduled, etc.)"
                  className="flex-1 px-3.5 py-2 bg-white border border-[#DFD8CC] text-xs"
                />
                <button
                  type="button"
                  disabled={savingId === inq.id}
                  onClick={() => void handleSaveInquiry(inq.id, inq.status)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.12em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {savingId === inq.id ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function StudioSettingsManager() {
  const {
    siteSettings,
    saveSiteSettings,
    adminUsers,
    addAdminUser,
    removeAdminUser,
  } = useStudio();

  const [draft, setDraft] = useState<Omit<SiteSettings, 'id' | 'updatedAt'>>(() => {
    const { id: _i, updatedAt: _u, ...rest } = siteSettings;
    return rest;
  });
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Admin access form
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  useEffect(() => {
    const { id: _i, updatedAt: _u, ...rest } = siteSettings;
    setDraft(rest);
  }, [siteSettings]);

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (draft.heroBanners.length >= 6) {
      setFeedback('Maximum 6 hero banners allowed.');
      return;
    }
    try {
      const res = await optimizeImageFile(file, 1800);
      setDraft((prev) => ({
        ...prev,
        heroBanners: [...prev.heroBanners, res.dataUrl],
      }));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to upload banner.');
    }
    e.target.value = '';
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    setBusy(true);
    try {
      await saveSiteSettings(draft);
      setFeedback('All studio branding, hero, about, contact, and SEO settings saved live.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to save studio settings.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFeedback('');
    if (!newAdminUid.trim() || !newAdminEmail.trim()) {
      setAdminFeedback('Both Firebase UID and email are required.');
      return;
    }
    try {
      await addAdminUser(newAdminUid, newAdminEmail, newAdminName);
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
      setAdminFeedback('Admin user added.');
    } catch (err) {
      setAdminFeedback(err instanceof Error ? err.message : 'Failed to add admin.');
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSaveSettings} className="space-y-10">
        {/* Branding & Hero */}
        <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-[#E5DFD5]">
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Brand Identity &amp; Hero Banners
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Update website logo, studio wordmark, hero copy, and homepage slideshow imagery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Brand Name *
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={draft.brandName}
                onChange={(e) => setDraft({ ...draft, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Hero Headline *
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={draft.heroHeadline}
                onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Hero Subheadline *
            </label>
            <input
              type="text"
              required
              maxLength={280}
              value={draft.heroSubheadline}
              onChange={(e) => setDraft({ ...draft, heroSubheadline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <ImageUploaderField
            label="Website Logo Mark (Optional)"
            value={draft.logoUrl || ''}
            onChange={(url) => setDraft({ ...draft, logoUrl: url })}
            maxDimension={600}
            helperText="Displayed beside the wordmark in the sticky navigation bar."
          />

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[#4A4742] font-medium">
                Hero Slideshow Banners ({draft.heroBanners.length} / 6)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3.5 py-2 text-xs uppercase tracking-[0.1em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer">
                  + Upload Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBanner}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  placeholder="Or paste image or .mp4 video URL..."
                  className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs w-56"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (bannerUrlInput.trim() && draft.heroBanners.length < 6) {
                      setDraft((prev) => ({
                        ...prev,
                        heroBanners: [...prev.heroBanners, bannerUrlInput.trim()],
                      }));
                      setBannerUrlInput('');
                    }
                  }}
                  className="px-3 py-2 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {draft.heroBanners.map((url, idx) => (
                <div key={`${url.slice(0, 20)}-${idx}`} className="relative aspect-[16/9] bg-[#181715]">
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Hero banner ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        heroBanners: prev.heroBanners.filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove hero banner"
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/75 text-white hover:bg-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Content */}
        <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-[#E5DFD5]">
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">About Us Content</h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Edit the studio story, philosophy, founders&apos; portrait, and photographer bios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Section Eyebrow
              </label>
              <input
                type="text"
                maxLength={80}
                value={draft.aboutEyebrow || ''}
                onChange={(e) => setDraft({ ...draft, aboutEyebrow: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                About Heading *
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={draft.aboutHeading}
                onChange={(e) => setDraft({ ...draft, aboutHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Brand Story *
            </label>
            <textarea
              rows={3}
              required
              maxLength={3000}
              value={draft.aboutStory}
              onChange={(e) => setDraft({ ...draft, aboutStory: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Photography Philosophy
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={draft.aboutPhilosophy || ''}
              onChange={(e) => setDraft({ ...draft, aboutPhilosophy: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Photographers / Founders Title
              </label>
              <input
                type="text"
                maxLength={120}
                value={draft.photographerNames || ''}
                onChange={(e) => setDraft({ ...draft, photographerNames: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Photographers Bio
              </label>
              <input
                type="text"
                maxLength={1500}
                value={draft.photographerBio || ''}
                onChange={(e) => setDraft({ ...draft, photographerBio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
          </div>

          <ImageUploaderField
            label="Studio / Photographers Portrait"
            value={draft.aboutImageUrl || ''}
            onChange={(url) => setDraft({ ...draft, aboutImageUrl: url })}
          />
        </section>

        {/* Contact, Socials & SEO */}
        <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-[#E5DFD5]">
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
              Contact Information, Social Links &amp; SEO
            </h2>
            <p className="text-xs text-[#6E675E] mt-1">
              Manage public studio contact channels, social URLs, and live search engine metadata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Contact Email *
              </label>
              <input
                type="email"
                required
                maxLength={160}
                value={draft.contactEmail}
                onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                maxLength={60}
                value={draft.contactPhone || ''}
                onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Studio Address
              </label>
              <input
                type="text"
                maxLength={240}
                value={draft.studioAddress || ''}
                onChange={(e) => setDraft({ ...draft, studioAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                maxLength={300}
                value={draft.instagramUrl || ''}
                onChange={(e) => setDraft({ ...draft, instagramUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Behance URL
              </label>
              <input
                type="url"
                maxLength={300}
                value={draft.behanceUrl || ''}
                onChange={(e) => setDraft({ ...draft, behanceUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                Pinterest URL
              </label>
              <input
                type="url"
                maxLength={300}
                value={draft.pinterestUrl || ''}
                onChange={(e) => setDraft({ ...draft, pinterestUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5DFD5] space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                SEO Page Title *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={draft.seoTitle}
                onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
                SEO Meta Description *
              </label>
              <textarea
                rows={2}
                required
                maxLength={320}
                value={draft.seoDescription}
                onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <ImageUploaderField
              label="SEO OpenGraph Share Image"
              value={draft.seoOgImage || ''}
              onChange={(url) => setDraft({ ...draft, seoOgImage: url })}
            />
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-end gap-4">
            {feedback && <span className="text-xs text-[#5E4E3B]">{feedback}</span>}
            <button
              type="submit"
              disabled={busy}
              className="px-7 py-3 text-xs uppercase tracking-[0.14em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Saving Changes...' : 'Save All Studio Settings'}
            </button>
          </div>
        </section>
      </form>

      {/* Admin Access Control */}
      <section className="bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-5">
        <div className="pb-4 border-b border-[#E5DFD5]">
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
            Authorized Studio Administrators
          </h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Grant additional verified team members admin access using their Firebase User UID.
          </p>
        </div>

        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Firebase UID *
            </label>
            <input
              type="text"
              required
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-4 text-xs uppercase tracking-[0.12em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
          >
            Authorize Admin
          </button>
        </form>

        {adminFeedback && <p className="text-xs text-[#5E4E3B]">{adminFeedback}</p>}

        {adminUsers.length > 0 && (
          <div className="divide-y divide-[#E5DFD5]">
            {adminUsers.map((adm) => (
              <div key={adm.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#111111]">
                    {adm.displayName || adm.email}
                  </p>
                  <p className="text-xs font-mono text-[#6E675E]">
                    {adm.email} · UID: {adm.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeAdminUser(adm.id)}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
