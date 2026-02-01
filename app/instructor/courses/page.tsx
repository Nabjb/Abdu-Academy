'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/layout/breadcrumb';

interface Course {
  courseId: string;
  title: string;
  thumbnail?: string;
  status: string;
  price: number;
  createdAt: string;
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Fetch all courses (including drafts) for instructor
      const response = await fetch('/api/courses?status=all');
      const data = await response.json();

      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Courses' },
        ]}
        className="mb-6"
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/instructor/courses/new">
          <Button>Create New Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mb-4 text-gray-600">You haven't created any courses yet</p>
          <Link href="/instructor/courses/new">
            <Button>Create Your First Course</Button>
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
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold">${course.price.toFixed(2)}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : course.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/instructor/courses/${course.courseId}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.courseId}`} className="flex-1">
                    <Button variant="ghost" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
