'use client';

import { useState } from 'react';

interface ColorPickerModalProps {
  title: string;
  description?: string;
  initialColor: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (color: string) => Promise<void>;
  onCancel: () => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  title,
  description,
  initialColor,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm(selectedColor);
  };

  const handleCancel = () => {
    setSelectedColor(initialColor);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-elevated dark:shadow-elevated border border-purple-200 dark:border-purple-800/40 p-6 max-w-md mx-4 transition-all duration-200">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>

        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{description}</p>
        )}

        {/* Color Picker Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Color
          </label>

          {/* Color Input with Preview */}
          <div className="flex items-center gap-4">
            {/* Color Picker Input */}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              disabled={isLoading}
              className="h-20 w-20 rounded-md border-2 border-purple-300 dark:border-purple-700 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg disabled:cursor-not-allowed transition-all duration-200"
            />

            {/* Hex Value Input */}
            <div className="flex-1">
              <input
                type="text"
                value={selectedColor.toUpperCase()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(value) || value === '') {
                    setSelectedColor(value);
                  }
                }}
                disabled={isLoading}
                placeholder="#000000"
                maxLength={7}
                className="w-full rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hex format: #RRGGBB</p>
            </div>
          </div>
        </div>

        {/* Color Swatches for Quick Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Select
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[
              '#FF0000', // Red
              '#00FF00', // Green
              '#0000FF', // Blue
              '#FFFF00', // Yellow
              '#FF00FF', // Magenta
              '#00FFFF', // Cyan
              '#FFA500', // Orange
              '#800080', // Purple
              '#FFC0CB', // Pink
              '#A52A2A', // Brown
              '#808080', // Gray
              '#FFFFFF', // White
            ].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => !isLoading && setSelectedColor(color)}
                disabled={isLoading}
                className="h-8 w-8 rounded-md border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:scale-110 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
                style={{
                  backgroundColor: color,
                  borderColor: selectedColor === color ? '#9333EA' : undefined,
                  borderWidth: selectedColor === color ? '3px' : '2px',
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 rounded-md bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 py-2 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                Confirming...
              </span>
            ) : (
              'Confirm'
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
