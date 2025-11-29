/**
 * Image Upload Field Component
 * Reusable image upload component with drag/drop, preview, and validation
 */

'use client';

import { useState, useRef } from 'react';
import { validateImageFile, generateImagePreview, formatFileSize } from '@/lib/image_upload';

interface ImageUploadFieldProps {
  onFileSelect: (file: File) => void;
  initialImage?: string;
  offsetX?: number;
  offsetY?: number;
  onOffsetChange?: (offsetX: number, offsetY: number) => void;
  label?: string;
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  onFileSelect,
  initialImage,
  offsetX = 0,
  offsetY = 0,
  onOffsetChange,
  label = 'Character Image',
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [localOffsetX, setLocalOffsetX] = useState<number>(offsetX);
  const [localOffsetY, setLocalOffsetY] = useState<number>(offsetY);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      // Generate preview
      const previewUrl = await generateImagePreview(file);
      setPreview(previewUrl);
      setSelectedFile(file);
      onFileSelect(file);
    } catch (err) {
      setError('Failed to load image preview');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setLocalOffsetX(0);
    setLocalOffsetY(0);
    onOffsetChange?.(0, 0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Preview or drop zone */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-sky-300 dark:border-sky-700 shadow-lg transition-all duration-200"
            style={{
              objectPosition: `calc(50% + ${localOffsetX}%) calc(50% + ${localOffsetY}%)`
            }}
          />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5 text-sm font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:-translate-y-0.5 text-sm font-medium transition-all duration-200 border border-red-300 dark:border-red-700"
              >
                Remove
              </button>
            </div>
          )}
          {selectedFile && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}

          {/* Position Sliders */}
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Horizontal Position Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horizontal Position: {localOffsetX}%
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={localOffsetX}
                onChange={(e) => {
                  const newOffsetX = parseInt(e.target.value);
                  setLocalOffsetX(newOffsetX);
                  onOffsetChange?.(newOffsetX, localOffsetY);
                }}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Negative = move left, Positive = move right
              </div>
            </div>

            {/* Vertical Position Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vertical Position: {localOffsetY}%
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={localOffsetY}
                onChange={(e) => {
                  const newOffsetY = parseInt(e.target.value);
                  setLocalOffsetY(newOffsetY);
                  onOffsetChange?.(localOffsetX, newOffsetY);
                }}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Negative = move up, Positive = move down
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragging ? 'border-sky-500 dark:border-sky-600 bg-gradient-to-br from-sky-50 to-purple-50 dark:from-sky-900/20 dark:to-purple-900/20 backdrop-blur-sm shadow-lg' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-sky-400 dark:hover:border-sky-500 hover:bg-gradient-to-br hover:from-gray-100 hover:to-sky-50 dark:hover:from-gray-700 dark:hover:to-sky-900/20'}
          `}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
            <span className="font-medium text-sky-600 dark:text-sky-400">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG, or WEBP up to 5MB
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-3 shadow-lg transition-all duration-200">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};
