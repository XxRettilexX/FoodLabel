# FoodLabel

**FoodLabel** is a minimum‑viable product for a HACCP mobile application targeting the restaurant sector.

## Architettura Backend (Docker Compose)
Il backend è un monolita modulare basato su Laravel 11. 
L'ambiente locale è interamente dockerizzato per la massima pulizia:

- **app**: Contenitore PHP-FPM con estensioni necessarie.
- **nginx**: Web Server configurato per Laravel (porta 8000).
- **postgres**: Database PostgreSQL (porta 5432). Volume persistente `pgdata`.
- **redis**: Cache, Code e Sessioni (porta 6379).
- **worker**: Servizio PHP per processare asincronamente i Job (`artisan queue:work`).
- **scheduler**: Servizio PHP per eseguire i task programmati regolarmente (`artisan schedule:work`).
- **pgadmin**: Interfaccia Web opzionale per ispezionare il DB in dev (porta 5050, `admin@foodlabel.local` / `admin`).

## Avvio Veloce
Seleziona il terminale alla radice del progetto e lancia:

```bash
# 1. Avvia tutta l'infrastruttura in background
docker compose up -d

# 2. Crea le tabelle nel database
docker compose exec app php artisan migrate

# [Opzionale] Popola il db con dati finti di test (se i seeder sono configurati)
docker compose exec app php artisan db:seed
```

- Le API risponderanno su: `http://localhost:8000/api/v1/`
- pgAdmin è accessibile su: `http://localhost:5050/`
