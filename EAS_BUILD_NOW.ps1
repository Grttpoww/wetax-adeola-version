# ========================================
# WETAX - Quick EAS Build
# ========================================
# Just builds the app. That's it.

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILDING APP VIA EAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$expoPath = Join-Path $PSScriptRoot "Wetax-master"
Set-Location $expoPath

Write-Host "Starting EAS build (development profile, iOS)..." -ForegroundColor Yellow
Write-Host "This takes 10-20 minutes. You'll get a download link when done." -ForegroundColor White
Write-Host ""

npx eas build --profile development --platform ios

Write-Host ""
Write-Host "Build complete! Install the app and it will work." -ForegroundColor Green
Read-Host "Press Enter to close"




