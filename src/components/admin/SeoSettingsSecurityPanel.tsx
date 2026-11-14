import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Globe,
  KeyRound,
  Save,
  Shield,
  Trash2,
  Upload,
  UserPlus,
} from 'lucide-react';
import { useStudio, type BackupSnapshot } from '../../context/StudioContext';
import { slugify } from '../../lib/imageUtils';
import type { AdminRole, FontPreset, SiteSettings } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';
import { ImageUploaderField } from './ImageUploaderField';

export function SeoManagerPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { siteSettings, pages, saveSiteSettings, savePage } = useStudio();
  const [targetId, setTargetId] = useState<'global' | string>('global');

  const [seoTitle, setSeoTitle] = useState(siteSettings.seoTitle);
  const [seoDescription, setSeoDescription] = useState(siteSettings.seoDescription);
  const [seoKeywords, setSeoKeywords] = useState(siteSettings.seoKeywords || '');
  const [slug, setSlug] = useState('');
  const [ogTitle, setOgTitle] = useState(siteSettings.seoOgTitle || '');
  const [ogDescription, setOgDescription] = useState(siteSettings.seoOgDescription || '');
  const [ogImage, setOgImage] = useState(siteSettings.seoOgImage || '');
  const [canonicalUrl, setCanonicalUrl] = useState(siteSettings.seoCanonicalUrl || '');
  const [noIndex, setNoIndex] = useState(Boolean(siteSettings.seoNoIndex));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (targetId === 'global') {
      setSeoTitle(siteSettings.seoTitle);
      setSeoDescription(siteSettings.seoDescription);
      setSeoKeywords(siteSettings.seoKeywords || '');
      setSlug('');
      setOgTitle(siteSettings.seoOgTitle || '');
      setOgDescription(siteSettings.seoOgDescription || '');
      setOgImage(siteSettings.seoOgImage || '');
      setCanonicalUrl(siteSettings.seoCanonicalUrl || '');
      setNoIndex(Boolean(siteSettings.seoNoIndex));
    } else {
      const pg = pages.find((p) => p.id === targetId);
      if (pg) {
        setSeoTitle(pg.seoTitle || pg.title);
        setSeoDescription(pg.seoDescription || '');
        setSeoKeywords(pg.seoKeywords || '');
        setSlug(pg.slug);
        setOgTitle(pg.ogTitle || pg.seoTitle || pg.title);
        setOgDescription(pg.ogDescription || pg.seoDescription || '');
        setOgImage(pg.ogImage || '');
        setCanonicalUrl(pg.canonicalUrl || '');
        setNoIndex(Boolean(pg.noIndex));
      }
    }
  }, [targetId, siteSettings, pages]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (targetId === 'global') {
        const { id: _id, updatedAt: _u, ...rest } = siteSettings;
        await saveSiteSettings({
          ...rest,
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          seoOgTitle: ogTitle.trim(),
          seoOgDescription: ogDescription.trim(),
          seoOgImage: ogImage.trim(),
          seoCanonicalUrl: canonicalUrl.trim(),
          seoNoIndex: noIndex,
        });
        onNotify('Global Homepage SEO metadata updated.');
      } else {
        const pg = pages.find((p) => p.id === targetId);
        if (pg) {
          const { id, createdAt: _c, updatedAt: _u, ...rest } = pg;
          await savePage(
            id,
            {
              ...rest,
              slug: slugify(slug) || pg.slug,
              seoTitle: seoTitle.trim(),
              seoDescription: seoDescription.trim(),
              seoKeywords: seoKeywords.trim(),
              ogTitle: ogTitle.trim(),
              ogDescription: ogDescription.trim(),
              ogImage: ogImage.trim(),
              canonicalUrl: canonicalUrl.trim(),
              noIndex,
            },
            false
          );
          onNotify(`SEO metadata updated for "${pg.title}".`);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">SEO &amp; OpenGraph Management</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Control search titles, meta descriptions, keywords, social share previews, canonical URLs,
            and indexing rules per page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Select page for SEO editing"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-medium"
          >
            <option value="global">Homepage / Global SEO</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                Page: {p.title} (/p/{p.slug})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save SEO'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={targetId === 'global' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                SEO Title ({seoTitle.length}/120)
              </label>
              <input
                type="text"
                required
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            {targetId !== 'global' && (
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Page URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Meta Description ({seoDescription.length}/320)
            </label>
            <textarea
              rows={3}
              required={targetId === 'global'}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Meta Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div className="pt-3 border-t border-[#EAE4D9] space-y-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#786651] font-medium">
              OpenGraph &amp; Search Indexing
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  OG Share Title
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Canonical URL (Optional)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://twins-studio.com/..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                OG Share Description
              </label>
              <input
                type="text"
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>

            <ImageUploaderField
              label="OpenGraph Social Share Image"
              value={ogImage}
              folder="Branding"
              onChange={setOgImage}
            />

            <label className="inline-flex items-center gap-2 text-xs text-[#4A4742] cursor-pointer">
              <input
                type="checkbox"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
              />
              <span>No-Index (Prevent search engines from indexing this route)</span>
            </label>
          </div>
        </div>

        {/* Live Search Snippet & Social Card Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E5DFD5] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#786651]">
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Preview</span>
            </div>
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE4D9] space-y-1">
              <p className="text-xs text-[#4A4742] font-mono truncate">
                {canonicalUrl || `https://twins-studio.com${targetId === 'global' ? '/' : `/p/${slug}`}`}
              </p>
              <p className="text-base font-medium text-[#1A0DAB] leading-snug">
                {seoTitle || siteSettings.brandName}
              </p>
              <p className="text-xs text-[#4D5156] leading-relaxed line-clamp-2">
                {seoDescription || 'Configure your meta description for search snippets.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5DFD5] p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#786651]">
              Social Share Card Preview
            </p>
            <div className="border border-[#DFD8CC] overflow-hidden bg-[#FAF8F5]">
              {ogImage ? (
                <img
                  src={ogImage}
                  alt="OG share preview"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/9] object-cover"
                />
              ) : (
                <div className="w-full aspect-[16/9] bg-[#181715] flex items-center justify-center text-xs text-[#8A8277]">
                  No OG Image Selected
                </div>
              )}
              <div className="p-3.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#6E675E]">
                  TWINS-STUDIO.COM
                </p>
                <p className="font-medium text-sm text-[#111111] mt-0.5">
                  {ogTitle || seoTitle}
                </p>
                <p className="text-xs text-[#57534E] line-clamp-2 mt-0.5">
                  {ogDescription || seoDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export function WebsiteSettingsPanel({
  onNotify,
  onDirtyChange,
}: {
  onNotify: (m: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { siteSettings, saveSiteSettings } = useStudio();
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(siteSettings);
    onDirtyChange?.(false);
  }, [siteSettings, onDirtyChange]);

  const update = (patch: Partial<SiteSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    onDirtyChange?.(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id: _id, updatedAt: _u, ...payload } = form;
      await saveSiteSettings(payload);
      onDirtyChange?.(false);
      onNotify('Website appearance & global settings saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">Website Settings &amp; Branding</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Configure logo, favicon, brand palette, typography style, loading veil, maintenance
            mode, and custom script snippets.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#E5DFD5] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Website Brand Name *
            </label>
            <input
              type="text"
              required
              value={form.brandName}
              onChange={(e) => update({ brandName: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Typography Preset
            </label>
            <select
              value={form.fontPreset || 'editorial-serif'}
              onChange={(e) => update({ fontPreset: e.target.value as FontPreset })}
              className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            >
              <option value="editorial-serif">Editorial Serif + Modern Sans (Default)</option>
              <option value="modern-sans">Clean Contemporary Sans</option>
              <option value="classic-monograph">Classic Monograph Tracking</option>
            </select>
          </div>

          <ImageUploaderField
            label="Website Logo"
            value={form.logoUrl || ''}
            maxDimension={800}
            folder="Branding"
            onChange={(url) => update({ logoUrl: url })}
          />

          <ImageUploaderField
            label="Browser Favicon"
            value={form.faviconUrl || ''}
            maxDimension={256}
            folder="Branding"
            onChange={(url) => update({ faviconUrl: url })}
          />

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Primary Color Token
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor || '#111111'}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="w-10 h-10 border border-[#DFD8CC] cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor || '#111111'}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Warm Accent Color Token
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.secondaryColor || '#D4C3AA'}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="w-10 h-10 border border-[#DFD8CC] cursor-pointer"
              />
              <input
                type="text"
                value={form.secondaryColor || '#D4C3AA'}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Loading Screen & Maintenance Mode */}
        <div className="pt-5 border-t border-[#EAE4D9] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#FAF8F5] border border-[#EAE4D9] space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs uppercase tracking-[0.11em] font-medium text-[#111111]">
                Editorial Loading Veil
              </span>
              <input
                type="checkbox"
                checked={Boolean(form.loadingScreenEnabled)}
                onChange={(e) => update({ loadingScreenEnabled: e.target.checked })}
              />
            </label>
            <input
              type="text"
              value={form.loadingScreenText || ''}
              onChange={(e) => update({ loadingScreenText: e.target.value })}
              placeholder="TWINS · Visual Storytelling Atelier"
              className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-xs"
            />
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#EAE4D9] space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs uppercase tracking-[0.11em] font-medium text-red-800">
                Maintenance Mode (Hide Public Site)
              </span>
              <input
                type="checkbox"
                checked={Boolean(form.maintenanceMode)}
                onChange={(e) => update({ maintenanceMode: e.target.checked })}
              />
            </label>
            <textarea
              rows={2}
              value={form.maintenanceMessage || ''}
              onChange={(e) => update({ maintenanceMessage: e.target.value })}
              placeholder="Message shown to visitors while maintenance mode is active..."
              className="w-full px-3 py-2 bg-white border border-[#DFD8CC] text-xs"
            />
          </div>
        </div>

        {/* Copyright & Custom Script */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#EAE4D9]">
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={form.copyrightText || ''}
              onChange={(e) => update({ copyrightText: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Custom Analytics / Verification Script Note
            </label>
            <input
              type="text"
              value={form.customHeadScript || ''}
              onChange={(e) => update({ customHeadScript: e.target.value })}
              placeholder="Google Analytics ID / Verification tag"
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export function AdminUsersPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const {
    user,
    currentAdminRole,
    adminUsers,
    addAdminUser,
    updateAdminUserRole,
    removeAdminUser,
    sendAdminPasswordReset,
  } = useStudio();

  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [saving, setSaving] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; email: string } | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addAdminUser(uid, email, displayName, role);
      setUid('');
      setEmail('');
      setDisplayName('');
      setRole('editor');
      onNotify(`Granted ${role} access to ${email}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">
            Admin Users &amp; Role Permissions
          </h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Active session: <span className="font-mono text-[#111111]">{user?.email}</span> · Role:{' '}
            <span className="font-mono uppercase text-[#786651]">{currentAdminRole}</span>
          </p>
        </div>

        {user?.email && (
          <button
            type="button"
            onClick={async () => {
              try {
                await sendAdminPasswordReset(user.email!);
                onNotify(`Password reset / recovery link sent to ${user.email}.`);
              } catch {
                onNotify('Google Sign-In accounts manage credentials via Google Workspace.');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.11em] border border-[#111111] text-[#111111] hover:bg-[#F3EFE8] cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Send Recovery Email</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 space-y-4">
          <h3 className="font-editorial text-2xl text-[#111111] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#786651]" />
            <span>Authorize New Admin</span>
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Firebase User UID *
              </label>
              <input
                type="text"
                required
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Paste Firebase Auth UID"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Role Level
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="editor">Content Editor</option>
                  <option value="moderator">Inquiry Moderator</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] cursor-pointer"
            >
              {saving ? 'Granting...' : 'Grant Admin Access'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE4D9]">
            <Shield className="w-4 h-4 text-[#786651]" />
            <h3 className="font-editorial text-2xl text-[#111111]">Authorized Studio Team</h3>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] border border-[#EAE4D9] flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111111]">rituparno.tnts@gmail.com</p>
              <p className="text-[11px] font-mono text-[#786651]">Owner · Bootstrapped Super Admin</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#111111] text-[#FAF8F5]">
              Super Admin
            </span>
          </div>

          {adminUsers.map((adm) => (
            <div
              key={adm.id}
              className="p-3.5 border border-[#EAE4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium text-[#111111]">
                  {adm.displayName || adm.email}
                </p>
                <p className="text-xs font-mono text-[#6E675E]">
                  {adm.email} · UID: {adm.id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={adm.role || 'editor'}
                  onChange={(e) =>
                    void updateAdminUserRole(adm.id, e.target.value as AdminRole).then(() =>
                      onNotify(`Updated role for ${adm.email}.`)
                    )
                  }
                  className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono"
                >
                  <option value="super_admin">super_admin</option>
                  <option value="editor">editor</option>
                  <option value="moderator">moderator</option>
                </select>
                <button
                  type="button"
                  onClick={() => setRevokeTarget({ id: adm.id, email: adm.email })}
                  className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(revokeTarget)}
        title="Revoke Admin Access"
        description={`Remove CMS access for "${revokeTarget?.email || ''}"?`}
        confirmLabel="Revoke Access"
        loading={revoking}
        onConfirm={async () => {
          if (!revokeTarget) return;
          setRevoking(true);
          try {
            await removeAdminUser(revokeTarget.id);
            setRevokeTarget(null);
            onNotify('Admin access revoked.');
          } finally {
            setRevoking(false);
          }
        }}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}

export function BackupRestorePanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { createBackupSnapshot, restoreBackupSnapshot } = useStudio();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingSnapshot, setPendingSnapshot] = useState<BackupSnapshot | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownloadBackup = () => {
    const snap = createBackupSnapshot();
    const json = JSON.stringify(snap, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twins-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Complete studio JSON backup downloaded.');
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupSnapshot;
      if (!parsed.siteSettings || !parsed.categories) {
        throw new Error('Invalid TWINS Studio backup file format.');
      }
      setPendingSnapshot(parsed);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to parse backup JSON.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-6">
        <h2 className="font-editorial text-2xl text-[#111111]">Backup &amp; Restore</h2>
        <p className="text-xs text-[#6E675E] mt-1">
          Export a complete JSON snapshot of all website settings, pages, galleries, projects,
          services, testimonials, and media assets—or restore from a previous archive.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-800">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5DFD5] p-6 flex flex-col justify-between gap-5">
          <div>
            <h3 className="font-editorial text-2xl text-[#111111]">Export Studio Snapshot</h3>
            <p className="text-xs text-[#4A4742] mt-2 leading-relaxed">
              Downloads a structured <code>.json</code> archive containing all studio configuration
              and published/draft collections.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Backup (.json)</span>
          </button>
        </div>

        <div className="bg-white border border-[#E5DFD5] p-6 flex flex-col justify-between gap-5">
          <div>
            <h3 className="font-editorial text-2xl text-[#111111]">Restore From Archive</h3>
            <p className="text-xs text-[#4A4742] mt-2 leading-relaxed">
              Select a previously exported TWINS backup file. A confirmation dialog will review the
              snapshot before writing to Firestore.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFilePick}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.12em] font-medium border border-[#111111] text-[#111111] hover:bg-[#F3EFE8] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select Backup JSON File</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingSnapshot)}
        title="Restore Studio Backup"
        description={`Restore studio state exported on ${
          pendingSnapshot?.exportedAt?.slice(0, 10) || 'unknown date'
        }? This overwrites existing settings and matching document IDs in Firestore.`}
        confirmLabel="Restore Snapshot"
        danger={false}
        loading={restoring}
        onConfirm={async () => {
          if (!pendingSnapshot) return;
          setRestoring(true);
          try {
            await restoreBackupSnapshot(pendingSnapshot);
            setPendingSnapshot(null);
            onNotify('Studio database restored from backup snapshot.');
          } finally {
            setRestoring(false);
          }
        }}
        onCancel={() => setPendingSnapshot(null)}
      />
    </div>
  );
}
