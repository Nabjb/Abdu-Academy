'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ModuleFormProps {
  initialData?: {
    title: string;
    description: string;
  };
  onSubmit: (data: { title: string; description: string }) => void;
  onCancel: () => void;
}

export function ModuleForm({ initialData, onSubmit, onCancel }: ModuleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Module Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Introduction to React"
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
          placeholder="Optional description for this module"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {initialData ? 'Update' : 'Create'} Module
        </Button>
      </div>
    </form>
  );
}
