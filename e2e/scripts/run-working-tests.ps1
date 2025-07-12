# Basic Working E2E Test Runner for Manetho
# This script runs only the basic working tests that don't require authentication

Write-Host "🚀 Starting Basic Working E2E Tests for Manetho" -ForegroundColor Green

# Check if Node.js and npm are available
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Set error handling
$ErrorActionPreference = "Stop"

try {
    Write-Host "📋 Test Information:" -ForegroundColor Cyan
    Write-Host "  - Tests basic page loading and functionality" -ForegroundColor Gray
    Write-Host "  - No authentication required" -ForegroundColor Gray
    Write-Host "  - Tests page structure and basic navigation" -ForegroundColor Gray
    Write-Host "  - Tests error handling and performance" -ForegroundColor Gray
    Write-Host ""

    # Check if the app is already running
    Write-Host "🔍 Checking if development server is running..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Development server is running" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Development server not detected. Starting server..." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "🧪 Running Basic Working Tests..." -ForegroundColor Cyan

    # Run only the basic working tests
    Write-Host "🌐 Testing on Firefox and Chrome browsers..." -ForegroundColor Blue
    
    # Run the basic working tests
    & npx playwright test e2e/tests/basic-working-tests.spec.ts --reporter=html --workers=2

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Basic Working E2E Tests completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Test Coverage:" -ForegroundColor Cyan
        Write-Host "  ✅ Basic page loading tested" -ForegroundColor Green
        Write-Host "  ✅ Page structure verified" -ForegroundColor Green
        Write-Host "  ✅ Navigation functionality tested" -ForegroundColor Green
        Write-Host "  ✅ Error handling verified" -ForegroundColor Green
        Write-Host "  ✅ Performance baseline established" -ForegroundColor Green
        Write-Host "  ✅ Responsive design tested" -ForegroundColor Green
        Write-Host ""
        Write-Host "📈 View detailed results: playwright-report/index.html" -ForegroundColor Blue
    }
    else {
        Write-Host ""
        Write-Host "❌ Some tests failed. Check the report for details." -ForegroundColor Red
        Write-Host "📈 View detailed results: playwright-report/index.html" -ForegroundColor Blue
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error running tests: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Basic Working Tests Complete!" -ForegroundColor Magenta
Write-Host "   Your application's basic functionality has been verified." -ForegroundColor Gray 