/**
 * Quick Appwrite Connection Verification Script
 * 
 * Run: node scripts/verify-appwrite.js
 */

import { Client, Databases, Account } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'abdu-academy';

console.log('🔍 Verifying Appwrite Configuration...\n');

// Check environment variables
const missing = [];
if (!ENDPOINT) missing.push('NEXT_PUBLIC_APPWRITE_ENDPOINT');
if (!PROJECT_ID) missing.push('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
if (!API_KEY) missing.push('APPWRITE_API_KEY');

if (missing.length > 0) {
  console.error('❌ Missing environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease add these to .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   Endpoint: ${ENDPOINT}`);
console.log(`   Project ID: ${PROJECT_ID.substring(0, 20)}...`);
console.log(`   Database ID: ${DATABASE_ID}\n`);

// Test connection
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function verify() {
  try {
    // Test database access
    console.log('🔌 Testing database connection...');
    const database = await databases.get(DATABASE_ID);
    console.log(`✅ Database "${database.name}" is accessible\n`);
    
    // Check collections
    console.log('📋 Checking collections...');
    const collections = await databases.listCollections(DATABASE_ID);
    const collectionNames = collections.collections.map((c: any) => c.name);
    
    const required = ['users', 'courses', 'modules', 'lessons', 'purchases', 'progress', 'reviews', 'categories'];
    
    console.log(`Found ${collectionNames.length} collection(s):`);
    collectionNames.forEach(name => console.log(`   ✅ ${name}`));
    
    const missing = required.filter(name => !collectionNames.includes(name));
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing ${missing.length} collection(s):`);
      missing.forEach(name => console.log(`   ❌ ${name}`));
      console.log('\n📖 See lib/appwrite/setup-guide.md for setup instructions');
    } else {
      console.log('\n✅ All required collections exist!');
    }
    
    console.log('\n✅ Appwrite connection verified successfully!');
  } catch (error: any) {
    console.error('\n❌ Connection failed:');
    if (error.code === 404) {
      console.error('   Database not found. Please create it in Appwrite console.');
    } else if (error.code === 401) {
      console.error('   Authentication failed. Check your API key.');
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

verify();
