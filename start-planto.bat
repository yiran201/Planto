@echo off
REM One-click startup script (REQ-046; REQ-055 previously fixed this by
REM saving the file as ANSI/GBK, since cmd.exe on Chinese Windows parses
REM .bat files byte-by-byte using the system's non-Unicode code page and
REM misreads UTF-8 Chinese text, corrupting REM/echo lines into garbage
REM that gets executed as bogus commands - see docs/KNOWLEDGE.md. REQ-085
REM replaces that workaround with English-only content instead: plain
REM ASCII bytes are identical under every code page, so this file no
REM longer depends on matching any specific system encoding at all, and
REM can be saved as plain UTF-8/ASCII with any editor without breaking).
REM A desktop shortcut points to this file: double-click it to cd into
REM the project directory, auto-install dependencies on first run, then
REM start the Vite dev server with --open so the browser opens
REM automatically. Since REQ-063 the port is fixed to 6060 in
REM vite.config.js (strictPort:true - Google OAuth's authorized origin
REM must match the port exactly). If the port is already in use,
REM npm run dev fails immediately instead of silently switching to
REM another port like 5174.
title Planto
cd /d "%~dp0"

if not exist "node_modules" (
  echo First run detected, installing dependencies, please wait...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed, see the error above.
    pause
    exit /b 1
  )
)

call npm run dev -- --open

echo.
echo Dev server stopped.
pause
