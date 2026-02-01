'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video/video-player';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ChevronLeft, ChevronRight, Download, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
  resources: Array<{ name: string; url: string; type: string }>;
}

interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  courseId: string;
  title: string;
  slug: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId, courseSlug]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson
      const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
      const lessonData = await lessonResponse.json();

      if (!lessonData.lesson) {
        throw new Error('Lesson not found');
      }

      setLesson(lessonData.lesson);

      // Fetch course
      const courseResponse = await fetch(`/api/courses/${courseSlug}`);
      const courseData = await courseResponse.json();

      if (courseData.success) {
        setCourse(courseData.course);
      }

      // Fetch modules and lessons
      const modulesResponse = await fetch(`/api/modules?courseId=${lessonData.lesson.courseId}`);
      const modulesData = await modulesResponse.json();

      if (modulesData.modules) {
        const sortedModules = modulesData.modules.sort((a: Module, b: Module) => a.order - b.order);
        
        // Fetch lessons for each module
        const modulesWithLessons = await Promise.all(
          sortedModules.map(async (module: Module) => {
            const lessonsResponse = await fetch(`/api/lessons?moduleId=${module.moduleId}`);
            const lessonsData = await lessonsResponse.json();
            return {
              ...module,
              lessons: lessonsData.lessons?.sort((a: Lesson, b: Lesson) => a.order - b.order) || [],
            };
          })
        );

        setModules(modulesWithLessons);

        // Find current lesson position and next/prev
        let found = false;
        for (let mIdx = 0; mIdx < modulesWithLessons.length; mIdx++) {
          const module = modulesWithLessons[mIdx];
          for (let lIdx = 0; lIdx < module.lessons.length; lIdx++) {
            if (module.lessons[lIdx].lessonId === lessonId) {
              setCurrentLessonIndex({ moduleIndex: mIdx, lessonIndex: lIdx });
              
              // Find next lesson
              if (lIdx < module.lessons.length - 1) {
                setNextLesson(module.lessons[lIdx + 1]);
              } else if (mIdx < modulesWithLessons.length - 1) {
                // Next module's first lesson
                const nextModule = modulesWithLessons[mIdx + 1];
                if (nextModule.lessons.length > 0) {
                  setNextLesson(nextModule.lessons[0]);
                }
              }

              // Find previous lesson
              if (lIdx > 0) {
                setPrevLesson(module.lessons[lIdx - 1]);
              } else if (mIdx > 0) {
                // Previous module's last lesson
                const prevModule = modulesWithLessons[mIdx - 1];
                if (prevModule.lessons.length > 0) {
                  setPrevLesson(prevModule.lessons[prevModule.lessons.length - 1]);
                }
              }

              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      // Fetch video URL
      if (lessonData.lesson.videoUrl) {
        const videoResponse = await fetch(`/api/lessons/${lessonId}/video`);
        const videoData = await videoResponse.json();
        
        if (videoData.success) {
          setVideoUrl(videoData.videoUrl);
        }
      }

      // Fetch progress
      const progressResponse = await fetch(`/api/progress?courseId=${lessonData.lesson.courseId}&lessonId=${lessonId}`);
      const progressData = await progressResponse.json();

      if (progressData.success && progressData.progress.length > 0) {
        const progress = progressData.progress[0];
        setWatchedSeconds(progress.watchedSeconds || 0);
        setCompleted(progress.completed || false);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (seconds: number) => {
    if (!lesson) return;

    setWatchedSeconds(seconds);

    // Update progress every 5 seconds (handled by video player)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: lesson.courseId,
          lessonId: lesson.lessonId,
          watchedSeconds: seconds,
          completed: seconds >= lesson.duration * 0.8, // 80% watched = completed
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleComplete = async () => {
    if (!lesson) return;

    setCompleted(true);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: lesson.courseId,
          lessonId: lesson.lessonId,
          watchedSeconds: lesson.duration,
          completed: true,
        }),
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Courses', href: '/courses' },
          { label: course.title, href: `/courses/${courseSlug}` },
          { label: lesson.title },
        ]}
        className="container mx-auto px-4 pt-6"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                {completed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Player */}
            {videoUrl ? (
              <div className="mb-6">
                <VideoPlayer
                  src={videoUrl}
                  lessonId={lessonId}
                  courseId={lesson.courseId}
                  onProgressUpdate={handleProgressUpdate}
                  initialProgress={watchedSeconds}
                  onComplete={handleComplete}
                />
              </div>
            ) : (
              <Card className="p-12 text-center mb-6">
                <p className="text-gray-600">No video available for this lesson</p>
              </Card>
            )}

            {/* Lesson Description */}
            {lesson.description && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">About this lesson</h2>
                <p className="text-gray-700 whitespace-pre-line">{lesson.description}</p>
              </Card>
            )}

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="space-y-2">
                  {lesson.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-5 w-5 text-gray-500" />
                      <span>{resource.name}</span>
                      <span className="ml-auto text-sm text-gray-500">{resource.type}</span>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              {prevLesson ? (
                <Link href={`/learn/${courseSlug}/lesson/${prevLesson.lessonId}`}>
                  <Button variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Link href={`/learn/${courseSlug}/lesson/${nextLesson.lessonId}`}>
                  <Button>
                    Next Lesson
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${courseSlug}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold mb-4">Course Content</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {modules.map((module) => (
                  <div key={module.moduleId} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{module.title}</h4>
                    <div className="space-y-1">
                      {module.lessons.map((l) => (
                        <Link
                          key={l.lessonId}
                          href={`/learn/${courseSlug}/lesson/${l.lessonId}`}
                          className={`block text-sm p-2 rounded ${
                            l.lessonId === lessonId
                              ? 'bg-blue-100 text-blue-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {l.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
