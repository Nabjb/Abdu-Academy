'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  FolderTree,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalPurchases: number;
  completedPurchases: number;
  totalRevenue: number;
  totalCategories: number;
  recentPurchases: number;
  recentRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      subValue: `${stats?.publishedCourses || 0} published`,
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Purchases',
      value: stats?.completedPurchases || 0,
      icon: CreditCard,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Last 30 Days',
      value: `$${(stats?.recentRevenue || 0).toLocaleString()}`,
      subValue: `${stats?.recentPurchases || 0} purchases`,
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="/admin/users"
              className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/courses"
              className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Manage Courses</p>
                  <p className="text-sm text-gray-500">Review and moderate courses</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/categories"
              className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderTree className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Manage Categories</p>
                  <p className="text-sm text-gray-500">Add and organize course categories</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Platform Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Active Users (24h)</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Conversion Rate</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg. Course Rating</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
