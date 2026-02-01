'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CourseForm } from '@/components/course/course-form';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setSaving(true);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update course');
      }

      // Refresh course data
      await fetchCourse();
      router.refresh();
    } catch (error: any) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!course) {
    return <div className="text-center">Course not found</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Courses', href: '/instructor/courses' },
          { label: course.title },
        ]}
        className="mb-6"
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/instructor/courses/${courseId}/curriculum`)}
        >
          Manage Curriculum
        </Button>
      </div>

      <CourseForm
        initialData={course}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/instructor/courses')}
        loading={saving}
      />
    </div>
  );
}
