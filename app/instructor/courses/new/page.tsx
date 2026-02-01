'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/course/course-form';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create course');
      }

      // Redirect to course edit page
      router.push(`/instructor/courses/${result.course.courseId}/edit`);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Courses', href: '/instructor/courses' },
          { label: 'New Course' },
        ]}
        className="mb-6"
      />

      <h1 className="mb-6 text-2xl font-bold">Create New Course</h1>

      <CourseForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
