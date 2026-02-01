'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Lock, Play } from 'lucide-react';

interface Course {
  courseId: string;
  title: string;
  slug?: string;
  price: number;
  currency: string;
  instructorId: string;
}

interface CourseSidebarProps {
  course: Course;
  isPurchased: boolean;
  isAuthenticated: boolean;
}

export function CourseSidebar({ course, isPurchased, isAuthenticated }: CourseSidebarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.slug || course.courseId}`);
      return;
    }

    setLoading(true);
    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.courseId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    router.push(`/learn/${course.courseId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 sticky top-4">
        <div className="mb-6">
          <div className="text-3xl font-bold mb-2">
            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
          </div>
          {course.price > 0 && (
            <div className="text-sm text-gray-600">One-time payment</div>
          )}
        </div>

        {isPurchased ? (
          <Button
            onClick={handleStartLearning}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Buy Course'}
          </Button>
        )}

        {course.price > 0 && !isPurchased && (
          <div className="mt-4 text-xs text-gray-600 text-center">
            30-day money-back guarantee
          </div>
        )}

        <div className="mt-6 pt-6 border-t space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Full lifetime access</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Certificate of completion</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Downloadable resources</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Mobile and desktop access</span>
          </div>
        </div>
      </Card>

      {/* Course Includes */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">This course includes:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Video lectures</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Downloadable resources</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Quizzes and assignments</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Certificate of completion</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
