'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Users, Star, Play } from 'lucide-react';

interface Course {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructorId: string;
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
}

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
}

export function CourseCard({ course, viewMode = 'grid' }: CourseCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/courses/${course.slug}`}>
          <div className="flex gap-4 p-4">
            {course.thumbnail ? (
              <div className="relative w-48 h-32 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-32 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {course.shortDescription || course.description}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[course.level]}`}>
                  {course.level}
                </span>
                {course.totalLessons > 0 && (
                  <span className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    {course.totalLessons} lessons
                  </span>
                )}
                {course.totalDuration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(course.totalDuration)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/courses/${course.slug}`}>
        {course.thumbnail ? (
          <div className="relative w-full h-48">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="p-4">
          <div className="mb-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${levelColors[course.level]}`}>
              {course.level}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            {course.totalLessons > 0 && (
              <span className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                {course.totalLessons}
              </span>
            )}
            {course.totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(course.totalDuration)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
            <Button size="sm">View Course</Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}
