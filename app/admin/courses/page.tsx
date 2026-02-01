'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  courseId: string;
  title: string;
  slug: string;
  price: number;
  thumbnail?: string;
  category: string;
  level: string;
  instructorId: string;
  status: 'draft' | 'published' | 'archived';
  totalLessons: number;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', ((currentPage - 1) * ITEMS_PER_PAGE).toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/courses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.courses);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return <Badge className={colors[status] || colors.draft}>{status}</Badge>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Course Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Courses ({total})</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No courses found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.courseId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-20 rounded overflow-hidden bg-gray-100">
                            {course.thumbnail ? (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <p className="text-sm text-gray-500">
                              {course.totalLessons} lessons • {course.level}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.category || '-'}</TableCell>
                      <TableCell>${(course.price / 100).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell>
                        {format(new Date(course.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/courses/${course.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} courses
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
