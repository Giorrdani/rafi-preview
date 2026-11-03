@echo off
cd /d "%~dp0"
where mvn >nul 2>nul
if errorlevel 1 (
 echo Install Maven and Java 21 or build this Maven project from your IDE.
 pause
 exit /b 1
)
call mvn clean verify
if errorlevel 1 (
 echo BUILD FAILED. Nothing was installed.
 pause
 exit /b 1
)
if not exist dist mkdir dist
copy /y target\kidsclub-manager-2.1.0-preview.jar dist\rafi.jar >nul
echo Build passed. Run start.bat for local testing.
pause
