'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
  Play,
  CheckCircle,
  Clock,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Course, Module, Lesson } from '@/types';

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
}

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  nextLessonId: string | null;
  lastWatchedLessonId: string | null;
  lessonProgress?: LessonProgress[];
}

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseSlug]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const courseResponse = await fetch(`/api/courses/${courseSlug}`);
      const courseData = await courseResponse.json();

      if (!courseData.success) {
        router.push('/courses');
        return;
      }

      setCourse(courseData.course);

      // Fetch modules
      const modulesResponse = await fetch(`/api/modules?courseId=${courseData.course.courseId}`);
      const modulesData = await modulesResponse.json();

      if (modulesData.success) {
        const sortedModules = modulesData.modules.sort(
          (a: Module, b: Module) => a.order - b.order
        );

        // Fetch lessons for each module
        const modulesWithLessons = await Promise.all(
          sortedModules.map(async (module: Module) => {
            const lessonsResponse = await fetch(`/api/lessons?moduleId=${module.moduleId}`);
            const lessonsData = await lessonsResponse.json();
            return {
              ...module,
              lessons:
                lessonsData.lessons?.sort(
                  (a: Lesson, b: Lesson) => a.order - b.order
                ) || [],
            };
          })
        );

        setModules(modulesWithLessons);
      }

      // Fetch progress
      const progressResponse = await fetch(
        `/api/progress/${courseData.course.courseId}`
      );
      const progressData = await progressResponse.json();

      if (progressData.success) {
        setProgress(progressData.courseProgress);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  // Find the first lesson to continue or start
  const firstLesson = modules[0]?.lessons[0];
  const continueLesson = progress?.lastWatchedLessonId || progress?.nextLessonId || firstLesson?.lessonId;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'My Courses', href: '/dashboard/my-courses' },
          { label: course.title },
        ]}
        className="container mx-auto px-4 pt-6"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>

          {/* Progress Bar */}
          {progress && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {progress.completedLessons} of {progress.totalLessons} lessons completed
                </span>
                <span className="text-sm font-medium">
                  {progress.completionPercentage}% complete
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Continue Button */}
          {continueLesson && (
            <Link href={`/learn/${courseSlug}/lesson/${continueLesson}`}>
              <Button size="lg">
                <Play className="h-5 w-5 mr-2" />
                {progress?.lastWatchedLessonId ? 'Continue Learning' : 'Start Learning'}
              </Button>
            </Link>
          )}
        </div>

        {/* Course Content */}
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card key={module.moduleId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Module {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  <Badge variant="secondary">
                    {module.lessons.length} lessons
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    // Check if lesson is completed
                    const lessonProgress = progress?.lessonProgress?.find(
                      (lp: any) => lp.lessonId === lesson.lessonId
                    );
                    const isCompleted = lessonProgress?.completed;

                    return (
                      <Link
                        key={lesson.lessonId}
                        href={`/learn/${courseSlug}/lesson/${lesson.lessonId}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>
                                {Math.floor(lesson.duration / 60)}m{' '}
                                {lesson.duration % 60}s
                              </span>
                              {lesson.isFreePreview && (
                                <Badge variant="outline" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {modules.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              No content available for this course yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
