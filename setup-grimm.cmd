@echo off
setlocal
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git is required. Install Git for Windows, then run this file again.
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the current Node.js LTS, then run this file again.
  exit /b 1
)

echo Installing Grimm dependencies...
call npm.cmd ci
if errorlevel 1 exit /b 1

if not exist ".env" (
  copy ".env.local.example" ".env" >nul
  echo Created .env from .env.local.example.
) else (
  echo Keeping the existing .env.
)

git config pull.ff only

if not exist "C:\Brain\Grimm" (
  echo.
  echo NOTE: C:\Brain\Grimm is not available yet.
  echo Sync the Obsidian Brain before using durable Grimm memory on this computer.
)

echo Running Grimm tests...
call npm.cmd test
if errorlevel 1 exit /b 1

echo.
echo Grimm setup is ready. Run start-grimm.cmd to start it.
endlocal
