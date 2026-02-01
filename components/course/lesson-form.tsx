'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { VideoUpload } from '@/components/upload/video-upload';

interface LessonFormProps {
  initialData?: {
    title: string;
    description: string;
    videoUrl?: string;
    duration: number;
    isFreePreview: boolean;
    resources: Array<{ name: string; url: string; type: string }>;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    videoUrl?: string;
    duration: number;
    isFreePreview: boolean;
    resources: Array<{ name: string; url: string; type: string }>;
  }) => void;
  onCancel: () => void;
}

export function LessonForm({ initialData, onSubmit, onCancel }: LessonFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [duration, setDuration] = useState(initialData?.duration || 0);
  const [isFreePreview, setIsFreePreview] = useState(initialData?.isFreePreview || false);
  const [resources, setResources] = useState(initialData?.resources || []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleVideoUploadComplete = async (key: string, fileName: string) => {
    setUploading(true);
    try {
      // Get signed URL for the uploaded video
      const response = await fetch(`/api/files/${key}`);
      if (!response.ok) {
        throw new Error('Failed to get video URL');
      }
      const data = await response.json();
      setVideoUrl(data.url);
      
      // Try to get video duration (you might want to implement this server-side)
      // For now, we'll use a placeholder
      if (!duration) {
        setDuration(0); // You can implement duration extraction later
      }
    } catch (error: any) {
      alert(error.message || 'Failed to get video URL');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl || undefined,
        duration,
        isFreePreview,
        resources,
      });
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Lesson Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Introduction to Components"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description for this lesson"
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <Label>Video</Label>
        {videoUrl ? (
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Video uploaded</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVideoUrl('')}
                disabled={loading || uploading}
              >
                Remove
              </Button>
            </div>
            <video src={videoUrl} controls className="mt-2 w-full max-w-md rounded" />
          </div>
        ) : (
          <div className="mt-2">
            <VideoUpload
              onUploadComplete={handleVideoUploadComplete}
              disabled={loading || uploading}
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-2">Uploading video...</p>
            )}
          </div>
        )}
      </div>

      {videoUrl && (
        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            placeholder="0"
            disabled={loading}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isFreePreview"
          checked={isFreePreview}
          onCheckedChange={(checked) => setIsFreePreview(checked === true)}
          disabled={loading}
        />
        <Label htmlFor="isFreePreview" className="cursor-pointer">
          Free Preview (students can watch without purchasing)
        </Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading || uploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {initialData ? 'Update' : 'Create'} Lesson
        </Button>
      </div>
    </form>
  );
}
