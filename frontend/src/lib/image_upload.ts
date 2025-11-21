/**
 * Image Upload Helper for Character Images
 * Handles file validation, preview generation, and upload to R2 via backend
 */

import apiClient from './api';

interface UploadImageResponse {
  url: string;
  r2_key: string;
}

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
};

/**
 * Generate a preview URL for an image file
 */
export const generateImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to generate preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Upload character image to backend (which uploads to R2)
 * The backend endpoint expects multipart/form-data with the character update
 */
export const uploadCharacterImage = async (
  campaignId: string,
  characterId: string,
  file: File
): Promise<UploadImageResponse> => {
  // Validate file first
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', file);

    // Upload via character update endpoint
    const response = await apiClient.patch(
      `/characters/${characterId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Extract image URL and key from response
    const { image_url, image_r2_key } = response.data;

    if (!image_url) {
      throw new Error('Upload succeeded but no image URL returned');
    }

    return {
      url: image_url,
      r2_key: image_r2_key || '',
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
