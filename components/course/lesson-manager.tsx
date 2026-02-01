'use client';

import { useState, useEffect } from 'react';
import { LessonForm } from './lesson-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical, Edit2, Trash2, Play, Lock } from 'lucide-react';

interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
  resources: Array<{ name: string; url: string; type: string }>;
  createdAt: string;
}

interface LessonManagerProps {
  moduleId: string;
  courseId: string;
  onLessonsChange: () => void;
}

export function LessonManager({ moduleId, courseId, onLessonsChange }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, [moduleId]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/lessons?moduleId=${moduleId}`);
      const data = await response.json();

      if (data.lessons) {
        // Sort by order
        const sorted = data.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order);
        setLessons(sorted);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (data: any) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          courseId,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      setShowAddLesson(false);
      fetchLessons();
      onLessonsChange();
    } catch (error: any) {
      alert(error.message || 'Failed to create lesson');
    }
  };

  const handleUpdateLesson = async (lessonId: string, data: any) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lesson');
      }

      setEditingLesson(null);
      fetchLessons();
      onLessonsChange();
    } catch (error: any) {
      alert(error.message || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lesson');
      }

      fetchLessons();
      onLessonsChange();
    } catch (error: any) {
      alert(error.message || 'Failed to delete lesson');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading lessons...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Lessons</h3>
        {!showAddLesson && (
          <Button onClick={() => setShowAddLesson(true)} size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Add Lesson
          </Button>
        )}
      </div>

      {showAddLesson && (
        <Card className="p-4">
          <LessonForm
            onSubmit={handleAddLesson}
            onCancel={() => setShowAddLesson(false)}
          />
        </Card>
      )}

      {lessons.length === 0 && !showAddLesson ? (
        <div className="text-sm text-gray-500 text-center py-4">
          No lessons yet. Add your first lesson to this module.
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Card key={lesson.lessonId} className="p-3">
              {editingLesson === lesson.lessonId ? (
                <LessonForm
                  initialData={lesson}
                  onSubmit={(data) => handleUpdateLesson(lesson.lessonId, data)}
                  onCancel={() => setEditingLesson(null)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {lesson.videoUrl ? (
                        <Play className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium text-sm">{lesson.title}</span>
                      {lesson.isFreePreview && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Free Preview
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {lesson.duration > 0 && <span>{formatDuration(lesson.duration)}</span>}
                      {lesson.resources && lesson.resources.length > 0 && (
                        <span>{lesson.resources.length} resource(s)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLesson(lesson.lessonId)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.lessonId)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
