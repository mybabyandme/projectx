#!/bin/bash

# AgileTrack Pro Setup Script
echo "🚀 Setting up AgileTrack Pro..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your database credentials and other settings"
    echo ""
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npx prisma db pull --preview-feature 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env.local"
    echo ""
fi

# Run migrations
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Database migrations failed. Please check your database connection"
fi

# Optional: Seed database
read -p "🌱 Would you like to seed the database with demo data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    if npm run db:seed; then
        echo "✅ Database seeded successfully"
        echo ""
        echo "Demo credentials:"
        echo "Email: demo@agiletrack.com"
        echo "Password: password123"
        echo "Organization: demo-organization"
    else
        echo "⚠️  Database seeding failed"
    fi
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation: ./docs/"
echo "🐛 Issues: Check the README.md for troubleshooting"