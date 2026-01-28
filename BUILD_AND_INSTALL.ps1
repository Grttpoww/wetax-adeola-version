# ========================================
# WETAX - EAS Build and Install
# ========================================
# This builds the app via EAS and gives you install link

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WETAX - EAS BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "[1/4] Checking EAS login..." -ForegroundColor Yellow
$expoPath = Join-Path $PSScriptRoot "Wetax-master"
Set-Location $expoPath

try {
    $loginCheck = npx eas whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Not logged in. Please login:" -ForegroundColor Yellow
        Write-Host "  npx eas login" -ForegroundColor White
        Write-Host ""
        Write-Host "Or run this command manually:" -ForegroundColor Yellow
        Write-Host "  cd Wetax-master" -ForegroundColor White
        Write-Host "  npx eas login" -ForegroundColor White
        Write-Host "  npx eas build --profile development --platform ios" -ForegroundColor White
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✓ Logged in to EAS" -ForegroundColor Green
} catch {
    Write-Host "ERROR checking login: $_" -ForegroundColor Red
    Write-Host "Run: npx eas login" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check expo-dev-client
Write-Host "[2/4] Checking expo-dev-client..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not ($packageJson.dependencies.PSObject.Properties.Name -contains "expo-dev-client")) {
    Write-Host "Installing expo-dev-client..." -ForegroundColor Yellow
    npm install expo-dev-client
    Write-Host "✓ expo-dev-client installed" -ForegroundColor Green
} else {
    Write-Host "✓ expo-dev-client already installed" -ForegroundColor Green
}
Write-Host ""

# Update API URL for local dev
Write-Host "[3/4] Updating API URL for local development..." -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "172.20.*" -or $_.IPAddress -like "192.168.*" } | Select-Object -First 1 -ExpandProperty IPAddress)
if ($ip) {
    $apiUrl = "http://${ip}:3000"
    $openapiPath = Join-Path $expoPath "src\shared\openapi.ts"
    if (Test-Path $openapiPath) {
        $content = Get-Content $openapiPath -Raw
        $content = $content -replace "(export const API_URL\s*=\s*)[^\r\n]+[\r\n]+[^\r\n]+", "`$1'$apiUrl' // Auto-updated for EAS dev build"
        Set-Content $openapiPath -Value $content -NoNewline
        Write-Host "✓ API URL set to: $apiUrl" -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: Could not detect IP. Make sure iPhone hotspot is connected." -ForegroundColor Yellow
}
Write-Host ""

# Start backend
Write-Host "[4/4] Starting backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "Wetax-app-server-main"
if (Test-Path $backendPath) {
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
    Write-Host "✓ Backend started in separate window" -ForegroundColor Green
    Start-Sleep -Seconds 5
} else {
    Write-Host "WARNING: Backend path not found. Start it manually." -ForegroundColor Yellow
}
Write-Host ""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  READY TO BUILD" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Building iOS development build via EAS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Build the app on EAS servers (takes 10-20 minutes)" -ForegroundColor White
Write-Host "  2. Give you a download link or TestFlight link" -ForegroundColor White
Write-Host "  3. Install the app on your iPhone" -ForegroundColor White
Write-Host "  4. App will connect to your local backend automatically" -ForegroundColor White
Write-Host ""
Write-Host "Starting build now..." -ForegroundColor Cyan
Write-Host ""

# Build
npx eas build --profile development --platform ios --non-interactive

Write-Host ""
Write-Host "Build started! Check the EAS dashboard or wait for the link." -ForegroundColor Green
Write-Host ""
Write-Host "To check build status:" -ForegroundColor Yellow
Write-Host "  npx eas build:list" -ForegroundColor White
Write-Host ""
Write-Host "Once built, install the app and it will connect to your local backend." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"




