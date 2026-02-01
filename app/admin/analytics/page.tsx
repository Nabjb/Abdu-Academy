'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

export default function AdminAnalyticsPage() {
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
      console.error('Error fetching stats:', error);
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

  const conversionRate = stats?.totalUsers
    ? ((stats.completedPurchases / stats.totalUsers) * 100).toFixed(1)
    : '0';

  const avgOrderValue = stats?.completedPurchases
    ? (stats.totalRevenue / stats.completedPurchases).toFixed(2)
    : '0';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              30-Day Revenue
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.recentRevenue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.recentPurchases || 0} purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Conversion Rate
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-sm text-gray-500 mt-1">Users to purchasers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Order Value
            </CardTitle>
            <CreditCard className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue}</div>
            <p className="text-sm text-gray-500 mt-1">Per purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Registered Users</span>
              <span className="font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Users with Purchases</span>
              <span className="font-bold">{stats?.completedPurchases || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Conversion Rate</span>
              <span className="font-bold">{conversionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Courses</span>
              <span className="font-bold">{stats?.totalCourses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Published Courses</span>
              <span className="font-bold text-green-600">
                {stats?.publishedCourses || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Draft Courses</span>
              <span className="font-bold text-yellow-600">
                {(stats?.totalCourses || 0) - (stats?.publishedCourses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Categories</span>
              <span className="font-bold">{stats?.totalCategories || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Revenue</span>
              <span className="font-bold text-emerald-600">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Last 30 Days</span>
              <span className="font-bold">
                ${(stats?.recentRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Average Order Value</span>
              <span className="font-bold">${avgOrderValue}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Purchases</span>
              <span className="font-bold">{stats?.totalPurchases || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Completed</span>
              <span className="font-bold text-green-600">
                {stats?.completedPurchases || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Last 30 Days</span>
              <span className="font-bold">{stats?.recentPurchases || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about analytics */}
      <Card className="mt-8">
        <CardContent className="py-6">
          <p className="text-center text-gray-500">
            For more detailed analytics, including charts and historical trends,
            consider integrating with analytics services like Google Analytics,
            Mixpanel, or Plausible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
