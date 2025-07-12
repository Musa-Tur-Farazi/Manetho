# Playwright E2E Test Runner for Windows
# Usage: .\run-tests.ps1 [options]

param(
    [string]$Browser = "chromium",
    [switch]$Headed,
    [switch]$Debug,
    [switch]$UI,
    [switch]$Record,
    [switch]$Trace,
    [string]$Test = ""
)

Write-Host "🎭 Playwright E2E Test Runner" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Build the command
$cmd = "npx playwright test"

if ($Test) {
    $cmd += " $Test"
}

if ($Browser -ne "all") {
    $cmd += " --project=$Browser"
}

if ($Headed) {
    $cmd += " --headed"
    Write-Host "🖥️  Running in headed mode (browser visible)" -ForegroundColor Green
}

if ($Debug) {
    $cmd += " --debug"
    Write-Host "🐛 Running in debug mode" -ForegroundColor Yellow
}

if ($UI) {
    $cmd += " --ui"
    Write-Host "🎨 Opening Playwright UI" -ForegroundColor Magenta
}

if ($Record) {
    $cmd += " --video=on"
    Write-Host "📹 Recording videos for all tests" -ForegroundColor Blue
}

if ($Trace) {
    $cmd += " --trace=on"
    Write-Host "🔍 Recording traces for all tests" -ForegroundColor Blue
}

Write-Host "Command: $cmd" -ForegroundColor Gray
Write-Host ""

# Execute the command
try {
    Invoke-Expression $cmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tests completed successfully!" -ForegroundColor Green
        
        # Open reports if available
        if (Test-Path "playwright-report") {
            $openReport = Read-Host "Open test report? (y/n)"
            if ($openReport -eq "y" -or $openReport -eq "Y") {
                npx playwright show-report
            }
        }
    } else {
        Write-Host "❌ Tests failed!" -ForegroundColor Red
        
        # Open reports for failed tests
        if (Test-Path "playwright-report") {
            Write-Host "📊 Opening test report..." -ForegroundColor Yellow
            npx playwright show-report
        }
    }
} catch {
    Write-Host "💥 Error running tests: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Available options:" -ForegroundColor Cyan
Write-Host "  -Browser chrome|firefox|all (default: chromium)" -ForegroundColor Gray
Write-Host "  -Headed (show browser window)" -ForegroundColor Gray
Write-Host "  -Debug (debug mode with step-through)" -ForegroundColor Gray
Write-Host "  -UI (open Playwright UI)" -ForegroundColor Gray
Write-Host "  -Record (record videos)" -ForegroundColor Gray
Write-Host "  -Trace (record traces)" -ForegroundColor Gray
Write-Host "  -Test 'test-name' (run specific test)" -ForegroundColor Gray
Write-Host ""
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host "  .\run-tests.ps1 -Browser firefox -Headed" -ForegroundColor Gray
Write-Host "  .\run-tests.ps1 -Debug -Test 'authentication'" -ForegroundColor Gray
Write-Host "  .\run-tests.ps1 -UI" -ForegroundColor Gray 