'use client';

import { Clock, Play, Users, Award } from 'lucide-react';

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
}

interface CourseHeroProps {
  course: Course;
}

export function CourseHero({ course }: CourseHeroProps) {
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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Info */}
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelColors[course.level]}`}>
                {course.level}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-700 mb-6">{course.shortDescription || course.description}</p>
            
            {/* Course Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {course.totalLessons > 0 && (
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              )}
              {course.totalDuration > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Certificate of Completion</span>
              </div>
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="flex items-center justify-center">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full max-w-lg rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full max-w-lg h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <Play className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
