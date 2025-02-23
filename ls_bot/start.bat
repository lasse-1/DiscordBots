@echo off
setlocal

set SCRIPT_DIR=%~dp0

cd /d "%SCRIPT_DIR%"

start cmd /k "npm start"
