@echo off
setlocal

cd /d "%~dp0"

echo Installing workspace dependencies...
call npm run install:all
if errorlevel 1 (
  echo Dependency installation failed.
  exit /b 1
)

echo Building the workspace...
call npm run build
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

echo Build completed successfully.
pause
