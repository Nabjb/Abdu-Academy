import { Client, Account, Databases, Storage } from 'node-appwrite';

// Lazy initialization to avoid build-time errors when env vars aren't set
let serverClientInstance: Client | null = null;
let clientInstance: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;
let storageInstance: Storage | null = null;

function getServerClient(): Client {
  if (!serverClientInstance) {
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Please add it to your environment variables.');
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Please add it to your environment variables.');
    }
    serverClientInstance = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY || '');
  }
  return serverClientInstance;
}

function getClient(): Client {
  if (!clientInstance) {
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Please add it to your environment variables.');
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Please add it to your environment variables.');
    }
    clientInstance = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  }
  return clientInstance;
}

// Export getters that initialize on first use
export const serverClient = new Proxy({} as Client, {
  get(_target, prop) {
    return getServerClient()[prop as keyof Client];
  },
});

export const client = new Proxy({} as Client, {
  get(_target, prop) {
    return getClient()[prop as keyof Client];
  },
});

// Services with lazy initialization
export const account = new Proxy({} as Account, {
  get(_target, prop) {
    if (!accountInstance) {
      accountInstance = new Account(getClient());
    }
    return accountInstance[prop as keyof Account];
  },
});

export const databases = new Proxy({} as Databases, {
  get(_target, prop) {
    if (!databasesInstance) {
      databasesInstance = new Databases(getServerClient());
    }
    return databasesInstance[prop as keyof Databases];
  },
});

export const storage = new Proxy({} as Storage, {
  get(_target, prop) {
    if (!storageInstance) {
      storageInstance = new Storage(getServerClient());
    }
    return storageInstance[prop as keyof Storage];
  },
});

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
