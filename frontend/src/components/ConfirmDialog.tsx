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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-elevated dark:shadow-elevated border border-red-200 dark:border-red-800/40 p-6 max-w-md mx-4 transition-all duration-200">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

        {/* Type Name to Confirm */}
        <div className="bg-red-50 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-700 rounded-md p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="font-bold text-red-600 dark:text-red-400">"{itemName}"</span> to confirm deletion:
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-red-300 dark:border-red-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all duration-200"
            placeholder="Type the campaign name..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!isNameMatched || isLoading}
            className="flex-1 rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 py-2 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
