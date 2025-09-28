@echo off
echo DocuMind Development Environment Setup for Windows
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available
npm --version

REM Install dependencies
echo.
echo Installing npm dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please update the .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

REM Create uploads directory
if not exist uploads (
    mkdir uploads
    echo ✅ Created uploads directory
) else (
    echo ✅ uploads directory already exists
)

REM Check PostgreSQL
echo.
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL not found in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo And add it to your PATH: C:\Program Files\PostgreSQL\15\bin
) else (
    echo ✅ PostgreSQL is available
    psql --version
)

REM Check Docker
echo.
echo Checking Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
) else (
    echo ✅ Docker is available
    docker --version
)

REM Build the project
echo.
echo Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Project built successfully

echo.
echo ================================================
echo Setup completed! Next steps:
echo.
echo 1. Update .env file with your database credentials
echo 2. Start PostgreSQL service: net start postgresql-x64-15
echo 3. Create database: createdb -U postgres documind
echo 4. Initialize schema: psql -U postgres -h localhost -d documind -f src/lib/database/schema.sql
echo 5. Start Milvus: docker-compose up -d milvus-etcd milvus-minio milvus-standalone
echo 6. Test setup: node scripts/test-database.js
echo 7. Start development: npm run dev
echo.
echo For detailed instructions, see DEVELOPMENT_SETUP.md
echo ================================================
pause