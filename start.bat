@echo off
cd /d "%~dp0"

where py >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required to run the HVAC Workbook App.
  echo Install Python from https://www.python.org/downloads/ and try again.
  pause
  exit /b 1
)

start "IESVE HVAC App Server" /min cmd /k py app.py
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000
