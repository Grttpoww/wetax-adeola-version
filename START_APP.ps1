Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WETAX - EINFACHER START" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend starten
Write-Host "[1/3] Starte Backend-Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "Wetax-app-server-main"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "[2/3] Warte auf Backend (10 Sekunden)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Frontend starten
Write-Host "[3/3] Starte Frontend (Web-Version)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "Wetax-master"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run web" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  FERTIG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8081 (wird automatisch geoeffnet)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Warte 15-20 Sekunden, dann sollte der Browser sich oeffnen." -ForegroundColor Yellow
Write-Host ""
Write-Host "Druecke eine Taste zum Beenden..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")








