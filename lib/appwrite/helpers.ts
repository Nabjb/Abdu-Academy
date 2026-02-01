import { databases, DATABASE_ID, COLLECTIONS } from './client';
import { COLLECTION_IDS } from './collection-ids';
import { Query } from 'node-appwrite';
import type { Models } from 'node-appwrite';
import type { 
  User, 
  Course, 
  Module, 
  Lesson, 
  Purchase, 
  Progress, 
  Review, 
  Category 
} from '@/types';

// Appwrite Document type
type Document = Models.Document;

/**
 * Helper functions for Appwrite database operations
 */

// User helpers
export async function createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'> & { userId?: string }) {
  const { userId, ...data } = userData;
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.USERS, // Use collection ID instead of name
    userId || 'unique()', // Use provided userId as document ID or generate one
    {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getUser(userId: string) {
  return databases.getDocument<Document>(DATABASE_ID, COLLECTION_IDS.USERS, userId);
}

export async function updateUser(userId: string, data: Partial<User>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.USERS,
    userId,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    }
  );
}

// Course helpers
export async function createCourse(courseData: Omit<Course, 'courseId' | 'createdAt' | 'updatedAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.COURSES,
    'unique()',
    {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getCourse(courseId: string) {
  return databases.getDocument<Document>(DATABASE_ID, COLLECTION_IDS.COURSES, courseId);
}

export async function getCourseBySlug(slug: string) {
  const result = await databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.COURSES,
    [Query.equal('slug', slug)]
  );
  return result.documents[0] || null;
}

export async function listCourses(filters?: string[]) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.COURSES,
    filters
  );
}

export async function updateCourse(courseId: string, data: Partial<Course>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.COURSES,
    courseId,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function deleteCourse(courseId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.COURSES, courseId);
}

// Module helpers
export async function createModule(moduleData: Omit<Module, 'moduleId' | 'createdAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.MODULES,
    'unique()',
    {
      ...moduleData,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function getModule(moduleId: string) {
  return databases.getDocument<Document>(DATABASE_ID, COLLECTION_IDS.MODULES, moduleId);
}

export async function getModulesByCourse(courseId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.MODULES,
    [
      Query.equal('courseId', courseId),
      Query.orderAsc('order')
    ]
  );
}

export async function updateModule(moduleId: string, data: Partial<Module>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.MODULES,
    moduleId,
    data
  );
}

export async function deleteModule(moduleId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.MODULES, moduleId);
}

export async function reorderModules(courseId: string, moduleOrders: { moduleId: string; order: number }[]) {
  // Update each module's order
  const updates = moduleOrders.map(({ moduleId, order }) =>
    updateModule(moduleId, { order })
  );
  await Promise.all(updates);
  return getModulesByCourse(courseId);
}

// Lesson helpers
export async function createLesson(lessonData: Omit<Lesson, 'lessonId' | 'createdAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.LESSONS,
    'unique()',
    {
      ...lessonData,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function getLesson(lessonId: string) {
  return databases.getDocument<Document>(DATABASE_ID, COLLECTION_IDS.LESSONS, lessonId);
}

export async function getLessonsByModule(moduleId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.LESSONS,
    [
      Query.equal('moduleId', moduleId),
      Query.orderAsc('order')
    ]
  );
}

export async function getLessonsByCourse(courseId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.LESSONS,
    [Query.equal('courseId', courseId)]
  );
}

export async function updateLesson(lessonId: string, data: Partial<Lesson>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.LESSONS,
    lessonId,
    data
  );
}

export async function deleteLesson(lessonId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.LESSONS, lessonId);
}

export async function reorderLessons(moduleId: string, lessonOrders: { lessonId: string; order: number }[]) {
  // Update each lesson's order
  const updates = lessonOrders.map(({ lessonId, order }) =>
    updateLesson(lessonId, { order })
  );
  await Promise.all(updates);
  return getLessonsByModule(moduleId);
}

// Purchase helpers
export async function createPurchase(purchaseData: Omit<Purchase, 'purchaseId' | 'purchasedAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.PURCHASES,
    'unique()',
    {
      ...purchaseData,
      purchasedAt: new Date().toISOString(),
    }
  );
}

export async function getUserPurchases(userId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.PURCHASES,
    [Query.equal('userId', userId), Query.equal('status', 'completed')]
  );
}

export async function hasUserPurchasedCourse(userId: string, courseId: string): Promise<boolean> {
  const result = await databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.PURCHASES,
    [Query.equal('userId', userId), Query.equal('courseId', courseId), Query.equal('status', 'completed')]
  );
  return result.documents.length > 0;
}

// Progress helpers
export async function createProgress(progressData: Omit<Progress, 'progressId' | 'lastWatchedAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.PROGRESS,
    'unique()',
    {
      ...progressData,
      lastWatchedAt: new Date().toISOString(),
    }
  );
}

export async function updateProgress(progressId: string, data: Partial<Progress>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.PROGRESS,
    progressId,
    {
      ...data,
      lastWatchedAt: new Date().toISOString(),
    }
  );
}

export async function getUserProgress(userId: string, courseId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.PROGRESS,
    [Query.equal('userId', userId), Query.equal('courseId', courseId)]
  );
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const result = await databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.PROGRESS,
    [Query.equal('userId', userId), Query.equal('lessonId', lessonId)]
  );
  return result.documents[0] || null;
}

// Review helpers
export async function createReview(reviewData: Omit<Review, 'reviewId' | 'createdAt'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.REVIEWS,
    'unique()',
    {
      ...reviewData,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function getCourseReviews(courseId: string) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.REVIEWS,
    [Query.equal('courseId', courseId)]
  );
}

export async function listReviews(filters?: string[]) {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.REVIEWS,
    filters
  );
}

// Category helpers
export async function createCategory(categoryData: Omit<Category, 'categoryId'>) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_IDS.CATEGORIES,
    'unique()',
    categoryData
  );
}

export async function getCategory(categoryId: string) {
  return databases.getDocument<Document>(DATABASE_ID, COLLECTION_IDS.CATEGORIES, categoryId);
}

export async function listCategories() {
  return databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.CATEGORIES
  );
}

export async function getCategoryBySlug(slug: string) {
  const result = await databases.listDocuments<Document>(
    DATABASE_ID,
    COLLECTION_IDS.CATEGORIES,
    [Query.equal('slug', slug)]
  );
  return result.documents[0] || null;
}

export async function updateCategory(categoryId: string, data: Partial<Category>) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_IDS.CATEGORIES,
    categoryId,
    data
  );
}

export async function deleteCategory(categoryId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.CATEGORIES, categoryId);
}
