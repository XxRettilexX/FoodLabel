# FoodLabel Backend API

Questo è il backend Laravel per l'app HACCP FoodLabel. L'architettura è una "modular-monolith" API-only pensata per gestire in modo isolato i vari domini applicativi (MVP).

## Stack Architetturale
- **Framework**: Laravel 11.x (API only, `php artisan install:api` eseguito)
- **Database**: PostgreSQL (configurato in `.env` come `foodlabel_db`)
- **Cache/Queue/Session**: Redis
- **Autenticazione**: Laravel Sanctum (Token-based per la mobile app Expo)

## Moduli di Dominio (MVP)
Per mantenere l'applicazione pronta per l'estrazione in microservizi, abbiamo raggruppato i domini in direttrici modulari dentro `app/Models/Modules/` e `app/Http/Controllers/Modules/`.

1. **Suppliers** (Fornitori)
2. **Products** (Prodotti)
3. **Lots** (Lotti e Scadenze)
4. **InventoryMovements** (Movimenti di Magazzino ed export)
5. **Labels** (Generazione Barcode/QR Code)
6. **Alerts** (Notifiche di scadenza o warning generici)

Ogni modulo contiene il proprio \`Model\`, \`Controller\`, \`Migration\`, e \`Factory\`. I router per le API sono versionati (`/api/v1/...`).

## Avvio rapido via Docker Compose

Per far partire il sistema senza installare nulla in locale:
1. Assicurati che `docker-compose.yml` sia nella directory root `FoodLabel`.
2. Esegui dalla root `FoodLabel`:
   ```bash
   docker compose up -d --build
   ```
3. Una volta avviati i container, esegui le migrazioni DB internamente al container backend:
   ```bash
   docker compose exec backend php artisan migrate
   ```

## Design e Convenzioni REST adottate
- **Route Versionate**: Le route API si trovano sotto il prefisso `v1/` (`routes/api.php`).
- **Risposte JSON Coerenti**: I controller incapsulano la response in una chiave standardizzata `{"data": ...}`.
- **Validazioni Standard**: Le POST/PUT sono protette da validazione di Request Laravel, restituendo gli appropriati status code (`422 Unprocessable Entity`). (Vedi `LotController` come esempio implementato).  
- **Resource Controllers**: Vengono usati metodi standard `index`, `store`, `show`, `update`, `destroy`.  
