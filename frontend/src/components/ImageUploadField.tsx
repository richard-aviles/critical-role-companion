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
  label?: string;
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  onFileSelect,
  initialImage,
  label = 'Character Image',
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
          />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-md shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-medium transition-colors"
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
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
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
            <span className="font-medium text-purple-600 dark:text-purple-400">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG, or WEBP up to 5MB
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
