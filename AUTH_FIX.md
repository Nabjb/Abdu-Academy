# Authentication Fix Guide

## The Problem

You're getting "Internal Server Error" because **Email/Password authentication is not enabled** in your Appwrite project.

## Solution: Enable Email/Password Authentication

### Step 1: Go to Appwrite Console
1. Open https://fra.cloud.appwrite.io
2. Login to your account
3. Select project: **"abdu Project"** (ID: 697f7ca800280eb1de06)

### Step 2: Enable Email/Password Auth
1. Click on **"Auth"** in the left sidebar
2. Click on **"Settings"** tab
3. Find **"Email/Password"** in the providers list
4. Click the toggle to **enable** it
5. Click **"Update"** or **"Save"** button

### Step 3: Verify
After enabling, try registering again:
- Go to http://localhost:3000/register
- Fill in the form and submit
- It should work now!

## Alternative: Check Current Status

If you want to verify if Email/Password is enabled:
1. Go to Appwrite Console → Auth → Settings
2. Look for "Email/Password" provider
3. It should show as "Enabled" (green toggle)

## Why This Happens

Appwrite requires you to explicitly enable authentication providers before they can be used. By default, no providers are enabled for security reasons.

## After Enabling

Once Email/Password is enabled:
- ✅ Registration will work
- ✅ Login will work  
- ✅ Password reset will work
- ✅ All auth endpoints will function

## Still Not Working?

If you've enabled Email/Password but still get errors:

1. **Check API Key Scopes:**
   - Go to Settings → API Keys
   - Make sure your API key has:
     - ✅ Users (Read, Write)
     - ✅ Sessions (Read, Write)

2. **Check Environment Variables:**
   ```bash
   # Make sure .env.local has:
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=697f7ca800280eb1de06
   APPWRITE_API_KEY=your_actual_api_key_here
   APPWRITE_DATABASE_ID=697f7ecf000d467b58db
   ```

3. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

## Quick Test

After enabling Email/Password, test with:

```bash
npm run test-auth
```

This will run automated tests to verify everything works.
