/**
 * Appwrite Collection Setup Script
 * 
 * This script helps create all required collections in Appwrite.
 * 
 * Prerequisites:
 * 1. Have Appwrite project set up
 * 2. Have environment variables configured in .env.local
 * 3. Run: node scripts/setup-appwrite-collections.js
 * 
 * Note: This script requires manual execution of some steps in Appwrite console.
 * It provides a guide and can verify your setup.
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

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

// Collection definitions
const collections = {
  users: {
    name: 'users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
    ],
  },
  courses: {
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
  },
  // ... other collections
};

async function checkDatabase() {
  try {
    const database = await databases.get(DATABASE_ID);
    console.log(`✅ Database "${database.name}" found`);
    return true;
  } catch (error: any) {
    if (error.code === 404) {
      console.error(`❌ Database "${DATABASE_ID}" not found`);
      console.error('Please create the database in Appwrite console first');
    } else {
      console.error('Error checking database:', error.message);
    }
    return false;
  }
}

async function checkCollections() {
  try {
    const collectionsList = await databases.listCollections(DATABASE_ID);
    const existingNames = collectionsList.collections.map((c: any) => c.name);
    
    console.log('\n📋 Existing Collections:');
    existingNames.forEach((name: string) => {
      console.log(`  ✅ ${name}`);
    });
    
    const required = ['users', 'courses', 'modules', 'lessons', 'purchases', 'progress', 'reviews', 'categories'];
    const missing = required.filter(name => !existingNames.includes(name));
    
    if (missing.length > 0) {
      console.log('\n❌ Missing Collections:');
      missing.forEach((name: string) => {
        console.log(`  - ${name}`);
      });
      console.log('\n📖 See lib/appwrite/setup-guide.md for detailed instructions');
    } else {
      console.log('\n✅ All required collections exist!');
    }
    
    return missing.length === 0;
  } catch (error: any) {
    console.error('Error checking collections:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking Appwrite Setup...\n');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Database ID: ${DATABASE_ID}\n`);
  
  const dbExists = await checkDatabase();
  if (!dbExists) {
    console.log('\n📝 Next Steps:');
    console.log('1. Go to Appwrite Console → Databases');
    console.log(`2. Create database with ID: ${DATABASE_ID}`);
    console.log('3. Run this script again');
    return;
  }
  
  const allCollectionsExist = await checkCollections();
  
  if (allCollectionsExist) {
    console.log('\n✅ Appwrite setup is complete!');
  } else {
    console.log('\n📝 Next Steps:');
    console.log('1. Go to Appwrite Console → Databases → Collections');
    console.log('2. Create the missing collections');
    console.log('3. See lib/appwrite/setup-guide.md for detailed schema');
    console.log('4. Run this script again to verify');
  }
}

main().catch(console.error);
