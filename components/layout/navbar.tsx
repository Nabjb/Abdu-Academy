'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'instructor' | 'admin';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
              ABDU Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            <ThemeToggle />
            <Link
              href="/courses"
              className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                isActive('/courses') 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/categories"
              className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                isActive('/categories') 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Categories
            </Link>

            {user ? (
              <>
                {user.role === 'instructor' || user.role === 'admin' ? (
                  <Link
                    href="/instructor"
                    className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                      isActive('/instructor') 
                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Instructor
                  </Link>
                ) : null}
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                      isActive('/admin') 
                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Admin
                  </Link>
                ) : null}
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    isActive('/dashboard') 
                      ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <span>{user.name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/my-courses">My Courses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/courses"
                className={`text-sm font-medium ${
                  isActive('/courses') ? 'text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/categories"
                className={`text-sm font-medium ${
                  isActive('/categories') ? 'text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium ${
                      isActive('/dashboard') ? 'text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'instructor' || user.role === 'admin' ? (
                    <Link
                      href="/instructor"
                      className={`text-sm font-medium ${
                        isActive('/instructor') ? 'text-blue-600' : 'text-gray-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Instructor
                    </Link>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
