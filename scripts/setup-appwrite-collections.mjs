/**
 * Appwrite Collections Setup Script
 * 
 * This script creates all required collections, attributes, indexes, and permissions
 * for the ABDU Academy platform.
 * 
 * Usage:
 *   npm run setup-appwrite
 * 
 * Prerequisites:
 *   - Appwrite project created
 *   - Database created
 *   - API key with Databases (Read, Write) permissions
 *   - Environment variables configured in .env.local
 * 
 * IMPORTANT: Permission Notes
 * - Appwrite doesn't support custom role dimensions (e.g., Role.users('instructor'))
 * - Custom roles (student, instructor, admin) are stored as user attributes
 * - Role-based access control (instructor/admin) is handled in application code (API routes)
 * - Collection permissions use only: Role.any(), Role.users(), Role.user(userId)
 * - Application-level checks ensure only instructors/admins can create/edit courses
 */

import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'abdu-academy';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure .env.local has:');
  console.error('  - NEXT_PUBLIC_APPWRITE_ENDPOINT');
  console.error('  - NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  console.error('  - APPWRITE_API_KEY');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Helper function to wait (for rate limiting)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create attribute
async function createAttribute(collectionId, attribute) {
  try {
    const { key, type, size, required, array, default: defaultValue, elements } = attribute;
    
    let result;
    switch (type) {
      case 'string':
        result = await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          key,
          size,
          required,
          defaultValue,
          array
        );
        break;
      case 'integer':
        result = await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          defaultValue,
          array
        );
        break;
      case 'double':
        result = await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          defaultValue,
          array
        );
        break;
      case 'boolean':
        result = await databases.createBooleanAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          defaultValue,
          array
        );
        break;
      case 'datetime':
        result = await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          defaultValue,
          array
        );
        break;
      default:
        throw new Error(`Unknown attribute type: ${type}`);
    }
    
    // Wait for attribute to be ready
    while (result.status !== 'available') {
      await wait(500);
      result = await databases.getAttribute(DATABASE_ID, collectionId, key);
    }
    
    return result;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⚠️  Attribute "${key}" already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

// Helper function to create index
async function createIndex(collectionId, index) {
  try {
    const { key, type, attributes } = index;
    
    let result;
    switch (type) {
      case 'key':
        result = await databases.createIndex(
          DATABASE_ID,
          collectionId,
          key,
          type,
          attributes
        );
        break;
      case 'unique':
        result = await databases.createIndex(
          DATABASE_ID,
          collectionId,
          key,
          type,
          attributes
        );
        break;
      case 'fulltext':
        result = await databases.createIndex(
          DATABASE_ID,
          collectionId,
          key,
          type,
          attributes
        );
        break;
      default:
        throw new Error(`Unknown index type: ${type}`);
    }
    
    // Wait for index to be ready
    while (result.status !== 'available') {
      await wait(500);
      result = await databases.getIndex(DATABASE_ID, collectionId, key);
    }
    
    return result;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⚠️  Index "${key}" already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

// Collection definitions
const collections = [
  {
    name: 'users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
    ],
    permissions: {
      read: [Role.users()],
      create: [Role.users()],
      update: [Role.users()],
      delete: [Role.users()],
    },
  },
  {
    name: 'courses',
    attributes: [
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'slug', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 10000, required: true },
      { key: 'shortDescription', type: 'string', size: 500, required: true },
      { key: 'price', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 10, required: true },
      { key: 'thumbnail', type: 'string', size: 500, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'level', type: 'string', size: 20, required: true },
      { key: 'instructorId', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'totalDuration', type: 'integer', required: true },
      { key: 'totalLessons', type: 'integer', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
      { key: 'publishedAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'title', type: 'fulltext', attributes: ['title'] },
      { key: 'slug', type: 'unique', attributes: ['slug'] },
      { key: 'category', type: 'key', attributes: ['category'] },
      { key: 'instructorId', type: 'key', attributes: ['instructorId'] },
      { key: 'status', type: 'key', attributes: ['status'] },
    ],
    permissions: {
      // Note: Role-based access (instructor/admin) is handled in application code
      read: [Role.any()], // Public read for published courses, filtered by status in queries
      create: [Role.users()], // Check role in API route
      update: [Role.users()], // Check role and ownership in API route
      delete: [Role.users()], // Check admin role in API route
    },
  },
  {
    name: 'modules',
    attributes: [
      { key: 'moduleId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'order', type: 'integer', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
    permissions: {
      // Note: Role-based access is handled in application code
      read: [Role.any()], // Public read, filtered by course status in queries
      create: [Role.users()], // Check instructor/admin role in API route
      update: [Role.users()], // Check instructor/admin role in API route
      delete: [Role.users()], // Check instructor/admin role in API route
    },
  },
  {
    name: 'lessons',
    attributes: [
      { key: 'lessonId', type: 'string', size: 255, required: true },
      { key: 'moduleId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 5000, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: false },
      { key: 'duration', type: 'integer', required: true },
      { key: 'order', type: 'integer', required: true },
      { key: 'isFreePreview', type: 'boolean', required: true },
      { key: 'resources', type: 'string', size: 5000, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'moduleId', type: 'key', attributes: ['moduleId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
    permissions: {
      // Note: Role-based access is handled in application code
      read: [Role.any()], // Public read for free previews, filtered by purchase in queries
      create: [Role.users()], // Check instructor/admin role in API route
      update: [Role.users()], // Check instructor/admin role in API route
      delete: [Role.users()], // Check instructor/admin role in API route
    },
  },
  {
    name: 'purchases',
    attributes: [
      { key: 'purchaseId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'stripePaymentId', type: 'string', size: 255, required: true },
      { key: 'stripeSessionId', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 10, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'purchasedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
      { key: 'userId_courseId', type: 'key', attributes: ['userId', 'courseId'] },
    ],
    permissions: {
      read: [Role.users()], // Users can only read their own purchases (filtered by userId)
      create: [Role.users()],
      update: [Role.users()], // Check admin role in API route for updates
      delete: [Role.users()], // Check admin role in API route for deletes
    },
  },
  {
    name: 'progress',
    attributes: [
      { key: 'progressId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'lessonId', type: 'string', size: 255, required: true },
      { key: 'completed', type: 'boolean', required: true },
      { key: 'watchedSeconds', type: 'integer', required: true },
      { key: 'lastWatchedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
      { key: 'lessonId', type: 'key', attributes: ['lessonId'] },
      { key: 'userId_courseId', type: 'key', attributes: ['userId', 'courseId'] },
    ],
    permissions: {
      read: [Role.users()], // Users can only read their own progress (filtered by userId)
      create: [Role.users()],
      update: [Role.users()], // Users can only update their own progress (filtered by userId)
      delete: [Role.users()], // Users can only delete their own progress (filtered by userId)
    },
  },
  {
    name: 'reviews',
    attributes: [
      { key: 'reviewId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'comment', type: 'string', size: 2000, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'courseId', type: 'key', attributes: ['courseId'] },
    ],
    permissions: {
      read: [Role.any()], // Public read
      create: [Role.users()], // Check purchase in API route
      update: [Role.users()], // Users can only update their own reviews (filtered by userId)
      delete: [Role.users()], // Users can only delete their own reviews (filtered by userId)
    },
  },
  {
    name: 'categories',
    attributes: [
      { key: 'categoryId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'slug', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'icon', type: 'string', size: 100, required: false },
      { key: 'order', type: 'integer', required: true },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'] },
    ],
    permissions: {
      read: [Role.any()], // Public read
      create: [Role.users()], // Check admin role in API route
      update: [Role.users()], // Check admin role in API route
      delete: [Role.users()], // Check admin role in API route
    },
  },
];

async function setupCollection(collection) {
  console.log(`\n📦 Creating collection: ${collection.name}`);
  
  try {
    // Check if collection exists - get ALL collections and filter by name
    let collectionId;
    try {
      const allCollections = await databases.listCollections(DATABASE_ID);
      const existing = allCollections.collections.filter(c => c.name === collection.name);
      
      if (existing.length > 0) {
        // Use the first one found (or could use the most recent)
        collectionId = existing[0].$id;
        console.log(`   ⚠️  Collection already exists (ID: ${collectionId})`);
        
        if (existing.length > 1) {
          console.log(`   ⚠️  WARNING: Found ${existing.length} collections with name "${collection.name}"`);
          console.log(`   ⚠️  Using the first one. Consider cleaning up duplicates.`);
        }
        
        console.log(`   ℹ️  Skipping creation, updating existing collection...`);
      }
    } catch (error) {
      // Error checking collections, will try to create
      console.log(`   ⚠️  Could not check for existing collections: ${error.message}`);
    }
    
    // Create collection if it doesn't exist
    if (!collectionId) {
      const created = await databases.createCollection(
        DATABASE_ID,
        ID.unique(),
        collection.name,
        [
          ...collection.permissions.read.map(p => Permission.read(p)),
          ...collection.permissions.create.map(p => Permission.create(p)),
          ...collection.permissions.update.map(p => Permission.update(p)),
          ...collection.permissions.delete.map(p => Permission.delete(p)),
        ]
      );
      collectionId = created.$id;
      console.log(`   ✅ Collection created (ID: ${collectionId})`);
    } else {
      // Update permissions
      await databases.updateCollection(
        DATABASE_ID,
        collectionId,
        collection.name,
        [
          ...collection.permissions.read.map(p => Permission.read(p)),
          ...collection.permissions.create.map(p => Permission.create(p)),
          ...collection.permissions.update.map(p => Permission.update(p)),
          ...collection.permissions.delete.map(p => Permission.delete(p)),
        ]
      );
      console.log(`   ✅ Permissions updated`);
    }
    
    // Create attributes
    console.log(`   📝 Creating attributes...`);
    for (const attr of collection.attributes) {
      await createAttribute(collectionId, attr);
      console.log(`      ✅ ${attr.key} (${attr.type})`);
      await wait(200); // Rate limiting
    }
    
    // Create indexes
    console.log(`   🔍 Creating indexes...`);
    for (const index of collection.indexes) {
      await createIndex(collectionId, index);
      console.log(`      ✅ ${index.key} (${index.type})`);
      await wait(200); // Rate limiting
    }
    
    console.log(`   ✅ Collection "${collection.name}" setup complete!`);
  } catch (error) {
    console.error(`   ❌ Error setting up collection "${collection.name}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Appwrite Collections Setup...\n');
  console.log(`Database ID: ${DATABASE_ID}`);
  console.log(`Project ID: ${PROJECT_ID}\n`);
  
  try {
    // Verify database exists
    await databases.get(DATABASE_ID);
    console.log('✅ Database found\n');
    
    // Setup each collection
    for (const collection of collections) {
      await setupCollection(collection);
      await wait(1000); // Rate limiting between collections
    }
    
    console.log('\n✅ All collections setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Created ${collections.length} collections`);
    console.log(`   - All attributes and indexes configured`);
    console.log(`   - Permissions set up`);
    console.log('\n🎉 Setup finished successfully!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.code === 404) {
      console.error('   Database not found. Please create it in Appwrite console first.');
    } else if (error.code === 401) {
      console.error('   Authentication failed. Check your API key.');
    }
    process.exit(1);
  }
}

main();
