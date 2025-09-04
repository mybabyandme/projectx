#!/bin/bash

# Vercel Build Script for AgileTrack Pro
echo "🚀 Starting AgileTrack Pro build process..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Build Next.js application
echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"