@echo off
if /i "%FOODLABEL_SETUP_DEBUG%"=="1" @echo on
setlocal EnableExtensions EnableDelayedExpansion

REM Run from this script directory (supports being launched elsewhere)
cd /d "%~dp0"

echo.
echo ===========================
echo FoodLabel - Setup (Windows)
echo ===========================
echo Working directory: "%cd%"
echo.

REM --------- Helpers ---------
set "DOCKER_COMPOSE_CMD="
set "COMPOSER_CMD="

REM Prefer Docker Compose v2 ("docker compose"), fallback to v1 ("docker-compose")
docker compose version >nul 2>&1
if not errorlevel 1 (
    set "DOCKER_COMPOSE_CMD=docker compose"
) else (
    docker-compose version >nul 2>&1
    if not errorlevel 1 (
        set "DOCKER_COMPOSE_CMD=docker-compose"
    )
)

REM Prefer global composer; fallback to local composer.phar (requires PHP)
where composer >nul 2>&1
if not errorlevel 1 (
    set "COMPOSER_CMD=composer"
) else (
    if exist "%~dp0composer.phar" (
        where php >nul 2>&1
        if not errorlevel 1 (
            set "COMPOSER_CMD=php \"%~dp0composer.phar\""
        )
    )
)

REM --------- Backend deps ---------
if exist "backend" (
    pushd "backend" >nul

    if exist "composer.json" (
        echo Installing PHP dependencies with Composer...
        if "%COMPOSER_CMD%"=="" (
            echo ERROR: Composer not available.
            echo - Install Composer globally, or keep "composer.phar" in project root and have PHP in PATH.
            popd >nul
            exit /b 1
        )
        %COMPOSER_CMD% install
        if errorlevel 1 (
            echo ERROR: Composer install failed.
            popd >nul
            exit /b 1
        )
    )

    if exist "package.json" (
        echo Installing Node.js dependencies for backend...
        where node >nul 2>&1
        if errorlevel 1 (
            echo ERROR: Node.js not found in PATH. Install Node.js LTS and retry.
            popd >nul
            exit /b 1
        )
        where npm >nul 2>&1
        if errorlevel 1 (
            echo ERROR: npm not found in PATH. Reinstall/repair Node.js and retry.
            popd >nul
            exit /b 1
        )

        if exist "package-lock.json" (
            npm ci
        ) else (
            npm install
        )
        if errorlevel 1 (
            echo ERROR: Backend npm install failed.
            popd >nul
            exit /b 1
        )
    )

    popd >nul
) else (
    echo WARNING: "backend\" folder not found. Skipping backend dependencies.
)

REM --------- Frontend deps ---------
if exist "frontend" (
    pushd "frontend" >nul

    if exist "package.json" (
        echo Installing Node.js dependencies for frontend...
        where node >nul 2>&1
        if errorlevel 1 (
            echo ERROR: Node.js not found in PATH. Install Node.js LTS and retry.
            popd >nul
            exit /b 1
        )
        where npm >nul 2>&1
        if errorlevel 1 (
            echo ERROR: npm not found in PATH. Reinstall/repair Node.js and retry.
            popd >nul
            exit /b 1
        )

        if exist "package-lock.json" (
            npm ci
        ) else (
            npm install
        )
        if errorlevel 1 (
            echo ERROR: Frontend npm install failed.
            popd >nul
            exit /b 1
        )
    ) else (
        echo WARNING: frontend/package.json not found. Skipping frontend dependencies.
    )

    popd >nul
) else (
    echo WARNING: "frontend\" folder not found. Skipping frontend dependencies.
)

REM --------- Docker ---------
if "%DOCKER_COMPOSE_CMD%"=="" (
    echo ERROR: Docker Compose not found. Install Docker Desktop with Compose and retry.
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker engine not reachable. Start Docker Desktop and retry.
    exit /b 1
)

echo Starting Docker containers...
%DOCKER_COMPOSE_CMD% up -d
if errorlevel 1 (
    echo ERROR: Docker Compose failed to start containers.
    exit /b 1
)

echo.
echo Waiting for backend container to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ===========================
echo Running API Tests...
echo ===========================
%DOCKER_COMPOSE_CMD% exec -T app php artisan test
if errorlevel 1 (
    echo.
    echo ERROR: API Tests failed!
    echo Please check the output above to identify which tests failed.
    echo The backend containers are still running for debugging.
    exit /b 1
)
echo.
echo SUCCESS: All API Tests passed!

echo.
echo ===========================
echo Starting Frontend...
echo ===========================
if exist "frontend" (
    pushd "frontend" >nul
    echo Starting Expo server in a new window...
    start cmd /k "npm start"
    popd >nul
) else (
    echo WARNING: "frontend\" folder not found. Cannot start frontend.
)

echo.
echo ===========================
echo Setup complete!
echo - Backend is running via Docker.
echo - Frontend is starting in a separate window.
echo ===========================
exit /b 0