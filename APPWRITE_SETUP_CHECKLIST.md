# Appwrite Setup Checklist

## ✅ What's Already Done

- ✅ Appwrite client configuration (`lib/appwrite/client.ts`)
- ✅ Database helper functions (`lib/appwrite/helpers.ts`)
- ✅ Collection schemas documented (`lib/appwrite/collections.ts`)
- ✅ Setup guide created (`lib/appwrite/setup-guide.md`)
- ✅ Verification script created (`scripts/verify-appwrite.mjs`)

## ❌ What Needs to Be Done

### Step 1: Create Appwrite Account & Project

1. **Sign up/Login to Appwrite**
   - Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
   - Create account or login

2. **Create Project**
   - Click "Create Project"
   - Name: **"ABDU Academy"**
   - Copy the **Project ID** (you'll need this)

3. **Get API Key**
   - Go to **Settings** → **API Keys**
   - Click **"Create API Key"**
   - Select scopes: **Databases (Read, Write)**, **Users (Read, Write)**
   - Copy the **API Key** (you'll need this)

### Step 2: Configure Environment Variables

Create/update `.env.local` file with:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=abdu-academy
```

**Important:** Replace `your_project_id_here` and `your_api_key_here` with actual values from Step 1.

### Step 3: Create Database

1. In Appwrite Console, go to **Databases**
2. Click **"Create Database"**
3. Name: `abdu-academy`
4. Copy the **Database ID** → Update `APPWRITE_DATABASE_ID` in `.env.local`

### Step 4: Configure Authentication

1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication
3. (Optional) Configure email templates
4. (Optional) Enable email verification

### Step 5: Create Collections

You need to create **8 collections**. For each collection:

1. Go to **Databases** → **Collections** → **Create Collection**
2. Use the name and attributes from the table below
3. Set permissions as specified

#### Collection 1: `users`
**Attributes:**
- `userId` (string, 255, required)
- `name` (string, 255, required)
- `avatar` (string, 500, optional)
- `role` (string, 20, required) - enum: student, instructor, admin
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes:**
- `userId` (key, unique)

**Permissions:**
- Read: Users (own document)
- Create: Users
- Update: Users (own document)
- Delete: Users (own document)

#### Collection 2: `courses`
**Attributes:**
- `courseId` (string, 255, required)
- `title` (string, 500, required)
- `slug` (string, 500, required, unique)
- `description` (string, 10000, required)
- `shortDescription` (string, 500, required)
- `price` (double, required)
- `currency` (string, 10, required, default: "USD")
- `thumbnail` (string, 500, optional)
- `category` (string, 100, required)
- `level` (string, 20, required) - enum: beginner, intermediate, advanced
- `instructorId` (string, 255, required)
- `status` (string, 20, required) - enum: draft, published, archived
- `totalDuration` (integer, required)
- `totalLessons` (integer, required)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)
- `publishedAt` (datetime, optional)

**Indexes:**
- `title` (fulltext)
- `slug` (unique)
- `category` (key)
- `instructorId` (key)
- `status` (key)

**Permissions:**
- Read: Any (for published), Users (for own courses)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin, own courses)
- Delete: Users (role: admin)

#### Collection 3: `modules`
**Attributes:**
- `moduleId` (string, 255, required)
- `courseId` (string, 255, required)
- `title` (string, 500, required)
- `description` (string, 2000, optional)
- `order` (integer, required)
- `createdAt` (datetime, required)

**Indexes:**
- `courseId` (key)

**Permissions:**
- Read: Any (if course published)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin)
- Delete: Users (role: instructor or admin)

#### Collection 4: `lessons`
**Attributes:**
- `lessonId` (string, 255, required)
- `moduleId` (string, 255, required)
- `courseId` (string, 255, required)
- `title` (string, 500, required)
- `description` (string, 5000, optional)
- `videoUrl` (string, 500, optional)
- `duration` (integer, required) - in seconds
- `order` (integer, required)
- `isFreePreview` (boolean, required, default: false)
- `resources` (string, 5000, optional) - JSON string
- `createdAt` (datetime, required)

**Indexes:**
- `moduleId` (key)
- `courseId` (key)

**Permissions:**
- Read: Any (if isFreePreview or course purchased)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin)
- Delete: Users (role: instructor or admin)

#### Collection 5: `purchases`
**Attributes:**
- `purchaseId` (string, 255, required)
- `userId` (string, 255, required)
- `courseId` (string, 255, required)
- `stripePaymentId` (string, 255, required)
- `stripeSessionId` (string, 255, required)
- `amount` (double, required)
- `currency` (string, 10, required)
- `status` (string, 20, required) - enum: pending, completed, refunded
- `purchasedAt` (datetime, required)

**Indexes:**
- `userId` (key)
- `courseId` (key)
- `userId_courseId` (composite: userId, courseId)

**Permissions:**
- Read: Users (own purchases)
- Create: Users
- Update: Users (role: admin)
- Delete: Users (role: admin)

#### Collection 6: `progress`
**Attributes:**
- `progressId` (string, 255, required)
- `userId` (string, 255, required)
- `courseId` (string, 255, required)
- `lessonId` (string, 255, required)
- `completed` (boolean, required, default: false)
- `watchedSeconds` (integer, required, default: 0)
- `lastWatchedAt` (datetime, required)

**Indexes:**
- `userId` (key)
- `courseId` (key)
- `lessonId` (key)
- `userId_courseId` (composite: userId, courseId)

**Permissions:**
- Read: Users (own progress)
- Create: Users
- Update: Users (own progress)
- Delete: Users (own progress)

#### Collection 7: `reviews`
**Attributes:**
- `reviewId` (string, 255, required)
- `userId` (string, 255, required)
- `courseId` (string, 255, required)
- `rating` (integer, required) - min: 1, max: 5
- `comment` (string, 2000, optional)
- `createdAt` (datetime, required)

**Indexes:**
- `userId` (key)
- `courseId` (key)

**Permissions:**
- Read: Any
- Create: Users (must have purchased course)
- Update: Users (own review)
- Delete: Users (own review)

#### Collection 8: `categories`
**Attributes:**
- `categoryId` (string, 255, required)
- `name` (string, 100, required)
- `slug` (string, 100, required, unique)
- `description` (string, 1000, optional)
- `icon` (string, 100, optional)
- `order` (integer, required)

**Indexes:**
- `slug` (unique)

**Permissions:**
- Read: Any
- Create: Users (role: admin)
- Update: Users (role: admin)
- Delete: Users (role: admin)

### Step 6: Verify Setup

Run the verification script:

```bash
npm run verify-appwrite
```

This will check:
- ✅ Environment variables are set
- ✅ Database exists
- ✅ All collections are created

## Quick Reference

**Files to check:**
- `.env.local` - Environment variables
- `lib/appwrite/setup-guide.md` - Detailed setup guide
- `lib/appwrite/collections.ts` - Collection schema reference

**Commands:**
- `npm run verify-appwrite` - Verify Appwrite setup
- `npm run dev` - Start dev server (will show errors if Appwrite not configured)

## Current Status Check

Run this to see what's missing:

```bash
npm run verify-appwrite
```

## Need Help?

See detailed instructions in:
- `lib/appwrite/setup-guide.md` - Complete setup guide
- `lib/appwrite/collections.ts` - Collection schemas
