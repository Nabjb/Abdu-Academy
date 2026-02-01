'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
} from 'lucide-react';

interface InstructorStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
  recentEnrollments: number;
}

export default function InstructorAnalyticsPage() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch instructor's courses
      const coursesResponse = await fetch('/api/courses?instructorOnly=true');
      const coursesData = await coursesResponse.json();

      if (coursesData.success) {
        const courses = coursesData.courses;
        const publishedCourses = courses.filter((c: any) => c.status === 'published');

        // For now, we'll use placeholder data for enrollments and revenue
        // In production, you'd fetch this from the purchases API
        setStats({
          totalCourses: courses.length,
          publishedCourses: publishedCourses.length,
          totalEnrollments: 0, // Would come from purchases
          totalRevenue: 0, // Would come from purchases
          averageRating: 0, // Would come from reviews
          recentEnrollments: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      subValue: `${stats?.publishedCourses || 0} published`,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Students',
      value: stats?.totalEnrollments || 0,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Analytics' },
        ]}
        className="mb-6"
      />

      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subValue && (
                <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Courses</span>
                <span className="font-bold">{stats?.totalCourses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Published</span>
                <span className="font-bold text-green-600">
                  {stats?.publishedCourses || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Drafts</span>
                <span className="font-bold text-yellow-600">
                  {(stats?.totalCourses || 0) - (stats?.publishedCourses || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Welcome to your instructor analytics dashboard! Here you can track:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Course performance and enrollments</li>
                <li>Revenue from course sales</li>
                <li>Student ratings and reviews</li>
                <li>Engagement metrics</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Start by creating and publishing courses to see your analytics grow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
