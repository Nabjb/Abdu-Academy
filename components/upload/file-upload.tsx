'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept,
  maxSize,
  disabled = false,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        // Simulate progress (in real implementation, you'd track actual upload progress)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await onUpload(file);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          setProgress(0);
          setUploading(false);
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setUploading(false);
        setProgress(0);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: disabled || uploading,
    multiple: false,
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          {uploading ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h-12m-4-4h.01"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                {maxSize && `Max size: ${(maxSize / 1024 / 1024).toFixed(0)} MB`}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
