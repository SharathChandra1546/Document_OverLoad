# DocuMind Development Environment Setup for Windows (PowerShell)
# Usage: .\setup-windows.ps1

Write-Host "DocuMind Development Environment Setup for Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check Node.js
if (Test-Command "node") {
    Write-Host "✅ Node.js is available" -ForegroundColor Green
    $nodeVersion = node --version
    Write-Host "   Version: $nodeVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
if (Test-Command "npm") {
    Write-Host "✅ npm is available" -ForegroundColor Green
    $npmVersion = npm --version
    Write-Host "   Version: $npmVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host ""
Write-Host "Checking Python installation..." -ForegroundColor Yellow
if (Test-Command "python") {
    Write-Host "✅ Python is available" -ForegroundColor Green
    $pythonVersion = python --version
    Write-Host "   $pythonVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Python is not installed" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install Flask backend dependencies
Write-Host ""
Write-Host "Installing Flask backend dependencies..." -ForegroundColor Yellow
try {
    Set-Location -Path "flask-backend"
    pip install -r requirements.txt
    Write-Host "✅ Flask backend dependencies installed successfully" -ForegroundColor Green
    Set-Location -Path ".."
} catch {
    Write-Host "❌ Failed to install Flask backend dependencies" -ForegroundColor Red
    Set-Location -Path ".."
}

# Create .env files
Write-Host ""
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local file created" -ForegroundColor Green
    Write-Host "⚠️  Please update the .env.local file with your API keys" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

if (-not (Test-Path "flask-backend\.env")) {
    Write-Host "Creating flask-backend\.env file from template..." -ForegroundColor Yellow
    Copy-Item "flask-backend\.env.example" "flask-backend\.env"
    Write-Host "✅ flask-backend\.env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update the flask-backend\.env file with your API keys" -ForegroundColor Yellow
} else {
    Write-Host "✅ flask-backend\.env file already exists" -ForegroundColor Green
}

# Create uploads directory
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
    Write-Host "✅ Created uploads directory" -ForegroundColor Green
} else {
    Write-Host "✅ uploads directory already exists" -ForegroundColor Green
}

# Create uploads directory for Flask backend
if (-not (Test-Path "flask-backend\uploads")) {
    New-Item -ItemType Directory -Path "flask-backend\uploads" -Force | Out-Null
    Write-Host "✅ Created flask-backend\uploads directory" -ForegroundColor Green
} else {
    Write-Host "✅ flask-backend\uploads directory already exists" -ForegroundColor Green
}

# Check PostgreSQL
Write-Host ""
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
if (Test-Command "psql") {
    Write-Host "✅ PostgreSQL is available" -ForegroundColor Green
    $psqlVersion = psql --version
    Write-Host "   $psqlVersion" -ForegroundColor Gray
    
    # Check if PostgreSQL service is running
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        if ($pgService.Status -eq "Running") {
            Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PostgreSQL service is not running" -ForegroundColor Yellow
            Write-Host "   Start with: Start-Service $($pgService.Name)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ PostgreSQL not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "And add it to your PATH: C:\Program Files\PostgreSQL\15\bin" -ForegroundColor Yellow
}

# Check Docker
Write-Host ""
Write-Host "Checking Docker Desktop..." -ForegroundColor Yellow
if (Test-Command "docker") {
    Write-Host "✅ Docker is available" -ForegroundColor Green
    $dockerVersion = docker --version
    Write-Host "   $dockerVersion" -ForegroundColor Gray
    
    # Check if Docker is running
    try {
        docker info | Out-Null
        Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Docker Desktop is not running" -ForegroundColor Yellow
        Write-Host "   Please start Docker Desktop" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
}

# Build the project
Write-Host ""
Write-Host "Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Project built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setup completed! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Update .env.local file with your API keys" -ForegroundColor White
Write-Host "2. Update flask-backend\.env file with your API keys" -ForegroundColor White
Write-Host "3. Start PostgreSQL service: Start-Service postgresql-x64-15" -ForegroundColor White
Write-Host "4. Create database: createdb -U postgres documind" -ForegroundColor White
Write-Host "5. Initialize schema: psql -U postgres -h localhost -d documind -f src/lib/database/schema.sql" -ForegroundColor White
Write-Host "6. Start Milvus: docker-compose up -d milvus-etcd milvus-minio milvus-standalone" -ForegroundColor White
Write-Host "7. Start Flask backend: cd flask-backend && python app.py" -ForegroundColor White
Write-Host "8. Start frontend: npm run dev" -ForegroundColor White
Write-Host "9. Test setup: node scripts/test-database.js" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEVELOPMENT_SETUP.md" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Offer to run tests
Write-Host ""
$runTests = Read-Host "Would you like to run the database tests now? (y/N)"
if ($runTests -eq "y" -or $runTests -eq "Y") {
    Write-Host ""
    Write-Host "Running PostgreSQL test..." -ForegroundColor Yellow
    node scripts/test-postgres.js
    
    Write-Host ""
    Write-Host "Running Milvus test..." -ForegroundColor Yellow
    node scripts/test-milvus.js
}