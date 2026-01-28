@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   WETAX - EINFACHER START
echo ========================================
echo.

echo [1/3] Starte Backend-Server...
cd Wetax-app-server-main
if not exist "package.json" (
    echo FEHLER: package.json nicht gefunden!
    echo Aktuelles Verzeichnis:
    cd
    pause
    exit /b 1
)
start "Backend Server" cmd /k "cd /d %CD% && npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo [2/3] Warte auf Backend (10 Sekunden)...
timeout /t 10 /nobreak >nul

echo [3/3] Starte Frontend (Web-Version)...
cd Wetax-master
if not exist "package.json" (
    echo FEHLER: package.json nicht gefunden!
    echo Aktuelles Verzeichnis:
    cd
    pause
    exit /b 1
)
start "Frontend Web" cmd /k "cd /d %CD% && npm run web"
cd ..

echo.
echo ========================================
echo   FERTIG!
echo ========================================
echo.
echo Zwei neue Fenster wurden geoeffnet:
echo   - Backend Server (Terminal)
echo   - Frontend Web (Terminal)
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8081
echo.
echo Warte 15-20 Sekunden, dann sollte der Browser sich oeffnen.
echo.
echo Druecke eine Taste zum Schliessen...
pause
