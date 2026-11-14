import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { optimizeImageFile } from '../../lib/imageUtils';

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  maxDimension?: number;
  helperText?: string;
}

export function ImageUploaderField({
  label,
  value,
  onChange,
  maxDimension = 1600,
  helperText,
}: ImageUploaderFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setProcessing(true);
    try {
      const result = await optimizeImageFile(file, maxDimension);
      onChange(result.dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process image.');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] font-medium">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-28 h-24 shrink-0 bg-[#181715] border border-[#DFD8CC] overflow-hidden flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlus className="w-5 h-5 text-[#8A8277]" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{processing ? 'Optimizing...' : 'Upload Image'}</span>
            </button>

            <input
              type="url"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                value.startsWith('data:')
                  ? 'Uploaded image stored (or paste external URL to replace)'
                  : 'Or paste https:// image URL...'
              }
              className="flex-1 min-w-[200px] px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
            />
          </div>

          {helperText && <p className="text-[11px] text-[#6E675E]">{helperText}</p>}
          {error && <p className="text-xs text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
