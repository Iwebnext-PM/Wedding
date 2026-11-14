import { BLUEPRINT_LIMITS } from '../types/studio';

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url.trim()) || url.startsWith('data:video/');
}

export function toSlug(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(0, 80) || 'item';
}

export const slugify = toSlug;

export function toSafeId(prefix: string, label: string): string {
  const base = `${prefix}-${toSlug(label)}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base.slice(0, 60)}-${suffix}`;
}

/**
 * Optimizes an uploaded File into a high-clarity WebP/JPEG data URL under Firestore's 900KB limit
 * so uploaded photography renders instantly and reliably across sessions without external CORS issues.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  initialQuality = 0.84
): Promise<{ dataUrl: string; width: number; height: number; byteEstimate: number; sizeBytes: number }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (JPEG, PNG, or WebP).');
  }

  const imageBitmap = await loadImageFromFile(file);
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to initialize image processor.');
  }

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  let quality = initialQuality;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  while (dataUrl.length > BLUEPRINT_LIMITS.MAX_IMAGE_CHARS && quality > 0.35) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > BLUEPRINT_LIMITS.MAX_IMAGE_CHARS) {
    // Downscale further if still above limit
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = Math.round(targetWidth * 0.65);
    smallCanvas.height = Math.round(targetHeight * 0.65);
    const smallCtx = smallCanvas.getContext('2d');
    if (smallCtx) {
      smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
      dataUrl = smallCanvas.toDataURL('image/jpeg', 0.72);
    }
  }

  if (dataUrl.length > BLUEPRINT_LIMITS.MAX_IMAGE_CHARS) {
    throw new Error('Image exceeds maximum compressed size. Please choose a smaller file.');
  }

  const est = Math.round((dataUrl.length * 3) / 4);
  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    byteEstimate: est,
    sizeBytes: est,
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
