#!/bin/bash

echo "🔧 Setting up TumbaHub..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Create database and run migrations
echo "🗄️  Creating database and running migrations..."
npx prisma migrate dev --name init

# Seed database with sample data
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo "✅ Setup complete! Run 'npm run dev' to start the dev server."
