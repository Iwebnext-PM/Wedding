import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Film,
  Folder,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { isVideoUrl, optimizeImageFile } from '../../lib/imageUtils';
import type { MediaAsset } from '../../types/studio';
import { ConfirmModal } from './ConfirmModal';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'External';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaLibraryManagerProps {
  onSelectUrl?: (url: string) => void;
  onNotify?: (message: string) => void;
}

export function MediaLibraryManager({ onSelectUrl, onNotify }: MediaLibraryManagerProps) {
  const { mediaAssets, saveMediaAsset, deleteMediaAsset } = useStudio();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploading, setUploading] = useState(false);

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newUrlName, setNewUrlName] = useState('');
  const [newUrlValue, setNewUrlValue] = useState('');
  const [newUrlFolder, setNewUrlFolder] = useState('Banners');

  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [editName, setEditName] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const folders = useMemo(() => {
    const set = new Set<string>(['General', 'Banners', 'Weddings', 'Fashion', 'Branding']);
    mediaAssets.forEach((a) => {
      if (a.folder) set.add(a.folder);
    });
    return Array.from(set);
  }, [mediaAssets]);

  const filteredAssets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      if (typeFilter !== 'all' && asset.mediaType !== typeFilter) return false;
      if (folderFilter !== 'all' && asset.folder !== folderFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          asset.name.toLowerCase().includes(q) ||
          asset.folder.toLowerCase().includes(q) ||
          (asset.altText || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [mediaAssets, typeFilter, folderFilter, search]);

  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setErrorMsg('');

    try {
      for (const file of files) {
        const optimized = await optimizeImageFile(file, 1800);
        const assetId = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await saveMediaAsset(
          assetId,
          {
            name: file.name.slice(0, 140),
            url: optimized.dataUrl,
            mediaType: 'image',
            folder: uploadFolder.trim() || 'General',
            altText: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 180),
            width: optimized.width,
            height: optimized.height,
            sizeBytes: optimized.sizeBytes,
          },
          true
        );
      }
      onNotify?.(`Uploaded ${files.length} image asset(s) to Media Library.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload selected files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRegisterUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrlValue.trim() || !newUrlName.trim()) return;
    setErrorMsg('');
    try {
      const id = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const mediaType = isVideoUrl(newUrlValue.trim()) ? 'video' : 'image';
      await saveMediaAsset(
        id,
        {
          name: newUrlName.trim().slice(0, 140),
          url: newUrlValue.trim(),
          mediaType,
          folder: newUrlFolder.trim() || 'General',
          altText: newUrlName.trim().slice(0, 180),
        },
        true
      );
      setNewUrlName('');
      setNewUrlValue('');
      setShowUrlModal(false);
      onNotify?.('External media URL added to Media Library.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save media asset.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    await saveMediaAsset(
      editingAsset.id,
      {
        name: editName.trim() || editingAsset.name,
        url: editingAsset.url,
        mediaType: editingAsset.mediaType,
        folder: editFolder.trim() || 'General',
        altText: editAlt.trim(),
        width: editingAsset.width,
        height: editingAsset.height,
        sizeBytes: editingAsset.sizeBytes,
      },
      false
    );
    setEditingAsset(null);
    onNotify?.('Media asset details updated.');
  };

  const handleCopyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      onNotify?.('Copy failed — please select URL manually.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMediaAsset(deleteTarget.id);
      setDeleteTarget(null);
      onNotify?.('Media asset deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E5DFD5] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl text-[#111111]">Studio Media Library</h2>
          <p className="text-xs text-[#6E675E] mt-1">
            Central repository for studio photography, campaign videos, avatars, and brand assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Target upload folder"
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs text-[#111111]"
          >
            {folders.map((f) => (
              <option key={f} value={f}>
                Folder: {f}
              </option>
            ))}
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultiFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.11em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Optimizing...' : 'Upload Images'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlModal((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.11em] font-medium border border-[#111111] text-[#111111] hover:bg-[#F3EFE8] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Video / URL</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800">{errorMsg}</div>
      )}

      {/* Add External Media URL Drawer */}
      {showUrlModal && (
        <form
          onSubmit={handleRegisterUrl}
          className="bg-white border border-[#C8B69E] p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
              Asset Title *
            </label>
            <input
              type="text"
              required
              value={newUrlName}
              onChange={(e) => setNewUrlName(e.target.value)}
              placeholder="Autumn Reel.mp4"
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#6E675E] mb-1">
              Image or Video HTTPS URL *
            </label>
            <input
              type="url"
              required
              value={newUrlValue}
              onChange={(e) => setNewUrlValue(e.target.value)}
              placeholder="https://.../video.mp4"
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newUrlFolder}
              onChange={(e) => setNewUrlFolder(e.target.value)}
              placeholder="Folder"
              className="w-24 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs uppercase tracking-[0.11em] bg-[#111111] text-[#FAF8F5] cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8A8277] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by filename, folder, or alt text..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] text-xs focus:border-[#111111] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'image', 'video'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] cursor-pointer ${
                typeFilter === t
                  ? 'bg-[#111111] text-[#FAF8F5]'
                  : 'bg-white border border-[#DFD8CC] text-[#4A4742]'
              }`}
            >
              {t}
            </button>
          ))}

          <select
            aria-label="Filter by folder"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#DFD8CC] text-xs text-[#4A4742]"
          >
            <option value="all">All Folders ({mediaAssets.length})</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white border border-[#E5DFD5] p-12 text-center">
          <ImageIcon className="w-8 h-8 text-[#B8B0A4] mx-auto mb-3" />
          <p className="font-editorial text-2xl text-[#111111]">No matching media assets</p>
          <p className="text-xs text-[#6E675E] mt-1">
            Upload new photographs or register a studio video URL above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white border border-[#E5DFD5] flex flex-col justify-between">
              <div>
                <div className="aspect-[4/3] bg-[#181715] relative overflow-hidden">
                  {asset.mediaType === 'video' || isVideoUrl(asset.url) ? (
                    <video
                      src={asset.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-black/75 text-[#FAF8F5] text-[10px] font-mono uppercase">
                    {asset.mediaType === 'video' ? (
                      <Film className="w-3 h-3 text-[#D4C3AA]" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-[#D4C3AA]" />
                    )}
                    {asset.mediaType}
                  </span>
                </div>

                <div className="p-3.5">
                  <p className="text-xs font-medium text-[#111111] truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#6E675E] font-mono tabular-nums">
                    <span className="inline-flex items-center gap-1 font-sans">
                      <Folder className="w-3 h-3" />
                      {asset.folder}
                    </span>
                    <span>
                      {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ''}
                      {formatBytes(asset.sizeBytes)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-3.5 pb-3.5 pt-2 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                {onSelectUrl ? (
                  <button
                    type="button"
                    onClick={() => onSelectUrl(asset.url)}
                    className="flex-1 py-1.5 text-xs uppercase tracking-[0.1em] bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] cursor-pointer"
                  >
                    Use Asset
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAsset(asset);
                      setEditName(asset.name);
                      setEditFolder(asset.folder);
                      setEditAlt(asset.altText || '');
                    }}
                    className="text-xs text-[#4A4742] hover:text-[#111111] underline cursor-pointer"
                  >
                    Edit Info
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleCopyUrl(asset)}
                    title="Copy asset URL"
                    className="p-1.5 border border-[#DFD8CC] text-[#4A4742] hover:border-[#111111] cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    title="Delete asset"
                    className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveEdit}
            className="bg-white border border-[#DFD8CC] max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-2xl">Edit Media Details</h3>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="text-[#6E675E] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                Filename / Title
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                Folder
              </label>
              <input
                type="text"
                required
                value={editFolder}
                onChange={(e) => setEditFolder(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.11em] text-[#4A4742] mb-1">
                SEO Alt Text
              </label>
              <input
                type="text"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-sm"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="px-4 py-2 text-xs uppercase tracking-[0.11em] border border-[#DFD8CC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs uppercase tracking-[0.11em] bg-[#111111] text-[#FAF8F5] cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Media Asset"
        description={`Remove "${deleteTarget?.name || ''}" from the Media Library? Existing pages referencing its URL directly will keep their URL until changed.`}
        confirmLabel="Delete Asset"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select media from library"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] w-full max-w-5xl max-h-[88vh] flex flex-col">
        <div className="px-6 py-4 bg-[#0A0A0A] text-[#FAF8F5] flex items-center justify-between">
          <span className="font-editorial text-xl tracking-wide">Choose From Media Library</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="text-[#B8B0A4] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <MediaLibraryManager
            onSelectUrl={(url) => {
              onSelect(url);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
