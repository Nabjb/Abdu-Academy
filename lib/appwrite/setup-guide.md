# Appwrite Setup Guide

This guide will help you set up Appwrite for ABDU Academy.

## Step 1: Create Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io) or use your self-hosted instance
2. Create a new project named "ABDU Academy"
3. Copy your **Project ID** and **API Key** to `.env.local`

## Step 2: Configure Authentication

1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication
3. Configure email templates (optional)
4. Set up email verification (recommended)

## Step 3: Create Database

1. Go to **Databases** → **Create Database**
2. Name it: `abdu-academy`
3. Copy the Database ID to `.env.local` as `APPWRITE_DATABASE_ID`

## Step 4: Create Collections

Run the setup script or manually create the following collections:

### Collection: `users`
- **userId** (string, required, indexed)
- **name** (string, required)
- **avatar** (string, optional)
- **role** (string, required, enum: student, instructor, admin)
- **createdAt** (datetime, required)
- **updatedAt** (datetime, required)

**Permissions:**
- Read: Users (own document)
- Create: Users
- Update: Users (own document)
- Delete: Users (own document)

### Collection: `courses`
- **courseId** (string, required)
- **title** (string, required, indexed)
- **slug** (string, required, unique, indexed)
- **description** (string, required)
- **shortDescription** (string, required)
- **price** (double, required)
- **currency** (string, required, default: "USD")
- **thumbnail** (string, optional)
- **category** (string, required, indexed)
- **level** (string, required, enum: beginner, intermediate, advanced)
- **instructorId** (string, required, indexed)
- **status** (string, required, enum: draft, published, archived)
- **totalDuration** (integer, required)
- **totalLessons** (integer, required)
- **createdAt** (datetime, required)
- **updatedAt** (datetime, required)
- **publishedAt** (datetime, optional)

**Permissions:**
- Read: Any (for published courses), Users (for own courses)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin, own courses)
- Delete: Users (role: admin)

### Collection: `modules`
- **moduleId** (string, required)
- **courseId** (string, required, indexed)
- **title** (string, required)
- **description** (string, optional)
- **order** (integer, required)
- **createdAt** (datetime, required)

**Permissions:**
- Read: Any (if course is published)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin)
- Delete: Users (role: instructor or admin)

### Collection: `lessons`
- **lessonId** (string, required)
- **moduleId** (string, required, indexed)
- **courseId** (string, required, indexed)
- **title** (string, required)
- **description** (string, optional)
- **videoUrl** (string, optional)
- **duration** (integer, required, in seconds)
- **order** (integer, required)
- **isFreePreview** (boolean, required, default: false)
- **resources** (string, optional, JSON array)
- **createdAt** (datetime, required)

**Permissions:**
- Read: Any (if isFreePreview or course purchased)
- Create: Users (role: instructor or admin)
- Update: Users (role: instructor or admin)
- Delete: Users (role: instructor or admin)

### Collection: `purchases`
- **purchaseId** (string, required)
- **userId** (string, required, indexed)
- **courseId** (string, required, indexed)
- **stripePaymentId** (string, required)
- **stripeSessionId** (string, required)
- **amount** (double, required)
- **currency** (string, required)
- **status** (string, required, enum: pending, completed, refunded)
- **purchasedAt** (datetime, required)

**Permissions:**
- Read: Users (own purchases)
- Create: Users
- Update: Users (role: admin)
- Delete: Users (role: admin)

### Collection: `progress`
- **progressId** (string, required)
- **userId** (string, required, indexed)
- **courseId** (string, required, indexed)
- **lessonId** (string, required, indexed)
- **completed** (boolean, required, default: false)
- **watchedSeconds** (integer, required, default: 0)
- **lastWatchedAt** (datetime, required)

**Permissions:**
- Read: Users (own progress)
- Create: Users
- Update: Users (own progress)
- Delete: Users (own progress)

### Collection: `reviews`
- **reviewId** (string, required)
- **userId** (string, required, indexed)
- **courseId** (string, required, indexed)
- **rating** (integer, required, min: 1, max: 5)
- **comment** (string, optional)
- **createdAt** (datetime, required)

**Permissions:**
- Read: Any
- Create: Users (must have purchased course)
- Update: Users (own review)
- Delete: Users (own review)

### Collection: `categories`
- **categoryId** (string, required)
- **name** (string, required)
- **slug** (string, required, unique)
- **description** (string, optional)
- **icon** (string, optional)
- **order** (integer, required)

**Permissions:**
- Read: Any
- Create: Users (role: admin)
- Update: Users (role: admin)
- Delete: Users (role: admin)

## Step 5: Create Indexes

For each collection, create indexes on frequently queried fields:

### courses
- `title` (fulltext)
- `slug` (unique)
- `category` (key)
- `instructorId` (key)
- `status` (key)

### modules
- `courseId` (key)

### lessons
- `moduleId` (key)
- `courseId` (key)

### purchases
- `userId` (key)
- `courseId` (key)
- `userId_courseId` (composite: userId, courseId)

### progress
- `userId` (key)
- `courseId` (key)
- `lessonId` (key)
- `userId_courseId` (composite: userId, courseId)

### reviews
- `userId` (key)
- `courseId` (key)

## Step 6: Storage Bucket (Optional)

If you want to use Appwrite Storage for some files:

1. Go to **Storage** → **Create Bucket**
2. Name: `course-files`
3. Enable file security
4. Set permissions as needed

Note: We're primarily using Cloudflare R2, but Appwrite Storage can be used as backup.
