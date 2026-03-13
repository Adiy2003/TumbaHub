@echo off

echo.
echo 🔧 Setting up TumbaHub...
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Generate Prisma client
echo 🔨 Generating Prisma client...
call npx prisma generate

REM Create database and run migrations
echo 🗄️  Creating database and running migrations...
call npx prisma migrate dev --name init

REM Seed database with sample data
echo 🌱 Seeding database...
call npx tsx prisma/seed.ts

echo.
echo ✅ Setup complete! Run 'npm run dev' to start the dev server.
echo.
pause
