import { Client, Account, Databases, Storage } from 'node-appwrite';

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set'); 
}

// Server-side client (uses API key)
export const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY || '');

// Client-side client (uses session)
export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Services
export const account = new Account(client);
export const databases = new Databases(serverClient);
export const storage = new Storage(serverClient);

// Database IDs (will be set after creating collections)
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'abdu-academy';
export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  MODULES: 'modules',
  LESSONS: 'lessons',
  PURCHASES: 'purchases',
  PROGRESS: 'progress',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
} as const;
