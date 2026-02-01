'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Lock, Play, Clock } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
}

interface ModuleWithLessons {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface CourseCurriculumProps {
  modules: ModuleWithLessons[];
  isPurchased: boolean;
  courseId: string;
}

export function CourseCurriculum({ modules, isPurchased, courseId }: CourseCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, module) => sum + module.lessons.reduce((s, lesson) => s + lesson.duration, 0),
    0
  );

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course curriculum</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{modules.length} modules</span>
          <span>{totalLessons} lessons</span>
          <span>{formatTotalDuration(totalDuration)} total</span>
        </div>
      </div>

      <div className="space-y-2">
        {modules.map((module) => (
          <div key={module.moduleId} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleModule(module.moduleId)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedModules.has(module.moduleId) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
            </button>

            {expandedModules.has(module.moduleId) && (
              <div className="border-t bg-gray-50">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="p-4 border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {lesson.isFreePreview || isPurchased ? (
                        <Play className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                        {lesson.duration > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {(lesson.isFreePreview || isPurchased) && (
                      <Link
                        href={`/learn/${courseId}/lesson/${lesson.lessonId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Watch
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
