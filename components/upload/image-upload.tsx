'use client';

import { useState } from 'react';
import { FileUpload } from './file-upload';
import { MAX_FILE_SIZES } from '@/lib/r2/validation';

interface ImageUploadProps {
  onUploadComplete: (key: string, fileName: string, url: string) => void;
  folder?: 'IMAGES' | 'THUMBNAILS';
  disabled?: boolean;
}

export function ImageUpload({
  onUploadComplete,
  folder = 'IMAGES',
  disabled,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.key, data.fileName, data.url);
    } catch (error: any) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const maxSize = folder === 'THUMBNAILS' ? MAX_FILE_SIZES.THUMBNAIL : MAX_FILE_SIZES.IMAGE;

  return (
    <FileUpload
      onUpload={handleUpload}
      accept={{
        'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      }}
      maxSize={maxSize}
      disabled={disabled || uploading}
    />
  );
}
