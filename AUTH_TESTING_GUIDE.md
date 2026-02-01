# Authentication Testing Guide

## Prerequisites

Before testing authentication, make sure:

1. **Email/Password Authentication is Enabled in Appwrite**
   - Go to https://fra.cloud.appwrite.io
   - Select your project: "abdu Project"
   - Go to **Auth** → **Settings**
   - Enable **Email/Password** authentication
   - Save changes

2. **Dev Server is Running**
   ```bash
   npm run dev
   ```

## Testing Authentication

### Option 1: Automated Test Script

Run the automated test suite:

```bash
npm run test-auth
```

This will test:
- ✅ User registration
- ✅ Duplicate email rejection
- ✅ Invalid login rejection
- ✅ User login
- ✅ Session validation
- ✅ User logout

### Option 2: Manual Testing with curl

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

**Check session:**
```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

### Option 3: Test via Frontend Pages

1. **Register:**
   - Go to http://localhost:3000/register
   - Fill in the form and submit

2. **Login:**
   - Go to http://localhost:3000/login
   - Enter credentials and submit

3. **Check Dashboard:**
   - After login, you should be redirected to /dashboard
   - Check if your profile loads correctly

## Common Issues

### Error: 500 Internal Server Error

**Possible causes:**
1. Email/Password auth not enabled in Appwrite Console
2. API key doesn't have correct permissions
3. Environment variables not set correctly

**Solution:**
- Check Appwrite Console → Auth → Settings
- Verify `.env.local` has correct values
- Check server logs for detailed error messages

### Error: 401 Unauthorized

**Possible causes:**
1. Invalid credentials
2. User doesn't exist
3. Session expired

**Solution:**
- Verify email/password are correct
- Try registering a new user first

### Error: 409 Conflict

**Possible causes:**
1. User already exists

**Solution:**
- This is expected when trying to register with an existing email
- Use a different email or login instead

## Next Steps

Once authentication is working:
- ✅ Test user profile management
- ✅ Test password reset flow
- ✅ Test role-based access (instructor/admin)
- ✅ Continue with course management features
