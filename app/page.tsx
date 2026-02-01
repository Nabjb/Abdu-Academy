'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  Award,
  Play,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Course, Category } from '@/types';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        fetch('/api/courses?status=published&limit=6'),
        fetch('/api/categories'),
      ]);

      const coursesData = await coursesRes.json();
      const categoriesData = await categoriesRes.json();

      if (coursesData.success) {
        setFeaturedCourses(coursesData.courses);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <Badge variant="secondary" className="bg-transparent border-0 px-0 text-sm font-medium">
                Transform Your Future with Expert-Led Courses
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Master New Skills
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Advance Your Career
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners accessing{' '}
              <span className="font-semibold text-primary">high-quality courses</span> taught by industry experts.
              <br />
              Learn at your own pace with{' '}
              <span className="font-semibold text-primary">lifetime access</span> to all purchased content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/courses">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Explore Courses 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  Start Learning Free
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 mt-20 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { icon: BookOpen, label: 'Premium Courses', value: '100+', color: 'text-blue-600 dark:text-blue-400' },
              { icon: Users, label: 'Active Students', value: '10K+', color: 'text-purple-600 dark:text-purple-400' },
              { icon: Award, label: 'Certificates Issued', value: '5K+', color: 'text-pink-600 dark:text-pink-400' },
              { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-yellow-600 dark:text-yellow-400' },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className={`h-10 w-10 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl md:text-4xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">
                Explore our most popular courses
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No courses available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Link key={course.courseId} href={`/courses/${course.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="relative h-48 bg-gray-100">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3">{course.level}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            {course.totalLessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.floor(course.totalDuration / 3600)}h
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          ${course.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">
                Find courses in your area of interest
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.categoryId}
                  href={`/categories/${category.slug}`}
                >
                  <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-3xl mb-2">{category.icon || '📚'}</div>
                    <h3 className="font-medium">{category.name}</h3>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Why Choose ABDU Academy?</h2>
            <p className="text-muted-foreground">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Expert Instructors',
                description:
                  'Learn from industry professionals with real-world experience',
              },
              {
                icon: Play,
                title: 'Lifetime Access',
                description:
                  'Purchase once and access your courses forever, including updates',
              },
              {
                icon: CheckCircle,
                title: 'Certificates',
                description:
                  'Earn certificates to showcase your achievements and skills',
              },
              {
                icon: Clock,
                title: 'Learn at Your Pace',
                description:
                  'Study anytime, anywhere with our mobile-friendly platform',
              },
              {
                icon: Users,
                title: 'Community Support',
                description:
                  'Join a community of learners and get help when you need it',
              },
              {
                icon: Award,
                title: 'Quality Content',
                description:
                  'Carefully curated courses with practical, hands-on projects',
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students already learning on ABDU Academy. Start your
            journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
