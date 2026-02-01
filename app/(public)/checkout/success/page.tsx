'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPurchase();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPurchase = async () => {
    try {
      const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success && data.purchase) {
        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${data.purchase.courseId}`);
        const courseData = await courseResponse.json();

        if (courseData.success) {
          setCourse(courseData.course);
        }
      }
    } catch (error) {
      console.error('Error verifying purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your course access has been granted.
            </p>
          </div>

          {course && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4">{course.shortDescription || course.description}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalLessons || 0} lessons</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {course ? (
              <Link href={`/learn/${course.courseId}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/my-courses">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to My Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/courses">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse More Courses
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p>
              A receipt has been sent to your email. If you have any questions, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
