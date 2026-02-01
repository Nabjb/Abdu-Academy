/**
 * Cleanup Duplicate Collections Script
 * 
 * This script helps identify and optionally delete duplicate collections.
 * 
 * Usage:
 *   node scripts/cleanup-duplicate-collections.mjs [--dry-run]
 * 
 * Use --dry-run to see what would be deleted without actually deleting
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'abdu-academy';

const DRY_RUN = process.argv.includes('--dry-run');

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Required collection names (we only want one of each)
const REQUIRED_COLLECTIONS = [
  'users',
  'courses',
  'modules',
  'lessons',
  'purchases',
  'progress',
  'reviews',
  'categories',
];

async function findDuplicates() {
  try {
    console.log('🔍 Scanning for duplicate collections...\n');
    
    const allCollections = await databases.listCollections(DATABASE_ID);
    const collectionsByName = {};
    
    // Group collections by name
    allCollections.collections.forEach(collection => {
      if (!collectionsByName[collection.name]) {
        collectionsByName[collection.name] = [];
      }
      collectionsByName[collection.name].push({
        id: collection.$id,
        name: collection.name,
        createdAt: collection.$createdAt,
      });
    });
    
    // Find duplicates
    const duplicates = [];
    const toKeep = {};
    const toDelete = [];
    
    REQUIRED_COLLECTIONS.forEach(name => {
      const collections = collectionsByName[name] || [];
      
      if (collections.length === 0) {
        console.log(`⚠️  Missing collection: ${name}`);
      } else if (collections.length === 1) {
        toKeep[name] = collections[0].id;
        console.log(`✅ ${name}: 1 collection (ID: ${collections[0].id})`);
      } else {
        // Multiple collections with same name - keep the oldest one
        const sorted = collections.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        toKeep[name] = sorted[0].id;
        duplicates.push({
          name,
          keep: sorted[0],
          delete: sorted.slice(1),
        });
        
        console.log(`\n⚠️  DUPLICATE FOUND: ${name}`);
        console.log(`   ✅ Keep: ${sorted[0].id} (created: ${sorted[0].createdAt})`);
        sorted.slice(1).forEach((col, idx) => {
          console.log(`   ❌ Delete ${idx + 1}: ${col.id} (created: ${col.createdAt})`);
          toDelete.push(col);
        });
      }
    });
    
    // Check for unexpected collections
    Object.keys(collectionsByName).forEach(name => {
      if (!REQUIRED_COLLECTIONS.includes(name)) {
        console.log(`\n⚠️  Unexpected collection: ${name}`);
        collectionsByName[name].forEach(col => {
          console.log(`   ID: ${col.id}`);
        });
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total collections: ${allCollections.collections.length}`);
    console.log(`   Unique names: ${Object.keys(collectionsByName).length}`);
    console.log(`   Duplicates found: ${duplicates.length}`);
    console.log(`   Collections to delete: ${toDelete.length}`);
    
    if (toDelete.length === 0) {
      console.log(`\n✅ No duplicates found! All collections are unique.`);
      return;
    }
    
    if (DRY_RUN) {
      console.log(`\n🔍 DRY RUN MODE - No collections will be deleted`);
      console.log(`\nTo actually delete duplicates, run:`);
      console.log(`   node scripts/cleanup-duplicate-collections.mjs`);
    } else {
      console.log(`\n🗑️  Deleting duplicate collections...`);
      
      for (const col of toDelete) {
        try {
          await databases.deleteCollection(DATABASE_ID, col.id);
          console.log(`   ✅ Deleted: ${col.name} (ID: ${col.id})`);
        } catch (error) {
          console.error(`   ❌ Failed to delete ${col.name} (ID: ${col.id}): ${error.message}`);
        }
      }
      
      console.log(`\n✅ Cleanup complete!`);
      console.log(`\n📋 Remaining collections:`);
      const remaining = await databases.listCollections(DATABASE_ID);
      remaining.collections.forEach(col => {
        console.log(`   ✅ ${col.name} (ID: ${col.$id})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 404) {
      console.error('   Database not found.');
    } else if (error.code === 401) {
      console.error('   Authentication failed. Check your API key.');
    }
    process.exit(1);
  }
}

console.log('🧹 Duplicate Collections Cleanup\n');
if (DRY_RUN) {
  console.log('🔍 Running in DRY RUN mode - no changes will be made\n');
}
findDuplicates();
