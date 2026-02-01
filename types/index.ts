// User Types
export interface User {
  userId: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Course Types
export interface Course {
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
  status: 'draft' | 'published' | 'archived';
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Module Types
export interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

// Lesson Types
export interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
  resources: LessonResource[];
  createdAt: string;
}

export interface LessonResource {
  name: string;
  url: string;
  type: string;
}

// Purchase Types
export interface Purchase {
  purchaseId: string;
  userId: string;
  courseId: string;
  stripePaymentId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  purchasedAt: string;
}

// Progress Types
export interface Progress {
  progressId: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastWatchedAt: string;
}

// Review Types
export interface Review {
  reviewId: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Category Types
export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
}
