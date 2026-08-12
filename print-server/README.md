# print-server

Server locale Node/Express che stampa etichette ESC/POS su una **NETUM NT-1809DD** (58mm)
collegata via **USB** al PC. Serve come ponte di test temporaneo: l'app (su iPhone, via Expo Go)
chiama questo server sulla rete Wi-Fi locale invece di usare il Bluetooth nativo della
stampante, così puoi validare il layout dell'etichetta e il flusso end-to-end
fattura → lotto → stampa senza dover configurare una development build.

Non sostituisce il flusso Bluetooth nativo già presente nell'app (`frontend/src/features/
printer`): è un percorso alternativo, pensato solo per test rapidi da PC.

> **Solo per uso locale.** Il server non ha autenticazione e `escpos`/`escpos-usb` sono
> pacchetti in versione alpha con dipendenze transitive obsolete: va tenuto solo sulla rete
> Wi-Fi domestica/locale, mai esposto su internet (niente port forwarding, niente tunnel
> pubblici).

## Setup

```bash
cd print-server
npm install
npm start
```

Il server si mette in ascolto su `http://0.0.0.0:3000` (porta configurabile con la variabile
d'ambiente `PRINT_SERVER_PORT`).

### Trovare l'IP locale del PC

L'iPhone e il PC devono essere sulla **stessa rete Wi-Fi**. Trova l'IP del PC:

- **Windows**: apri PowerShell, esegui `ipconfig` e cerca "Indirizzo IPv4" sotto l'adattatore
  Wi-Fi (di solito nel formato `192.168.x.x`).
- **macOS**: `ipconfig getifaddr en0` (o `en1` se usi un adattatore diverso).
- **Linux**: `ip addr show` e cerca l'IP sull'interfaccia Wi-Fi.

Usa questo IP nella configurazione del frontend (`EXPO_PUBLIC_PRINT_SERVER_URL`, vedi
`frontend/README.md`), ad esempio `http://192.168.1.60:3000`.

## Endpoint

### `GET /health`

Verifica che il server sia raggiungibile. Risponde `200` con:

```json
{ "status": "ok", "printer": "NETUM NT-1809DD (USB)", "charsPerLine": 32, "time": "..." }
```

### `POST /print`

Corpo richiesto:

```json
{
  "qrData": "stringa da codificare nel QR (es. JSON compatto del lotto)",
  "productName": "Nome Prodotto",
  "lotNumber": "LOT-2026-001",
  "expiryDate": "2026-09-01"
}
```

Layout stampato: QR code centrato (piccolo, ~20mm di lato) seguito da nome prodotto in
grassetto e due righe con lotto e scadenza, entro i vincoli fisici della stampante (area di
stampa utile 48mm ≈ 384 dots/linea a 203 DPI, ~32 caratteri per riga con il font di default —
i campi troppo lunghi vengono troncati con `…`).

Risposte: `200 {"success": true}` se la stampa va a buon fine; `400` se mancano campi; `503`
se la stampante non è raggiungibile via USB; `500` per altri errori (es. generazione QR).

## Risoluzione problemi

- **"Stampante non trovata via USB"** — Su **Windows**, la NETUM potrebbe essere installata
  come stampante di sistema (driver generico "USB Printing Support"), che **non** espone
  l'accesso raw USB richiesto da `escpos-usb`/`node-usb`. Devi rimappare il driver del
  dispositivo USB con **[Zadig](https://zadig.akeo.ie/)**: apri Zadig, seleziona la NETUM
  dall'elenco dispositivi (attiva "List All Devices" se non compare), e installa il driver
  **WinUSB** al suo posto. Dopo questo passaggio la stampante non sarà più utilizzabile come
  stampante di sistema Windows normale finché non ripristini il driver originale da Gestione
  Dispositivi — è un compromesso accettabile solo per questa fase di test.
- **Il telefono non raggiunge il server ("richiesta fallita" / timeout in app)** — Al primo
  avvio, Windows potrebbe chiedere di consentire l'accesso di Node.js alla rete: scegli almeno
  "Reti private". Se il popup non compare o hai bloccato per errore, aggiungi manualmente una
  regola in Windows Defender Firewall per consentire connessioni in entrata sulla porta 3000
  (TCP). Verifica anche che iPhone e PC siano sulla stessa rete Wi-Fi (non su reti guest
  separate) aprendo `http://<IP-DEL-PC>:3000/health` dal browser dell'iPhone.
- **Il QR esce troppo grande/piccolo o il testo troppo largo/stretto** — Regola
  `QR_MODULE_SIZE` e `CHARS_PER_LINE` in `src/index.js`: sono valori empirici, vanno tarati
  sulla resa reale della tua stampante dopo una prima stampa di prova.
- **"Carta finita" o simili non vengono rilevati esplicitamente** — Molte stampanti ESC/POS
  economiche come la NT-1809DD non riportano lo stato carta via USB in modo affidabile; in
  quel caso la stampa può risultare "riuscita" lato software anche se la carta è esaurita.
  Controlla sempre visivamente la stampante durante i test.
