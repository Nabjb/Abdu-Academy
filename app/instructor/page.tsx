'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  DollarSign,
  Plus,
  Edit,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Course } from '@/types';

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?instructorOnly=true&limit=5');
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

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.filter((c) => c.status === 'draft').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Course
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {publishedCount} published, {draftCount} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-sm text-gray-500 mt-1">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Courses</CardTitle>
          <Link href="/instructor/courses">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You haven't created any courses yet.
              </p>
              <Link href="/instructor/courses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{course.title}</h3>
                      <Badge
                        variant={course.status === 'published' ? 'default' : 'secondary'}
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {course.totalLessons} lessons • ${course.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/instructor/courses/${course.courseId}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </Link>
                    {course.status === 'published' && (
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/instructor/courses/new"
              className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Create New Course</p>
                  <p className="text-sm text-gray-500">
                    Start building your next course
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/instructor/analytics"
              className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-gray-500">
                    Track your course performance
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Create engaging video content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Add downloadable resources
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Write clear course descriptions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Offer free preview lessons
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Respond to student reviews
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
