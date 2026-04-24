@echo off

REM Install backend dependencies
cd backend
if exist composer.json (
    echo Installing PHP dependencies...
    composer install
)
if exist package.json (
    echo Installing Node.js dependencies for backend...
    npm install
)
cd ..

REM Install frontend dependencies
cd frontend
if exist package.json (
    echo Installing Node.js dependencies for frontend...
    npm install
)
cd ..

REM Start Docker containers
echo Starting Docker containers...
docker-compose up -d

echo Setup complete.