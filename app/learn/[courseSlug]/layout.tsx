'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const courseSlug = params.courseSlug as string;

  useEffect(() => {
    checkAccess();
  }, [courseSlug]);

  const checkAccess = async () => {
    try {
      // First, get the course to get the courseId
      const courseResponse = await fetch(`/api/courses/${courseSlug}`);
      const courseData = await courseResponse.json();

      if (!courseData.success) {
        router.push('/courses');
        return;
      }

      // Check if user has purchased the course
      const verifyResponse = await fetch(
        `/api/payments/verify/${courseData.course.courseId}`
      );
      const verifyData = await verifyResponse.json();

      if (verifyData.hasPurchased) {
        setHasAccess(true);
      } else {
        // Redirect to course page to purchase
        router.push(`/courses/${courseSlug}?purchase=required`);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      // Check if user is authenticated
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        router.push(`/login?redirect=/learn/${courseSlug}`);
      } else {
        router.push(`/courses/${courseSlug}`);
      }
    }
  };

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
