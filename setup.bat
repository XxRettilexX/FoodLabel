@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Run from this script directory
cd /d "%~dp0"

echo.
echo ===========================
echo FoodLabel - Fast Setup
echo ===========================
echo Working directory: "%cd%"
echo.

REM Prefer Docker Compose v2, fallback to v1
set "DOCKER_COMPOSE_CMD="
docker compose version >nul 2>&1
if not errorlevel 1 (
    set "DOCKER_COMPOSE_CMD=docker compose"
) else (
    docker-compose version >nul 2>&1
    if not errorlevel 1 (
        set "DOCKER_COMPOSE_CMD=docker-compose"
    )
)

if "%DOCKER_COMPOSE_CMD%"=="" (
    echo ERROR: Docker Compose non trovato. Installa Docker Desktop e riprova.
    exit /b 1
)

echo [1/3] Avvio dei container Docker...

if not exist "backend\.env" (
    echo Creazione del file .env per il backend...
    copy "backend\.env.example" "backend\.env" >nul
)

%DOCKER_COMPOSE_CMD% up -d
if errorlevel 1 (
    echo ERROR: Docker Compose non e' riuscito ad avviare i container.
    exit /b 1
)

echo.
echo Attendere il caricamento del backend...
timeout /t 5 /nobreak >nul

echo Generazione chiave applicazione (se necessaria)...
%DOCKER_COMPOSE_CMD% exec -T app php artisan key:generate

echo.
echo [2/3] Esecuzione Test API Backend...
%DOCKER_COMPOSE_CMD% exec -T app php artisan test
if errorlevel 1 (
    echo.
    echo ERROR: I test delle API sono falliti!
    echo Controlla l'output qui sopra per capire quale API ha problemi.
    exit /b 1
)
echo SUCCESS: Tutti i test API sono passati!

echo.
echo [3/3] Avvio del Frontend...
if exist "frontend" (
    pushd "frontend" >nul
    start cmd /k "npm start"
    popd >nul
) else (
    echo WARNING: Cartella "frontend" non trovata. Impossibile avviare Expo.
)

echo.
echo ===========================
echo Setup Completato con Successo!
echo - I container Backend (Docker) sono in esecuzione
echo - Il Frontend si sta aprendo in una nuova finestra
echo ===========================
exit /b 0