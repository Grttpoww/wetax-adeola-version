# Auto-Build mit automatischer Eingabe
$ErrorActionPreference = "Stop"

Write-Host "Configuring build..." -ForegroundColor Cyan

# Erstelle temporäre Input-Datei
$inputFile = [System.IO.Path]::GetTempFileName()
"n`n" | Out-File -FilePath $inputFile -Encoding ASCII

# Starte Build mit Input-Redirection
Write-Host "Starting build (this may take a moment)..." -ForegroundColor Yellow

$process = Start-Process -FilePath "npx" `
    -ArgumentList "eas-cli", "build", "--profile", "development-adeola", "--platform", "ios" `
    -WorkingDirectory $PSScriptRoot `
    -NoNewWindow `
    -PassThru `
    -RedirectStandardInput $inputFile `
    -Wait

Remove-Item $inputFile -ErrorAction SilentlyContinue

if ($process.ExitCode -eq 0) {
    Write-Host "Build started successfully!" -ForegroundColor Green
} else {
    Write-Host "Build failed. Exit code: $($process.ExitCode)" -ForegroundColor Red
    exit 1
}




