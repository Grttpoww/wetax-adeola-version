# Auto-Build Script für development-adeola
# Dieses Script umgeht interaktive Prompts

Write-Host "Starting EAS Build..." -ForegroundColor Cyan

# Setze Environment-Variablen
$env:EXPO_NO_DOTENV = "1"

# Versuche Build mit automatischen Credentials
Write-Host "Attempting build with automatic credential setup..." -ForegroundColor Yellow

# Starte Build - EAS sollte Credentials automatisch vom Server holen
# wenn sie bereits für dieses Bundle ID existieren
cd $PSScriptRoot
npx eas-cli build --profile development-adeola --platform ios --non-interactive

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed. Credentials need to be set up first." -ForegroundColor Red
    Write-Host "Run this command manually to set up credentials:" -ForegroundColor Yellow
    Write-Host "  eas credentials --platform ios" -ForegroundColor Cyan
    Write-Host "`nThen run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nBuild started successfully!" -ForegroundColor Green




