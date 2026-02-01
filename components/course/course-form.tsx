'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ImageUpload } from '@/components/upload/image-upload';
import { Card } from '@/components/ui/card';

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'USD',
    thumbnail: initialData?.thumbnail,
    category: initialData?.category || '',
    level: initialData?.level || 'beginner',
    status: initialData?.status || 'draft',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || formData.title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (!formData.shortDescription || formData.shortDescription.length < 10) {
      setError('Short description must be at least 10 characters');
      return;
    }

    if (formData.price < 0) {
      setError('Price must be positive');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    }
  };

  const handleImageUpload = (key: string, fileName: string, url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter course title"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
              }
              placeholder="Brief description (max 200 characters)"
              maxLength={200}
              rows={3}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {formData.shortDescription.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed course description"
              rows={6}
              required
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Course Details</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="e.g., Web Development"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  level: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'draft' | 'published' | 'archived',
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Course Thumbnail</h2>
        
        {formData.thumbnail && (
          <div className="mb-4">
            <img
              src={formData.thumbnail}
              alt="Course thumbnail"
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>
        )}

        <ImageUpload
          onUploadComplete={handleImageUpload}
          folder="THUMBNAILS"
          disabled={loading}
        />
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Course'}
        </Button>
      </div>
    </form>
  );
}
