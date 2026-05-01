@echo off
setlocal

set "REPO_ROOT=%~dp0"
set "APP_URL=http://localhost:5173/"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found on PATH.
  echo Install Node.js first, then run this launcher again.
  exit /b 1
)

start "Pizza Geek Dev Server" cmd /k "cd /d ""%REPO_ROOT%"" && npm run dev"

echo Waiting for Pizza Geek to start on %APP_URL%
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline=(Get-Date).AddSeconds(45); while((Get-Date) -lt $deadline){ try { Invoke-WebRequest -UseBasicParsing '%APP_URL%' ^| Out-Null; exit 0 } catch { Start-Sleep -Milliseconds 500 } }; exit 1"

if errorlevel 1 (
  echo Pizza Geek did not respond within 45 seconds.
  echo The dev server terminal is still open, so check it for errors.
  exit /b 1
)

call :openBrowser
exit /b 0

:openBrowser
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --new-window "%APP_URL%"
  exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --new-window "%APP_URL%"
  exit /b 0
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window "%APP_URL%"
  exit /b 0
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --new-window "%APP_URL%"
  exit /b 0
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window "%APP_URL%"
  exit /b 0
)

if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" (
  start "" "%ProgramFiles%\Mozilla Firefox\firefox.exe" -new-window "%APP_URL%"
  exit /b 0
)

if exist "%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" (
  start "" "%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -new-window "%APP_URL%"
  exit /b 0
)

start "" "%APP_URL%"
exit /b 0