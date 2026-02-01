'use client';

import { useState, useCallback } from 'react';
import { FileUpload } from './file-upload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QueuedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  key?: string;
  error?: string;
}

interface UploadQueueProps {
  onUploadComplete: (files: Array<{ key: string; fileName: string }>) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
}

export function UploadQueue({
  onUploadComplete,
  accept,
  maxSize,
  maxFiles = 10,
  disabled,
}: UploadQueueProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const addToQueue = useCallback(async (file: File) => {
    if (queue.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const queuedFile: QueuedFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    };

    setQueue((prev) => [...prev, queuedFile]);
  }, [queue.length, maxFiles]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadFile = useCallback(async (queuedFile: QueuedFile) => {
    const formData = new FormData();
    formData.append('file', queuedFile.file);

    // Determine endpoint based on file type
    let endpoint = '/api/upload/image';
    if (queuedFile.file.type.startsWith('video/')) {
      endpoint = '/api/upload/video';
    } else if (queuedFile.file.type === 'application/pdf' || queuedFile.file.type.includes('zip')) {
      endpoint = '/api/upload/resource';
    }

    setQueue((prev) =>
      prev.map((item) =>
        item.id === queuedFile.id
          ? { ...item, status: 'uploading' as const, progress: 0 }
          : item
      )
    );

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === queuedFile.id
              ? { ...item, progress: Math.min(item.progress + 10, 90) }
              : item
          )
        );
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setQueue((prev) =>
        prev.map((item) =>
          item.id === queuedFile.id
            ? {
                ...item,
                status: 'completed' as const,
                progress: 100,
                key: data.key,
              }
            : item
        )
      );
    } catch (error: any) {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queuedFile.id
            ? {
                ...item,
                status: 'error' as const,
                error: error.message,
              }
            : item
        )
      );
    }
  }, []);

  const uploadAll = useCallback(async () => {
    setUploading(true);
    const pendingFiles = queue.filter((item) => item.status === 'pending');

    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    setUploading(false);

    // Notify parent of completed uploads
    const completed = queue
      .filter((item) => item.status === 'completed' && item.key)
      .map((item) => ({
        key: item.key!,
        fileName: item.file.name,
      }));

    if (completed.length > 0) {
      onUploadComplete(completed);
    }
  }, [queue, uploadFile, onUploadComplete]);

  const completedCount = queue.filter((item) => item.status === 'completed').length;
  const hasPending = queue.some((item) => item.status === 'pending');

  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={addToQueue}
        accept={accept}
        maxSize={maxSize}
        disabled={disabled || uploading}
      />

      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Queue ({completedCount}/{queue.length} completed)
            </h3>
            {hasPending && (
              <Button
                onClick={uploadAll}
                disabled={uploading}
                size="sm"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'rounded-lg border p-3',
                  item.status === 'completed' && 'border-green-200 bg-green-50',
                  item.status === 'error' && 'border-red-200 bg-red-50',
                  item.status === 'uploading' && 'border-blue-200 bg-blue-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromQueue(item.id)}
                    disabled={item.status === 'uploading'}
                  >
                    ×
                  </Button>
                </div>

                {item.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === 'error' && (
                  <p className="mt-2 text-xs text-red-600">{item.error}</p>
                )}

                {item.status === 'completed' && (
                  <p className="mt-2 text-xs text-green-600">✓ Uploaded successfully</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
