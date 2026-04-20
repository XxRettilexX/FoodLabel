# FoodLabel

**FoodLabel** is a minimum‑viable product for a HACCP mobile application targeting the restaurant sector.

- **Frontend**: Expo + React Native + TypeScript
- **Backend**: Laravel (PHP) with a modular‑monolith architecture
- **Infrastructure**: Docker Compose (PostgreSQL, Redis, backend, frontend)
- **Database**: PostgreSQL
- **Cache / Queue**: Redis

The MVP allows users to track food lots, generate QR/barcode labels, manage warehouse movements, and monitor expiration dates.

## Quick start (local development)
```bash
# Clone the repo (if remote)
# cd FoodLabel
# Initialise sub‑projects (run once)
./scripts/bootstrap.sh
# Start all services
docker compose up -d
```

See the `docs/` folder for architecture diagrams, ADRs and API specifications.
