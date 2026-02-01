# Appwrite Setup Status

## ✅ What You Already Have

From your `.env` file, I can see you have:
- ✅ Project ID: `697f7ca800280eb1de06`
- ✅ Endpoint: `https://fra.cloud.appwrite.io/v1`
- ✅ Database ID: `697f7ecf000d467b58db`

## ❌ What's Missing

### 1. Environment Variables in `.env.local`

Your `.env.local` file is empty. You need to copy these values from `.env` to `.env.local`:

**Required in `.env.local`:**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=697f7ca800280eb1de06
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=697f7ecf000d467b58db
```

**Action:** Copy the values from `.env` to `.env.local` and add your API key.

### 2. Appwrite API Key

You need to get your API key from Appwrite Console:
1. Go to https://fra.cloud.appwrite.io (or your Appwrite instance)
2. Go to **Settings** → **API Keys**
3. Create a new API key with permissions:
   - ✅ Databases (Read, Write)
   - ✅ Users (Read, Write)
4. Copy the key and add it to `.env.local` as `APPWRITE_API_KEY`

### 3. Database Collections

You need to create **8 collections** in your Appwrite database. 

**Current Status:** Unknown (run verification script after adding API key)

**Collections needed:**
1. `users`
2. `courses`
3. `modules`
4. `lessons`
5. `purchases`
6. `progress`
7. `reviews`
8. `categories`

## Quick Setup Steps

### Step 1: Add Environment Variables

Manually create/update `.env.local` with:

```env
# Appwrite (from your .env file)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=697f7ca800280eb1de06
APPWRITE_DATABASE_ID=697f7ecf000d467b58db

# Appwrite API Key (get from console)
APPWRITE_API_KEY=your_actual_api_key_here

# R2 (add your credentials)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=abdu-academy-storage

# Stripe (add your credentials)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Get API Key

1. Go to your Appwrite Console: https://fra.cloud.appwrite.io
2. Select project: **abdu Project** (ID: 697f7ca800280eb1de06)
3. Go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Name it: "ABDU Academy Server Key"
6. Select scopes:
   - ✅ Databases (Read, Write)
   - ✅ Users (Read, Write)
7. Copy the key and add to `.env.local`

### Step 3: Verify Database Exists

1. Go to **Databases** in Appwrite Console
2. Check if database `697f7ecf000d467b58db` exists
3. If not, create it with name: `abdu-academy`

### Step 4: Create Collections

You need to create 8 collections. See detailed instructions in:
- `lib/appwrite/setup-guide.md` - Complete guide with all attributes
- `APPWRITE_SETUP_CHECKLIST.md` - Step-by-step checklist

**Quick Reference:**
- Collection names: users, courses, modules, lessons, purchases, progress, reviews, categories
- Each collection needs specific attributes (see setup guide)
- Each collection needs indexes
- Each collection needs permissions

### Step 5: Verify Setup

After adding API key to `.env.local`, run:

```bash
npm run verify-appwrite
```

This will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ Collections existence

## Current Checklist

- [ ] Copy Appwrite values from `.env` to `.env.local`
- [ ] Get API key from Appwrite Console
- [ ] Add API key to `.env.local`
- [ ] Verify database exists
- [ ] Create 8 collections (users, courses, modules, lessons, purchases, progress, reviews, categories)
- [ ] Create indexes for each collection
- [ ] Set permissions for each collection
- [ ] Run `npm run verify-appwrite` to verify

## Need Help?

- **Detailed Setup Guide:** `lib/appwrite/setup-guide.md`
- **Collection Schemas:** `lib/appwrite/collections.ts`
- **Verification Script:** `npm run verify-appwrite`

## Next Steps After Setup

Once Appwrite is configured:
1. Test authentication (register/login)
2. Test course creation
3. Continue with remaining tasks
