@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 20 or later from https://nodejs.org/
  echo Or open index.html directly in your browser.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:3000"
node local-server.js
pause
