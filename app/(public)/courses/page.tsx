'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/course/course-card';
import { CourseFilters } from '@/components/course/course-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3x3, List, Search } from 'lucide-react';

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
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popularity';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(12);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    priceRange: [0, 1000] as [number, number],
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, searchQuery, sortBy]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.level) {
        params.append('level', filters.level);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/courses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        let filteredCourses = data.courses;

        // Apply price filter
        filteredCourses = filteredCourses.filter((course: Course) => 
          course.price >= filters.priceRange[0] && course.price <= filters.priceRange[1]
        );

        // Apply sorting
        filteredCourses = sortCourses(filteredCourses, sortBy);

        setCourses(filteredCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortCourses = (coursesToSort: Course[], sort: SortOption): Course[] => {
    const sorted = [...coursesToSort];
    
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popularity':
        // For now, sort by totalLessons as a proxy for popularity
        return sorted.sort((a, b) => b.totalLessons - a.totalLessons);
      default:
        return sorted;
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      priceRange: [0, 1000],
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(filters.category || filters.level || searchQuery || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000);

  // Pagination
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, searchQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Courses</h1>
        <p className="text-gray-600">Discover courses to advance your skills</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <CourseFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border rounded px-3 py-1.5 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Course Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading courses...</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No courses found</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters to see all courses
                </Button>
              )}
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.courseId} course={course} viewMode={viewMode} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsis = index > 0 && array[index] - array[index - 1] > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-2">...</span>}
                            <Button
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
