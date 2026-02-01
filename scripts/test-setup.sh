#!/bin/bash

# ABDU Academy - Quick Test Setup Script
# This script helps verify your setup before testing

echo "🔍 ABDU Academy - Setup Verification"
echo "====================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Check .env.local
echo ""
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check required variables
    REQUIRED_VARS=(
        "NEXT_PUBLIC_APPWRITE_ENDPOINT"
        "NEXT_PUBLIC_APPWRITE_PROJECT_ID"
        "APPWRITE_API_KEY"
        "APPWRITE_DATABASE_ID"
        "R2_ACCOUNT_ID"
        "R2_ACCESS_KEY_ID"
        "R2_SECRET_ACCESS_KEY"
        "R2_BUCKET_NAME"
        "STRIPE_SECRET_KEY"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo "✅ All required environment variables are set"
    else
        echo "⚠️  Missing environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "   - $var"
        done
    fi
else
    echo "❌ .env.local file not found"
    echo "   Please create .env.local from .env.example"
    exit 1
fi

# Check dependencies
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  node_modules not found. Run: npm install"
fi

# Check Appwrite connection
echo ""
echo "🔌 Testing Appwrite connection..."
if [ -f ".env.local" ]; then
    source .env.local
    if [ ! -z "$NEXT_PUBLIC_APPWRITE_ENDPOINT" ] && [ ! -z "$APPWRITE_API_KEY" ]; then
        echo "✅ Appwrite endpoint configured"
        echo "   Endpoint: $NEXT_PUBLIC_APPWRITE_ENDPOINT"
    else
        echo "⚠️  Appwrite configuration incomplete"
    fi
fi

# Check Stripe
echo ""
echo "💳 Checking Stripe configuration..."
if [ -f ".env.local" ]; then
    source .env.local
    if [ ! -z "$STRIPE_SECRET_KEY" ]; then
        if [[ "$STRIPE_SECRET_KEY" == *"sk_test"* ]]; then
            echo "✅ Stripe test key configured"
        elif [[ "$STRIPE_SECRET_KEY" == *"sk_live"* ]]; then
            echo "⚠️  Stripe LIVE key detected (use test key for development)"
        else
            echo "⚠️  Stripe key format unrecognized"
        fi
    else
        echo "⚠️  Stripe secret key not set"
    fi
fi

# Check R2
echo ""
echo "☁️  Checking Cloudflare R2 configuration..."
if [ -f ".env.local" ]; then
    source .env.local
    if [ ! -z "$R2_ACCOUNT_ID" ] && [ ! -z "$R2_ACCESS_KEY_ID" ] && [ ! -z "$R2_BUCKET_NAME" ]; then
        echo "✅ R2 configuration found"
    else
        echo "⚠️  R2 configuration incomplete"
    fi
fi

# Summary
echo ""
echo "====================================="
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Follow TESTING_GUIDE.md for testing"
echo ""
