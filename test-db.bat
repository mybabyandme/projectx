@echo off
echo 🔍 Testing database connection...

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local not found. Please create it first.
    pause
    exit /b 1
)

REM Test database connection
echo 📡 Attempting to connect to database...
call npx prisma db pull --preview-feature >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Database connection failed!
    echo.
    echo Common issues:
    echo 1. Database server is not running
    echo 2. Wrong credentials in DATABASE_URL
    echo 3. Database 'agiletrack_pro' doesn't exist
    echo 4. Firewall blocking connection
    echo.
    echo Please check your DATABASE_URL in .env.local
    pause
    exit /b 1
) else (
    echo ✅ Database connection successful!
    echo 🔄 Running migrations...
    call npx prisma migrate dev --name init
)
pause