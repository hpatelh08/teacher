@echo off
REM Unified launcher for Smart School Management System
REM Installs dependencies and starts both server and client

SETLOCAL
cd /d "%~dp0"

REM Install server dependencies
echo Installing server dependencies...
cd server
if exist node_modules (
  echo Server dependencies already installed.
) else (
  npm install
)

REM Start server in background
start "Server" cmd /k "cd /d "%~dp0server" && npm run dev"

REM Install client dependencies
cd ..\client
echo Installing client dependencies...
if exist node_modules (
  echo Client dependencies already installed.
) else (
  npm install
)

REM Start client in background
start "Client" cmd /k "cd /d "%~dp0client" && npm start"

echo Both server and client launched. Close these windows to stop the processes.
ENDLOCAL
