/**
 * Appwrite Collection Schemas
 * 
 * This file defines the structure of all Appwrite collections.
 * Use this as a reference when creating collections in the Appwrite console.
 */

export const COLLECTION_SCHEMAS = {
  users: {
    name: 'users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'name', type: 'string', size: 255, required: true, array: false },
      { key: 'avatar', type: 'string', size: 500, required: false, array: false },
      { key: 'role', type: 'string', size: 20, required: true, array: false },
      { key: 'createdAt', type: 'datetime', required: true, array: false },
      { key: 'updatedAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
    ],
  },
  courses: {
    name: 'courses',
    attributes: [
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'title', type: 'string', size: 500, required: true, array: false },
      { key: 'slug', type: 'string', size: 500, required: true, array: false },
      { key: 'description', type: 'string', size: 10000, required: true, array: false },
      { key: 'shortDescription', type: 'string', size: 500, required: true, array: false },
      { key: 'price', type: 'double', required: true, array: false },
      { key: 'currency', type: 'string', size: 10, required: true, array: false },
      { key: 'thumbnail', type: 'string', size: 500, required: false, array: false },
      { key: 'category', type: 'string', size: 100, required: true, array: false },
      { key: 'level', type: 'string', size: 20, required: true, array: false },
      { key: 'instructorId', type: 'string', size: 255, required: true, array: false },
      { key: 'status', type: 'string', size: 20, required: true, array: false },
      { key: 'totalDuration', type: 'integer', required: true, array: false },
      { key: 'totalLessons', type: 'integer', required: true, array: false },
      { key: 'createdAt', type: 'datetime', required: true, array: false },
      { key: 'updatedAt', type: 'datetime', required: true, array: false },
      { key: 'publishedAt', type: 'datetime', required: false, array: false },
    ],
    indexes: [
      { key: 'title', type: 'fulltext', attributes: ['title'] },
      { key: 'slug', type: 'unique', attributes: ['slug'] },
      { key: 'category', type: 'key', attributes: ['category'] },
      { key: 'instructorId', type: 'key', attributes: ['instructorId'] },
      { key: 'status', type: 'key', attributes: ['status'] },
    ],
  },
  modules: {
    name: 'modules',
    attributes: [
      { key: 'moduleId', type: 'string', size: 255, required: true, array: false },
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'title', type: 'string', size: 500, required: true, array: false },
      { key: 'description', type: 'string', size: 2000, required: false, array: false },
      { key: 'order', type: 'integer', required: true, array: false },
      { key: 'createdAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
  },
  lessons: {
    name: 'lessons',
    attributes: [
      { key: 'lessonId', type: 'string', size: 255, required: true, array: false },
      { key: 'moduleId', type: 'string', size: 255, required: true, array: false },
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'title', type: 'string', size: 500, required: true, array: false },
      { key: 'description', type: 'string', size: 5000, required: false, array: false },
      { key: 'videoUrl', type: 'string', size: 500, required: false, array: false },
      { key: 'duration', type: 'integer', required: true, array: false },
      { key: 'order', type: 'integer', required: true, array: false },
      { key: 'isFreePreview', type: 'boolean', required: true, array: false },
      { key: 'resources', type: 'string', size: 5000, required: false, array: false }, // JSON string
      { key: 'createdAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'moduleId', type: 'key', attributes: ['moduleId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
  },
  purchases: {
    name: 'purchases',
    attributes: [
      { key: 'purchaseId', type: 'string', size: 255, required: true, array: false },
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'stripePaymentId', type: 'string', size: 255, required: true, array: false },
      { key: 'stripeSessionId', type: 'string', size: 255, required: true, array: false },
      { key: 'amount', type: 'double', required: true, array: false },
      { key: 'currency', type: 'string', size: 10, required: true, array: false },
      { key: 'status', type: 'string', size: 20, required: true, array: false },
      { key: 'purchasedAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
      { key: 'userId_courseId', type: 'key', attributes: ['userId', 'courseId'] },
    ],
  },
  progress: {
    name: 'progress',
    attributes: [
      { key: 'progressId', type: 'string', size: 255, required: true, array: false },
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'lessonId', type: 'string', size: 255, required: true, array: false },
      { key: 'completed', type: 'boolean', required: true, array: false },
      { key: 'watchedSeconds', type: 'integer', required: true, array: false },
      { key: 'lastWatchedAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
      { key: 'lessonId', type: 'key', attributes: ['lessonId'] },
      { key: 'userId_courseId', type: 'key', attributes: ['userId', 'courseId'] },
    ],
  },
  reviews: {
    name: 'reviews',
    attributes: [
      { key: 'reviewId', type: 'string', size: 255, required: true, array: false },
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'courseId', type: 'string', size: 255, required: true, array: false },
      { key: 'rating', type: 'integer', required: true, array: false },
      { key: 'comment', type: 'string', size: 2000, required: false, array: false },
      { key: 'createdAt', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
  },
  categories: {
    name: 'categories',
    attributes: [
      { key: 'categoryId', type: 'string', size: 255, required: true, array: false },
      { key: 'name', type: 'string', size: 100, required: true, array: false },
      { key: 'slug', type: 'string', size: 100, required: true, array: false },
      { key: 'description', type: 'string', size: 1000, required: false, array: false },
      { key: 'icon', type: 'string', size: 100, required: false, array: false },
      { key: 'order', type: 'integer', required: true, array: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'] },
    ],
  },
} as const;
