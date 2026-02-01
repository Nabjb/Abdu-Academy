'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ChevronLeft,
  Menu,
  PlusCircle,
} from 'lucide-react';

const instructorNavItems = [
  { href: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'My Courses', icon: BookOpen },
  { href: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isInstructor, setIsInstructor] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkInstructorAccess();
  }, []);

  const checkInstructorAccess = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data.success || !['instructor', 'admin'].includes(data.user?.role)) {
        router.push('/login?redirect=/instructor');
        return;
      }

      setIsInstructor(true);
    } catch (error) {
      console.error('Error checking instructor access:', error);
      router.push('/login?redirect=/instructor');
    }
  };

  if (isInstructor === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isInstructor) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white dark:bg-gray-800 border-r transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <Link href="/instructor" className="font-bold text-xl text-primary">
              Instructor
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Create Course Button */}
        <div className="p-4">
          <Link href="/instructor/courses/new">
            <Button className={`w-full ${sidebarOpen ? '' : 'p-2'}`}>
              <PlusCircle className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">New Course</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {instructorNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {sidebarOpen && (
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            {sidebarOpen && (
              <span className="text-gray-700 dark:text-gray-300">Back to Site</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
