# Appwrite Setup Scripts

This directory contains scripts to help set up and verify your Appwrite configuration.

## Scripts

### 1. `verify-appwrite.mjs`

Verifies your Appwrite configuration and checks if all collections exist.

**Usage:**
```bash
npm run verify-appwrite
```

**What it does:**
- Checks if environment variables are set
- Tests database connection
- Lists existing collections
- Shows which collections are missing

### 2. `setup-appwrite-collections.mjs`

Automatically creates all required collections, attributes, indexes, and permissions.

**Usage:**
```bash
npm run setup-appwrite
```

**What it does:**
- Creates 8 collections (users, courses, modules, lessons, purchases, progress, reviews, categories)
- Creates all attributes for each collection
- Creates all indexes
- Sets up permissions

**Prerequisites:**
- Appwrite project created
- Database created
- API key with Databases (Read, Write) permissions
- Environment variables configured in `.env.local`

**Note:** This script is idempotent - you can run it multiple times safely. It will skip existing collections/attributes/indexes.

## Environment Variables Required

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
```

## Setup Workflow

1. **Create Appwrite Project**
   - Go to Appwrite Console
   - Create project
   - Copy Project ID

2. **Get API Key**
   - Go to Settings → API Keys
   - Create API key with Databases (Read, Write) permissions
   - Copy API key

3. **Create Database**
   - Go to Databases → Create Database
   - Name: `abdu-academy`
   - Copy Database ID

4. **Configure Environment**
   - Add all values to `.env.local`

5. **Run Setup Script**
   ```bash
   npm run setup-appwrite
   ```

6. **Verify Setup**
   ```bash
   npm run verify-appwrite
   ```

## Collections Created

The setup script creates the following collections:

1. **users** - User profiles
2. **courses** - Course data
3. **modules** - Course modules
4. **lessons** - Course lessons
5. **purchases** - Purchase records
6. **progress** - Learning progress
7. **reviews** - Course reviews
8. **categories** - Course categories

Each collection includes:
- All required attributes
- Proper indexes for performance
- Appropriate permissions

## Troubleshooting

### Authentication Failed
- Check your API key is correct
- Ensure API key has Databases (Read, Write) permissions
- Verify API key is in `.env.local` (not `.env`)

### Database Not Found
- Create database in Appwrite Console first
- Verify Database ID in `.env.local`

### Collection Already Exists
- The script will skip existing collections
- To recreate, delete collection in Appwrite Console first

### Rate Limiting
- The script includes delays to avoid rate limits
- If you see rate limit errors, wait a few minutes and retry
