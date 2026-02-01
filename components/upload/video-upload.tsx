'use client';

import { useState } from 'react';
import { FileUpload } from './file-upload';
import { MAX_FILE_SIZES } from '@/lib/r2/validation';

interface VideoUploadProps {
  onUploadComplete: (key: string, fileName: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ onUploadComplete, disabled }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.key, data.fileName);
    } catch (error: any) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      accept={{
        'video/*': ['.mp4', '.webm', '.mov', '.avi'],
      }}
      maxSize={MAX_FILE_SIZES.VIDEO}
      disabled={disabled || uploading}
    />
  );
}
