'use client';

import { useState, useRef } from 'react';
import { validateImageFile, generateImagePreview, formatFileSize } from '@/lib/image_upload';
import { uploadLayoutBackgroundImage } from '@/lib/api';

interface ImageSettingsPanelProps {
  widthPercent: number;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  backgroundImageUrl?: string;
  backgroundImageOffsetX?: number;
  backgroundImageOffsetY?: number;
  campaignId?: string;
  layoutId?: string;
  onWidthChange: (width: number) => void;
  onAspectRatioChange: (ratio: 'square' | 'portrait' | 'landscape') => void;
  onBackgroundImageChange: (data: { url?: string; offset_x?: number; offset_y?: number }) => void;
}

export default function ImageSettingsPanel({
  widthPercent,
  aspectRatio,
  backgroundImageUrl,
  backgroundImageOffsetX = 0,
  backgroundImageOffsetY = 0,
  campaignId,
  layoutId,
  onWidthChange,
  onAspectRatioChange,
  onBackgroundImageChange,
}: ImageSettingsPanelProps) {
  console.log('[ImageSettingsPanel] Rendering:', { campaignId, layoutId, backgroundImageUrl });

  const [preview, setPreview] = useState<string | null>(backgroundImageUrl || null);
  const [offsetX, setOffsetX] = useState<number>(backgroundImageOffsetX);
  const [offsetY, setOffsetY] = useState<number>(backgroundImageOffsetY);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    console.log('[ImageSettingsPanel.handleFileSelect] File selected:', {
      fileName: file.name,
      fileSize: file.size,
      campaignId,
      layoutId,
      hasLayoutId: !!layoutId,
    });

    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsUploading(true);

      // If we have campaign and layout IDs, upload to server
      if (campaignId && layoutId) {
        console.log('[ImageSettingsPanel.handleFileSelect] Uploading to server');
        const result = await uploadLayoutBackgroundImage(campaignId, layoutId, file);
        setPreview(result.url);
        setSelectedFile(file);
        onBackgroundImageChange({ url: result.url, offset_x: offsetX, offset_y: offsetY });
      } else {
        console.log('[ImageSettingsPanel.handleFileSelect] Using local preview (no layoutId yet)');
        // Fallback: just generate local preview
        const previewUrl = await generateImagePreview(file);
        setPreview(previewUrl);
        setSelectedFile(file);
        onBackgroundImageChange({ url: previewUrl, offset_x: offsetX, offset_y: offsetY });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload image';
      console.error('[ImageSettingsPanel.handleFileSelect] Error:', { errorMsg, err });
      setError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ImageSettingsPanel.handleInputChange] Input changed');
    const file = e.target.files?.[0];
    console.log('[ImageSettingsPanel.handleInputChange] File:', file?.name);
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    console.log('[ImageSettingsPanel.handleDragOver] Dragging over');
    e.preventDefault();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    console.log('[ImageSettingsPanel.handleDragLeave] Drag leave');
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('[ImageSettingsPanel.handleDrop] Drop detected');
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const file = e.dataTransfer.files[0];
    console.log('[ImageSettingsPanel.handleDrop] File:', file?.name);
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    console.log('[ImageSettingsPanel.handleClick] Click detected, isUploading:', isUploading);
    if (!isUploading) {
      console.log('[ImageSettingsPanel.handleClick] Triggering file input click');
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setOffsetX(0);
    setOffsetY(0);
    onBackgroundImageChange({ url: undefined, offset_x: 0, offset_y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  console.log('[ImageSettingsPanel] Rendering upload section:', { preview, isUploading });

  return (
    <div className="space-y-6">
      {/* Image Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Character Image Width: {widthPercent}%
        </label>
        <input
          type="range"
          min="25"
          max="40"
          value={widthPercent}
          onChange={(e) => onWidthChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Percentage of card width (25-40% recommended)
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aspect Ratio</label>
        <div className="space-y-2">
          {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
            <label key={ratio} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="aspectRatio"
                value={ratio}
                checked={aspectRatio === ratio}
                onChange={() => onAspectRatioChange(ratio)}
                className="w-4 h-4 text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{ratio}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Image Position Sliders - Only show when preview exists */}
      {preview && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Horizontal Position Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horizontal Position: {offsetX}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={offsetX}
              onChange={(e) => {
                const newOffsetX = parseInt(e.target.value);
                setOffsetX(newOffsetX);
                onBackgroundImageChange({ url: preview || undefined, offset_x: newOffsetX, offset_y: offsetY });
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
              disabled={isUploading}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Negative = move left, Positive = move right
            </div>
          </div>

          {/* Vertical Position Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vertical Position: {offsetY}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={offsetY}
              onChange={(e) => {
                const newOffsetY = parseInt(e.target.value);
                setOffsetY(newOffsetY);
                onBackgroundImageChange({ url: preview || undefined, offset_x: offsetX, offset_y: newOffsetY });
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
              disabled={isUploading}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Negative = move up, Positive = move down
            </div>
          </div>
        </div>
      )}

      {/* Background Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Background Image (Optional)
        </label>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          disabled={isUploading}
          className="hidden"
          aria-label="Upload background image file"
        />

        {/* Preview or drop zone */}
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-40 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={preview}
                alt="Background preview"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `calc(50% + ${offsetX}%) calc(50% + ${offsetY}%)`
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-white text-xs font-medium">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
            {!isUploading && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-md shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600"
                  aria-label="Change background image"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-md shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 border border-red-300 dark:border-red-700"
                  aria-label="Remove background image"
                >
                  Delete
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
            role="button"
            tabIndex={isUploading ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
            aria-label="Drop background image here or click to upload"
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
              ${isDragging ? 'border-purple-500 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm shadow-lg' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-gray-100 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-purple-900/20'}
            `}
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

        {/* Error message */}
        {error && (
          <div className="mt-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-3 shadow-lg transition-all duration-200">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Background image for enhanced card layouts
        </div>
      </div>
    </div>
  );
}
