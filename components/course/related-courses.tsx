'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from './course-card';
import { Card } from '@/components/ui/card';

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

interface RelatedCoursesProps {
  currentCourseId: string;
  category: string;
}

export function RelatedCourses({ currentCourseId, category }: RelatedCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedCourses();
  }, [category, currentCourseId]);

  const fetchRelatedCourses = async () => {
    try {
      const response = await fetch(`/api/courses?category=${category}&status=published`);
      const data = await response.json();

      if (data.success) {
        // Filter out current course and limit to 3
        const related = data.courses
          .filter((c: Course) => c.courseId !== currentCourseId)
          .slice(0, 3);
        setCourses(related);
      }
    } catch (error) {
      console.error('Error fetching related courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || courses.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Related courses</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.courseId} course={course} />
        ))}
      </div>
    </div>
  );
}
