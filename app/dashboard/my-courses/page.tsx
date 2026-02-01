'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Course {
  courseId: string;
  title: string;
  thumbnail?: string;
  progress?: number;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // This will be implemented when we have the purchases API working
      // For now, we'll show a placeholder
      const response = await fetch('/api/user/purchases');
      const data = await response.json();

      if (data.success) {
        // TODO: Fetch course details for each purchase
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">Loading...</div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mb-4 text-gray-600">You haven't purchased any courses yet</p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.courseId} className="overflow-hidden">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="mb-2 font-semibold">{course.title}</h3>
                {course.progress !== undefined && (
                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Link href={`/learn/${course.courseId}`}>
                  <Button className="w-full">Continue Learning</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
