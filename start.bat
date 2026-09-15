@echo off
cd /d %~dp0
start "HVAC Calculation Studio" http://127.0.0.1:8000
py app.py
pause
