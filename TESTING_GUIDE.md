# ABDU Academy - Testing Guide

This guide will help you test all the features of the platform step by step.

## Prerequisites

Before testing, ensure you have:

1. ✅ All environment variables set in `.env.local`
2. ✅ Appwrite project configured with collections
3. ✅ Cloudflare R2 bucket set up
4. ✅ Stripe account configured (test mode)
5. ✅ Development server running (`npm run dev`)

## Quick Start

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

## Testing Checklist

### 1. Authentication Testing

#### 1.1 User Registration
1. Navigate to `/register`
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123456!
3. Click "Register"
4. ✅ **Expected**: Success message, redirect to login

#### 1.2 User Login
1. Navigate to `/login`
2. Enter credentials from registration
3. Click "Login"
4. ✅ **Expected**: Redirected to dashboard, session created

#### 1.3 Password Reset
1. Navigate to `/forgot-password`
2. Enter registered email
3. Check email for reset link
4. ✅ **Expected**: Reset email received (if email configured)

**Test Accounts:**
- Student: `student@test.com` / `Test123456!`
- Instructor: `instructor@test.com` / `Test123456!`

---

### 2. Course Management Testing (Instructor)

#### 2.1 Create Course
1. Login as instructor
2. Navigate to `/instructor/courses`
3. Click "Create New Course"
4. Fill in course details:
   - Title: "Test Course"
   - Description: "This is a test course"
   - Category: Web Development
   - Level: Beginner
   - Price: $99.99
   - Upload thumbnail
5. Click "Create Course"
6. ✅ **Expected**: Course created, redirected to edit page

#### 2.2 Add Modules
1. On course edit page, click "Manage Curriculum"
2. Click "Add Module"
3. Enter:
   - Title: "Introduction"
   - Description: "Getting started"
4. Click "Create Module"
5. ✅ **Expected**: Module added to course

#### 2.3 Add Lessons
1. Expand a module
2. Click "Add Lesson"
3. Fill in:
   - Title: "Lesson 1"
   - Description: "First lesson"
   - Upload video
   - Duration: 600 (10 minutes)
   - Check "Free Preview" (optional)
4. Click "Create Lesson"
5. ✅ **Expected**: Lesson added to module

#### 2.4 Publish Course
1. Go back to course edit page
2. Change status to "Published"
3. Save changes
4. ✅ **Expected**: Course appears in public course listing

---

### 3. Course Browsing Testing (Public)

#### 3.1 Browse Courses
1. Navigate to `/courses`
2. ✅ **Expected**: See all published courses

#### 3.2 Filter Courses
1. Use category filter
2. Use level filter
3. Use price range slider
4. Use search bar
5. ✅ **Expected**: Courses filter correctly

#### 3.3 View Course Details
1. Click on any course card
2. ✅ **Expected**: 
   - Course detail page loads
   - Shows course overview
   - Shows curriculum preview
   - Shows reviews section
   - Shows purchase button

---

### 4. Payment Testing

#### 4.1 Stripe Test Setup
1. Ensure `STRIPE_SECRET_KEY` is set (test key)
2. Ensure `STRIPE_WEBHOOK_SECRET` is configured
3. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

#### 4.2 Test Purchase Flow
1. Login as student
2. Browse to a course detail page
3. Click "Buy Course"
4. ✅ **Expected**: Redirected to Stripe Checkout

#### 4.3 Stripe Test Cards
Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/25)
- Any 3-digit CVC
- Any postal code

#### 4.4 Complete Purchase
1. Enter test card: `4242 4242 4242 4242`
2. Complete checkout
3. ✅ **Expected**: 
   - Redirected to `/checkout/success`
   - Purchase record created
   - Course access granted

#### 4.5 Verify Purchase
1. Check `/dashboard/my-courses`
2. ✅ **Expected**: Purchased course appears
3. Check `/api/payments/history`
4. ✅ **Expected**: Purchase in history

---

### 5. Video Playback Testing

#### 5.1 Access Course Content
1. Login as student with purchased course
2. Navigate to `/learn/[course-slug]/lesson/[lesson-id]`
3. ✅ **Expected**: Lesson page loads

#### 5.2 Video Player Controls
1. Click play button
2. ✅ **Expected**: Video starts playing
3. Test controls:
   - Play/Pause (spacebar)
   - Seek forward/backward (← →)
   - Volume (↑ ↓)
   - Fullscreen (F)
   - Mute (M)
4. ✅ **Expected**: All controls work

#### 5.3 Progress Tracking
1. Watch video for 30 seconds
2. Refresh page
3. ✅ **Expected**: Video resumes from last position
4. Watch 80% of video
5. ✅ **Expected**: Lesson marked as completed

#### 5.4 Free Preview
1. Logout
2. Navigate to course with free preview lesson
3. Click on preview lesson
4. ✅ **Expected**: Can watch without purchase

---

### 6. Access Control Testing

#### 6.1 Unauthorized Access
1. Logout
2. Try to access `/learn/[course-slug]/lesson/[lesson-id]` (non-preview)
3. ✅ **Expected**: Redirected to login or access denied

#### 6.2 Purchased Course Access
1. Login with purchased course
2. Access lesson
3. ✅ **Expected**: Can watch video

#### 6.3 Video URL Security
1. Get signed URL from API
2. Wait 1 hour
3. Try to use expired URL
4. ✅ **Expected**: URL expired, new one required

---

### 7. API Testing

#### 7.1 Test Authentication Endpoints
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

#### 7.2 Test Course Endpoints
```bash
# List courses
curl http://localhost:3000/api/courses

# Get course by slug
curl http://localhost:3000/api/courses/test-course-slug
```

#### 7.3 Test Purchase Verification
```bash
# Verify purchase (requires auth cookie)
curl http://localhost:3000/api/payments/verify/[courseId] \
  --cookie "appwrite-session=YOUR_SESSION"
```

---

### 8. Common Issues & Troubleshooting

#### Issue: Registration fails
**Solution:**
- Check Appwrite Email/Password auth is enabled
- Verify environment variables are set
- Check browser console for errors

#### Issue: Payment webhook not working
**Solution:**
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/payments/webhook`
- Check `STRIPE_WEBHOOK_SECRET` matches CLI output
- Verify webhook endpoint is accessible

#### Issue: Video not loading
**Solution:**
- Check R2 credentials are correct
- Verify video file exists in R2 bucket
- Check signed URL generation
- Verify user has course access

#### Issue: Progress not saving
**Solution:**
- Check user is authenticated
- Verify progress API endpoint is working
- Check browser console for errors
- Verify Appwrite collections exist

#### Issue: Course not appearing
**Solution:**
- Check course status is "published"
- Verify course has modules and lessons
- Check filters on course listing page

---

### 9. Manual Test Scenarios

#### Scenario 1: Complete Student Journey
1. ✅ Register new account
2. ✅ Browse courses
3. ✅ View course details
4. ✅ Purchase course
5. ✅ Access course content
6. ✅ Watch videos
7. ✅ Track progress
8. ✅ Complete lessons

#### Scenario 2: Complete Instructor Journey
1. ✅ Register as instructor
2. ✅ Create course
3. ✅ Add modules
4. ✅ Add lessons with videos
5. ✅ Publish course
6. ✅ View course analytics (if implemented)

#### Scenario 3: Free Preview Flow
1. ✅ Browse courses (logged out)
2. ✅ View course with free preview
3. ✅ Watch preview lesson
4. ✅ Register to continue
5. ✅ Purchase course
6. ✅ Access full content

---

### 10. Automated Testing (Future)

For automated testing, consider:
- Jest for unit tests
- Playwright for E2E tests
- API testing with Supertest
- Component testing with React Testing Library

---

## Test Data Setup

### Create Test Courses
Use the instructor interface to create:
- 3-5 test courses
- Different categories
- Different price points
- Mix of free preview and paid lessons

### Create Test Users
- 2-3 student accounts
- 1-2 instructor accounts
- Test purchases with different courses

---

## Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Optimize performance
3. ✅ Add missing features
4. ✅ Prepare for production deployment
5. ✅ Set up production Stripe webhooks
6. ✅ Configure production R2 bucket
7. ✅ Set up monitoring and analytics

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify environment variables
4. Test API endpoints directly
5. Review documentation in `/docs` folder
