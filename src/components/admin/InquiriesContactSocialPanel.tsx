import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import type { Inquiry, InquiryStatus, SiteSettings } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';

const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'confirmed',
  'completed',
  'archived',
];

export function InquiriesPanel({ onNotify }: { onNotify: (m: string) => void }) {
  const { inquiries, updateInquiry, deleteInquiry } = useStudio();

  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<InquiryStatus>('new');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.serviceName.toLowerCase().includes(q) ||
          inq.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [inquiries, statusFilter, search]);

  const openDetail = (inq: Inquiry) => {
    setSelected(inq);
    setStatusDraft(inq.status);
    setNotesDraft(inq.adminNotes || '');
  };

  const handleSaveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateInquiry(selected.id, statusDraft, notesDraft);
      setSelected(null);
      onNotify(`Inquiry from ${selected.name} updated.`);
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Event Date',
      'Service',
      'Location',
      'Status',
      'Message',
      'Admin Notes',
    ];
    const rows = filtered.map((i) =>
      [
        i.name,
        i.email,
        i.phone,
        i.eventDate,
        i.serviceName,
        i.location,
        i.status,
        i.message.replace(/"/g, '""'),
        (i.adminNotes || '').replace(/"/g, '""'),
      ]
        .map((v) => `"${v}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twins-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Inquiries CSV exported.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">Booking Inquiries &amp; CRM</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Review client shoot requests, update booking pipeline status, record studio notes, and
            export CSV records.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.11em] font-medium border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] cursor-pointer ${
              statusFilter === 'all' ? 'bg-[#111111] text-white' : 'bg-white border border-[#DFD8CC]'
            }`}
          >
            All ({inquiries.length})
          </button>
          {INQUIRY_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] cursor-pointer ${
                statusFilter === st ? 'bg-[#111111] text-white' : 'bg-white border border-[#DFD8CC]'
              }`}
            >
              {st} ({inquiries.filter((i) => i.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8A8277] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or location..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5DFD5] p-12 text-center">
          <p className="font-editorial text-2xl text-[#111111]">No matching booking inquiries</p>
          <p className="text-xs text-[#6E675E] mt-1">
            Client submissions from the contact form appear here in real time.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5DFD5] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE4D9] bg-[#FAF8F5] text-[11px] uppercase tracking-[0.12em] text-[#6E675E]">
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Service</th>
                <th className="py-3 px-4 font-medium">Event Date</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9] text-sm">
              {filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#FAF8F5]/70">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#111111]">{inq.name}</p>
                    <p className="text-xs text-[#6E675E]">{inq.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#3A3733]">{inq.serviceName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#3A3733]">
                    {inq.eventDate}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#4A4742]">{inq.location}</td>
                  <td className="py-3.5 px-4">
                    <select
                      aria-label={`Change status for ${inq.name}`}
                      value={inq.status}
                      onChange={(e) =>
                        void updateInquiry(
                          inq.id,
                          e.target.value as InquiryStatus,
                          inq.adminNotes || ''
                        )
                      }
                      className="px-2.5 py-1 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono uppercase"
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openDetail(inq)}
                      className="px-3 py-1.5 text-xs border border-[#DFD8CC] hover:border-[#111111] cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(inq)}
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
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#DFD8CC] max-w-xl w-full p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[#EAE4D9]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#786651]">
                  Booking Inquiry Detail
                </p>
                <h3 className="font-editorial text-2xl text-[#111111]">{selected.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[#6E675E] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-4 border border-[#EAE4D9]">
              <div>
                <span className="text-[#6E675E]">Email:</span>{' '}
                <a href={`mailto:${selected.email}`} className="underline">
                  {selected.email}
                </a>
              </div>
              <div>
                <span className="text-[#6E675E]">Phone:</span> {selected.phone}
              </div>
              <div>
                <span className="text-[#6E675E]">Service:</span> {selected.serviceName}
              </div>
              <div>
                <span className="text-[#6E675E]">Date:</span>{' '}
                <span className="font-mono">{selected.eventDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#6E675E]">Location:</span> {selected.location}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-[#6E675E] mb-1">
                Client Message
              </p>
              <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-3 border border-[#EAE4D9]">
                {selected.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Pipeline Status
                </label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as InquiryStatus)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs font-mono uppercase"
                >
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
                  Internal Studio Notes
                </label>
                <input
                  type="text"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Quote sent, location call scheduled..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE4D9]">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-xs uppercase tracking-[0.11em] border border-[#DFD8CC] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveDetail()}
                className="px-5 py-2 text-xs uppercase tracking-[0.11em] bg-[#111111] text-[#FAF8F5] cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Inquiry Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Inquiry"
        description={`Delete inquiry from "${deleteTarget?.name || ''}" permanently?`}
        confirmLabel="Delete Inquiry"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteInquiry(deleteTarget.id);
            setDeleteTarget(null);
            onNotify('Inquiry deleted.');
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function ContactSocialPanel({
  mode,
  onNotify,
  onDirtyChange,
}: {
  mode: 'contact' | 'social';
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
      onNotify(
        mode === 'contact' ? 'Studio contact & footer details saved.' : 'Social media channels saved.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">
            {mode === 'contact' ? 'Contact Information & Footer' : 'Social Media Management'}
          </h2>
          <p className="text-xs text-[#6E675E] mt-1">
            {mode === 'contact'
              ? 'Manage studio contact channels, WhatsApp concierge, Google Maps pin, and footer details.'
              : 'Configure official social profiles displayed in your Contact section and site footer.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {mode === 'contact' && (
        <div className="bg-white border border-[#E5DFD5] p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Business / Brand Name *
            </label>
            <input
              type="text"
              required
              value={form.brandName}
              onChange={(e) => update({ brandName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Contact Section Heading
            </label>
            <input
              type="text"
              value={form.contactHeading || ''}
              onChange={(e) => update({ contactHeading: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Contact Section Description
            </label>
            <textarea
              rows={2}
              value={form.contactDescription || ''}
              onChange={(e) => update({ contactDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              <Mail className="w-3.5 h-3.5" /> Studio Email *
            </label>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => update({ contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input
              type="text"
              value={form.contactPhone || ''}
              onChange={(e) => update({ contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Number
            </label>
            <input
              type="text"
              value={form.whatsappNumber || ''}
              onChange={(e) => update({ whatsappNumber: e.target.value })}
              placeholder="+39 340 555 0192"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              <MapPin className="w-3.5 h-3.5" /> Studio Address
            </label>
            <input
              type="text"
              value={form.studioAddress || ''}
              onChange={(e) => update({ studioAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={form.googleMapsUrl || ''}
              onChange={(e) => update({ googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
            />
          </div>
          <div className="md:col-span-2 pt-4 border-t border-[#EAE4D9]">
            <label className="block text-xs uppercase tracking-[0.1em] text-[#4A4742] mb-1">
              Footer Tagline
            </label>
            <input
              type="text"
              value={form.footerTagline || ''}
              onChange={(e) => update({ footerTagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
            />
          </div>
        </div>
      )}

      {mode === 'social' && (
        <div className="bg-white border border-[#E5DFD5] p-6 space-y-5">
          {[
            { key: 'instagramUrl', label: 'Instagram Profile URL', placeholder: 'https://instagram.com/twins' },
            { key: 'facebookUrl', label: 'Facebook Page URL', placeholder: 'https://facebook.com/twins' },
            { key: 'youtubeUrl', label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@twins' },
            { key: 'behanceUrl', label: 'Behance Portfolio URL', placeholder: 'https://behance.net/twins' },
            { key: 'pinterestUrl', label: 'Pinterest Board URL', placeholder: 'https://pinterest.com/twins' },
          ].map((item) => {
            const val = (form[item.key as keyof SiteSettings] as string) || '';
            return (
              <div key={item.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-xs uppercase tracking-[0.11em] text-[#4A4742] font-medium">
                  {item.label}
                </label>
                <div className="md:col-span-8">
                  <input
                    type="url"
                    value={val}
                    onChange={(e) => update({ [item.key]: e.target.value } as Partial<SiteSettings>)}
                    placeholder={item.placeholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] text-sm font-mono"
                  />
                </div>
                <div className="md:col-span-1 text-right">
                  {val && (
                    <a
                      href={val}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center p-2 border border-[#DFD8CC] text-[#4A4742] hover:text-[#111111]"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
}
