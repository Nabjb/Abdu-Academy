'use client';

import { Card } from '@/components/ui/card';

interface Course {
  courseId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface CourseOverviewProps {
  course: Course;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  // This would typically come from course data
  const whatYoullLearn = [
    'Master the fundamentals of the subject',
    'Build real-world projects',
    'Understand best practices and patterns',
    'Apply your knowledge to solve problems',
  ];

  const requirements = [
    'Basic computer skills',
    'No prior experience required',
    'Willingness to learn',
  ];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">About this course</h2>
      
      <div className="prose max-w-none mb-8">
        <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
      </div>

      {/* What you'll learn */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whatYoullLearn.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Requirements</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
