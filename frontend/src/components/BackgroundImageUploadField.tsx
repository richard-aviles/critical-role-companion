'use client';
import { useState, useRef } from 'react';
import { validateImageFile, generateImagePreview, formatFileSize } from '@/lib/image_upload';

interface BackgroundImageUploadFieldProps {
  imageUrl?: string;
  onImageChange: (url: string | undefined) => void;
  onFileSelect: (file: File | null) => void;
  onLoading: (loading: boolean) => void;
  disabled?: boolean;
}

export const BackgroundImageUploadField: React.FC<BackgroundImageUploadFieldProps> = ({
  imageUrl,
  onImageChange,
  onFileSelect,
  onLoading,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(!!imageUrl);
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileSelect = async (file: File) => {
    setError(null);
    onLoading(true);
    setIsLoading(true);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onLoading(false);
      setIsLoading(false);
      return;
    }

    try {
      const previewUrl = await generateImagePreview(file);
      setPreview(previewUrl);
      setFileName(file.name);
      setFileSize(file.size);
      onImageChange(previewUrl);
      onFileSelect(file);
    } catch (err) {
      setError('Failed to load image preview');
    } finally {
      onLoading(false);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (!isLoading && enabled) {
        setDragActive(true);
      }
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isLoading || !enabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    onImageChange(undefined);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value);
    if (!value) {
      handleRemove();
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="background-image-enabled"
          checked={enabled}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900"
        />
        <label
          htmlFor="background-image-enabled"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Use custom background image
        </label>
      </div>

      {enabled && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            disabled={isLoading || disabled}
            className="hidden"
            aria-label="Upload background image file"
          />

          {preview ? (
            <div className="relative">
              <div className="relative w-full h-40 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-white text-xs font-medium">Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
              {!isLoading && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-md shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Change background image"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    className="px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-md shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 border border-red-300 dark:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove background image"
                  >
                    Delete
                  </button>
                </div>
              )}
              {fileName && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {fileName} ({fileSize !== null ? formatFileSize(fileSize) : ''})
                </p>
              )}
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isLoading && !disabled && fileInputRef.current?.click()}
              role="button"
              tabIndex={isLoading || disabled ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isLoading && !disabled) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Drop background image here or click to upload"
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-purple-500 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
              } ${
                isLoading || disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-gray-100 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-purple-900/20'
              }`}
            >
              <svg
                className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium text-purple-600 dark:text-purple-400">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, WEBP, or GIF up to 5MB
              </p>
            </div>
          )}

          {error && (
            <div className="mt-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-3 shadow-lg transition-all duration-200">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Background image for character cards (displays in enhanced layout)
          </div>
        </div>
      )}
    </div>
  );
};
