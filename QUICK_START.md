# Quick Start Guide - ABDU Academy

Get up and running in 5 minutes!

## Step 1: Verify Setup

Run the setup verification script:

```bash
npm run test-setup
```

This will check:
- ✅ Node.js and npm installed
- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Appwrite connection
- ✅ Stripe configuration
- ✅ R2 configuration

## Step 2: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: Quick Test Flow

### Test Authentication
1. Go to `/register`
2. Create a test account
3. Login at `/login`

### Test Course Creation (Instructor)
1. Login with instructor account
2. Go to `/instructor/courses`
3. Create a new course
4. Add modules and lessons
5. Publish the course

### Test Course Purchase (Student)
1. Login with student account
2. Browse courses at `/courses`
3. Click on a course
4. Click "Buy Course"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete purchase

### Test Video Playback
1. After purchase, go to `/dashboard/my-courses`
2. Click "Start Learning"
3. Select a lesson
4. Video should play with progress tracking

## Step 4: Test Stripe Webhooks (Local)

In a separate terminal:

```bash
# Install Stripe CLI if not installed
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the webhook signing secret and add to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Common Test Accounts

Create these accounts for testing:

**Student:**
- Email: `student@test.com`
- Password: `Test123456!`

**Instructor:**
- Email: `instructor@test.com`
- Password: `Test123456!`
- Note: You'll need to manually set role to "instructor" in Appwrite

## Stripe Test Cards

| Card Number | Purpose |
|------------|---------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date, any CVC, any postal code.

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify all dependencies: `npm install`
- Check environment variables are set

### Registration fails
- Verify Appwrite Email/Password auth is enabled
- Check `APPWRITE_API_KEY` is correct
- Check browser console for errors

### Payment webhook not working
- Ensure Stripe CLI is running
- Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
- Check webhook endpoint logs

### Video not loading
- Verify R2 credentials
- Check video file exists in R2 bucket
- Verify user has course access

## Next Steps

1. ✅ Complete the quick test flow above
2. ✅ Read `TESTING_GUIDE.md` for comprehensive testing
3. ✅ Check `STRIPE_SETUP.md` for payment configuration
4. ✅ Review `APPWRITE_SETUP_CHECKLIST.md` for database setup

## Need Help?

- Check `TESTING_GUIDE.md` for detailed testing instructions
- Review error messages in browser console
- Check server logs in terminal
- Verify environment variables are correct
