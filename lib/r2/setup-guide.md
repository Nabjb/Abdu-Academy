# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for ABDU Academy file storage.

## Step 1: Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2** → **Create bucket**
3. Name your bucket: `abdu-academy-storage` (or your preferred name)
4. Choose a location (recommended: closest to your users)
5. Click **Create bucket**

## Step 2: Generate API Tokens

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read & Write** (for full access)
   - Or create separate tokens for read/write operations
4. Copy the following:
   - **Account ID** (found in R2 dashboard URL or account settings)
   - **Access Key ID**
   - **Secret Access Key**

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=abdu-academy-storage
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Note:** `R2_PUBLIC_URL` is optional and only needed if you want to serve public files directly from R2.

## Step 4: Configure CORS (for Browser Uploads)

If you want to allow direct browser uploads to R2:

1. Go to your R2 bucket → **Settings** → **CORS Policy**
2. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**Important:** Replace `yourdomain.com` with your actual production domain.

## Step 5: Folder Structure

The R2 bucket will use the following folder structure:

```
abdu-academy-storage/
├── videos/          # Course video files
├── images/          # General images
├── thumbnails/      # Course thumbnails
└── resources/       # PDFs, code files, etc.
```

This structure is automatically created when files are uploaded.

## Step 6: Test the Setup

You can test the R2 connection by running:

```bash
npm run dev
```

Then make a test API call to upload a file.

## Security Best Practices

1. **Never commit API keys to git** - Always use `.env.local` (already in `.gitignore`)
2. **Use signed URLs** - For secure file access, always use signed URLs with expiration
3. **Set appropriate expiry times** - Signed URLs default to 1 hour, adjust as needed
4. **Restrict CORS origins** - Only allow your actual domains in CORS policy
5. **Use environment-specific buckets** - Consider separate buckets for dev/staging/production

## File Upload Flow

1. **Server-side upload** (recommended for videos):
   - File uploaded to Next.js API route
   - API route uploads to R2
   - Returns R2 key/path

2. **Client-side upload** (for smaller files):
   - Generate signed upload URL from API
   - Client uploads directly to R2 using signed URL
   - More efficient for large files

3. **File access**:
   - Generate signed download URL (1-hour expiry)
   - Serve URL to authenticated users only
   - Verify purchase before granting access

## Troubleshooting

### Error: "Access Denied"
- Check that your API tokens have correct permissions
- Verify bucket name matches exactly
- Ensure account ID is correct

### Error: "Invalid endpoint"
- Verify R2_ACCOUNT_ID is correct
- Check that endpoint URL format is correct

### CORS errors in browser
- Verify CORS policy includes your domain
- Check that allowed methods include the method you're using
- Ensure credentials are not being sent if not configured
