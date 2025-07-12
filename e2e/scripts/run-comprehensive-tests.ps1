# Comprehensive E2E Test Runner for Manetho
# This script runs authentication and feature testing on Firefox and Chrome

Write-Host "🚀 Starting Comprehensive E2E Tests for Manetho" -ForegroundColor Green

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
    Write-Host "  - Tests comprehensive authentication workflow" -ForegroundColor Gray
    Write-Host "  - Verifies authorization guards work properly" -ForegroundColor Gray
    Write-Host "  - Tests Community, Chat, AI Doubt Solver, Profile features" -ForegroundColor Gray
    Write-Host "  - Includes Video/Audio call testing" -ForegroundColor Gray
    Write-Host "  - Tests learning partner functionality" -ForegroundColor Gray
    Write-Host ""

    # Check if the app is already running
    Write-Host "🔍 Checking if development server is running..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Development server is running" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Development server not detected. Please start with 'npm run dev' first." -ForegroundColor Yellow
        Write-Host "   The tests will attempt to start the server automatically." -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "🧪 Running Comprehensive Authentication & Feature Tests..." -ForegroundColor Cyan

    # Run the comprehensive test suite on both browsers
    Write-Host "🌐 Testing on Firefox and Chrome browsers..." -ForegroundColor Blue
    
    # Run the main comprehensive test
    & npx playwright test e2e/tests/comprehensive-authentication-workflow.spec.ts --reporter=html

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Comprehensive E2E Tests completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Test Coverage:" -ForegroundColor Cyan
        Write-Host "  ✅ Authentication guards tested" -ForegroundColor Green
        Write-Host "  ✅ Public page accessibility verified" -ForegroundColor Green
        Write-Host "  ✅ Complete user workflow tested" -ForegroundColor Green
        Write-Host "  ✅ Community features verified" -ForegroundColor Green
        Write-Host "  ✅ Chat and call functionality tested" -ForegroundColor Green
        Write-Host "  ✅ AI Doubt Solver tested" -ForegroundColor Green
        Write-Host "  ✅ Profile and learning partner features tested" -ForegroundColor Green
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
Write-Host "🎯 Authentication & Feature Testing Complete!" -ForegroundColor Magenta
Write-Host "   Your application's security and functionality have been verified." -ForegroundColor Gray 