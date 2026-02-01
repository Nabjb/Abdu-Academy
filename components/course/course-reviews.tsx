'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Review {
  reviewId: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
}

interface CourseReviewsProps {
  courseId: string;
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`);
      const data = await response.json();

      if (data.success && data.reviews) {
        setReviews(data.reviews);
        
        // Calculate average rating
        if (data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(avg);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Student reviews</h2>
        <p className="text-gray-600">Loading reviews...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Student reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.reviewId} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="font-semibold">{review.userName || 'Anonymous'}</span>
                <span className="text-sm text-gray-600">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
