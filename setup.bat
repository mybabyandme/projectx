@echo off
echo 🚀 Setting up AgileTrack Pro...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node -v

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚙️ Creating .env.local from template...
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your database credentials and other settings
    echo.
)

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

REM Run migrations
echo 🔄 Running database migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ⚠️  Database migrations failed. Please check your database connection
) else (
    echo ✅ Database migrations completed
)

REM Optional: Seed database
set /p seed="🌱 Would you like to seed the database with demo data? (y/N): "
if /i "%seed%"=="y" (
    echo 🌱 Seeding database...
    call npm run db:seed
    if %errorlevel% neq 0 (
        echo ⚠️  Database seeding failed
    ) else (
        echo ✅ Database seeded successfully
        echo.
        echo Demo credentials:
        echo Email: demo@agiletrack.com
        echo Password: password123
        echo Organization: demo-organization
    )
)

echo.
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Update .env.local with your configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 Documentation: ./docs/
echo 🐛 Issues: Check the README.md for troubleshooting
pause