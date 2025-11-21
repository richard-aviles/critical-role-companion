/**
 * Confirmation Dialog Component
 * Used for confirming delete actions
 */

'use client';

import { useState } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  itemName: string;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  itemName,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) {
    return null;
  }

  const isNameMatched = inputValue === itemName;

  const handleConfirm = async () => {
    await onConfirm();
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">{message}</p>

        {/* Type Name to Confirm */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            Type <span className="font-bold text-red-600">"{itemName}"</span> to confirm deletion:
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Type the campaign name..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!isNameMatched || isLoading}
            className="flex-1 rounded-md bg-red-600 py-2 text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">◌</span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
          <button
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
