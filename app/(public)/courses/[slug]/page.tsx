'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CourseHero } from '@/components/course/course-hero';
import { CourseSidebar } from '@/components/course/course-sidebar';
import { CourseOverview } from '@/components/course/course-overview';
import { CourseCurriculum } from '@/components/course/course-curriculum';
import { CourseReviews } from '@/components/course/course-reviews';
import { RelatedCourses } from '@/components/course/related-courses';
import { Breadcrumb } from '@/components/layout/breadcrumb';

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
  status: string;
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
  publishedAt?: string;
}

interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
}

interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchCourseData();
    checkAuthAndPurchase();
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      // Fetch course by slug
      const courseResponse = await fetch(`/api/courses/${slug}`);
      const courseData = await courseResponse.json();

      if (courseData.success) {
        setCourse(courseData.course);

        // Fetch modules
        const modulesResponse = await fetch(`/api/modules?courseId=${courseData.course.courseId}`);
        const modulesData = await modulesResponse.json();
        if (modulesData.modules) {
          setModules(modulesData.modules.sort((a: Module, b: Module) => a.order - b.order));
        }

        // Fetch lessons
        const lessonsResponse = await fetch(`/api/lessons?courseId=${courseData.course.courseId}`);
        const lessonsData = await lessonsResponse.json();
        if (lessonsData.lessons) {
          setLessons(lessonsData.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order));
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndPurchase = async () => {
    try {
      // Check if user is authenticated
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (sessionData.user) {
        setIsAuthenticated(true);
        
        // Check if course is purchased
        const purchasesResponse = await fetch('/api/user/purchases');
        const purchasesData = await purchasesResponse.json();
        
        if (purchasesData.success && course) {
          const purchased = purchasesData.purchases.some(
            (p: any) => p.courseId === course.courseId && p.status === 'completed'
          );
          setIsPurchased(purchased);
        }
      }
    } catch (error) {
      console.error('Error checking auth/purchase:', error);
    }
  };

  useEffect(() => {
    if (course) {
      checkAuthAndPurchase();
    }
  }, [course]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="text-gray-600">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Group lessons by module
  const lessonsByModule = modules.map((module) => ({
    ...module,
    lessons: lessons
      .filter((lesson) => lesson.moduleId === module.moduleId)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Courses', href: '/courses' },
          { label: course.title },
        ]}
        className="container mx-auto px-4 pt-6"
      />

      <CourseHero course={course} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CourseOverview course={course} />
            <CourseCurriculum
              modules={lessonsByModule}
              isPurchased={isPurchased}
              courseId={course.courseId}
            />
            <CourseReviews courseId={course.courseId} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CourseSidebar
              course={course}
              isPurchased={isPurchased}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-12">
          <RelatedCourses currentCourseId={course.courseId} category={course.category} />
        </div>
      </div>
    </div>
  );
}
