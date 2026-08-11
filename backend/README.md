# FoodLabel — Backend

API Laravel per la gestione HACCP di un ristorante: fornitori, prodotti, lotti, movimenti di
magazzino, etichette, allarmi scadenze e — da questa versione — scansione fatture fornitore e
stampa etichette via Bluetooth.

## Setup rapido

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Configura `GEMINI_API_KEY` in `.env` (vedi sezione sotto) prima di usare la scansione fatture.

## Flusso: fattura fornitore → lotto → etichetta stampata

Questo flusso collega tre moduli: `Modules/Invoices` (nuovo), `Modules/Lots` e `Modules/Labels`.

1. **Scansione** — L'operatore (magazzino/cucina) scatta una foto o importa un PDF della fattura
   dall'app mobile, selezionando il fornitore. `POST /api/v1/invoices/scan` salva il file e
   invoca `InvoiceExtractionService`, che chiama **Google Gemini** (vision, free tier) con un
   prompt che richiede un JSON strutturato per riga (`nome_prodotto`, `quantita`, `unita_misura`,
   `numero_lotto`, `data_scadenza`, `confidence`). Ogni riga estratta viene salvata come
   `InvoiceLineItem` e viene tentato un match automatico col catalogo `Product` (ricerca fuzzy sul
   nome). Se l'estrazione fallisce (rete, risposta non valida), la fattura viene marcata `failed`
   con `failure_reason` leggibile.
2. **Revisione** — L'app mostra ogni riga con un badge di confidenza (alta/media/bassa, dal
   `confidence_score`) e permette editing manuale (prodotto, quantità, unità, lotto, scadenza) via
   `PATCH /api/v1/invoices/{invoice}/line-items/{line}`, oppure di scartare una riga letta male.
   **Nessun dato viene scritto su Lots/InventoryMovements in questa fase.**
3. **Conferma** — `POST /api/v1/invoices/{invoice}/confirm` invoca
   `InvoiceConfirmationService`, che per ogni riga non scartata richiama
   `LotService::receiveLot()` (stesso servizio usato dalla creazione manuale di un lotto) dentro
   una transazione: crea il `Lot`, il movimento di carico `IN` in `InventoryMovements`, e collega
   `lot_id` alla riga fattura. Se manca il prodotto o il numero di lotto, quest'ultimo viene
   generato automaticamente (`FTR-{invoice_id}-{line_id}`); se manca la scadenza, viene calcolata
   da `default_shelf_life_days` del prodotto (o +30 giorni di default).
4. **Stampa automatica** — Subito dopo la conferma, l'app propone la stampa dell'etichetta per
   ogni lotto appena creato, riusando l'endpoint esistente `POST /api/v1/labels` (
   `LabelService::generateLabelForLot`, invariato) che genera QR/barcode e testo leggibile
   (lotto, prodotto, scadenza, fornitore). La conversione in comandi ESC/POS avviene
   interamente lato app (vedi `frontend/README.md`): il backend espone solo il payload dati.

### Configurazione Gemini

```
GEMINI_API_KEY=   # https://aistudio.google.com/apikey — tier gratuito
GEMINI_MODEL=gemini-2.0-flash
```

Senza `GEMINI_API_KEY` la scansione fallisce con un messaggio esplicito (fattura marcata
`failed`), il resto dell'app non è impattato.

### Note sul modulo Suppliers

Durante l'implementazione della scansione fatture è emerso che `SupplierController` era uno
stub vuoto e la lettura era ristretta a `owner,manager`: senza questa fix nessuno (nemmeno
owner/manager) poteva ottenere l'elenco fornitori, e chi riceve le consegne (magazzino/cucina)
non avrebbe comunque potuto scegliere il fornitore in fase di scansione. È stato quindi
implementato `SupplierController` (stesso pattern di `ProductController`) e la lettura
(`index`/`show`) è stata aperta agli stessi ruoli operativi di Products/Lots, mantenendo
creazione/modifica/cancellazione riservate a `owner,manager`.
