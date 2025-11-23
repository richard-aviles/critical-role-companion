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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4 text-sm">{description}</p>
        )}

        {/* Color Picker Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              className="h-20 w-20 rounded-md border-2 border-gray-300 cursor-pointer hover:border-blue-500 disabled:cursor-not-allowed"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Hex format: #RRGGBB</p>
            </div>
          </div>
        </div>

        {/* Color Swatches for Quick Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="h-8 w-8 rounded-md border-2 border-gray-300 hover:border-blue-500 disabled:cursor-not-allowed transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: selectedColor === color ? '#3B82F6' : '#D1D5DB',
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
            className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">◌</span>
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
            className="flex-1 rounded-md border border-gray-300 py-2 text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
