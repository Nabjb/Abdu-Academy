'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ModuleManager } from '@/components/course/module-manager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

interface Course {
  courseId: string;
  title: string;
}

export default function CurriculumPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    fetchModules();
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
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      const data = await response.json();

      if (data.modules) {
        // Sort by order
        const sorted = data.modules.sort((a: Module, b: Module) => a.order - b.order);
        setModules(sorted);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModulesChange = () => {
    fetchModules();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    );
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
          { label: course.title, href: `/instructor/courses/${courseId}/edit` },
          { label: 'Curriculum' },
        ]}
        className="mb-6"
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Curriculum</h1>
          <p className="text-gray-600 mt-1">Manage modules and lessons for {course.title}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/instructor/courses/${courseId}/edit`)}
        >
          Back to Course Settings
        </Button>
      </div>

      <Card className="p-6">
        <ModuleManager
          courseId={courseId}
          modules={modules}
          onModulesChange={handleModulesChange}
        />
      </Card>
    </div>
  );
}
