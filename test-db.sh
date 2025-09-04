#!/bin/bash

echo "🔍 Testing database connection..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

# Test database connection
echo "📡 Attempting to connect to database..."
if npx prisma db pull --preview-feature 2>/dev/null; then
    echo "✅ Database connection successful!"
    echo "🔄 Running migrations..."
    npx prisma migrate dev --name init
else
    echo "❌ Database connection failed!"
    echo ""
    echo "Common issues:"
    echo "1. Database server is not running"
    echo "2. Wrong credentials in DATABASE_URL"
    echo "3. Database 'agiletrack_pro' doesn't exist"
    echo "4. Firewall blocking connection"
    echo ""
    echo "Please check your DATABASE_URL in .env.local"
fi