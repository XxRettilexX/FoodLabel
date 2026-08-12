# FoodLabel — App mobile (Expo / React Native)

App HACCP per ristorazione, feature-based (`src/features/{lots,products,alerts,dashboard,
preparation,auth,profile,invoices,printer}`).

## Setup rapido

```bash
npm install
npm start
```

`EXPO_PUBLIC_API_URL` (o l'IP rilevato automaticamente dal Metro bundler) deve puntare al
backend Laravel, vedi `../backend/README.md`.

## Flusso: scansione fattura → revisione → lotto → stampa etichetta

1. **Scansione** (`src/features/invoices/InvoiceScanScreen.tsx`) — dalla lista Lotti, bottone
   "Fattura". Si seleziona il fornitore, poi si scatta una foto (`expo-camera`) o si importa un
   PDF (`expo-document-picker`). Il file viene inviato a `POST /invoices/scan`; il backend lo
   analizza con Google Gemini e ritorna le righe estratte.
2. **Revisione** (`InvoiceReviewScreen.tsx`) — ogni riga mostra un badge di confidenza
   (ALTA/MEDIA/BASSA, dal `confidence_score` calcolato dal backend) e campi editabili
   (prodotto — con selezione manuale se non matchato automaticamente —, quantità, unità, numero
   lotto, scadenza). È possibile scartare una riga letta male. Nessun lotto viene creato finché
   non si preme "Conferma e crea lotti".
3. **Conferma** — crea un `Lot` + movimento di carico per ogni riga confermata
   (`POST /invoices/{id}/confirm`), poi mostra i lotti creati con un bottone "Stampa etichetta"
   per ciascuno.
4. **Stampa Bluetooth** (`src/features/printer/`) — lo stesso `PrintLabelButton` è richiamabile
   sia da qui sia dal flusso manuale (`LotDetailScreen`). Se non c'è ancora una stampante
   accoppiata, apre `PrinterPairingScreen` (lista dispositivi Bluetooth già accoppiati dal
   telefono); una volta selezionata, viene salvata (AsyncStorage) e riusata alle stampe
   successive senza dover ripetere il pairing. Genera l'etichetta lato server
   (`labelPrintApi.generateForLot`, riusa `POST /labels` già esistente), costruisce i comandi
   ESC/POS (`escposBuilder.ts`: testo prodotto/lotto/scadenza, QR, barcode) e li invia alla
   stampante (`bluetoothPrinter.ts`). In caso di errore di connessione, ritenta automaticamente
   (2 tentativi) e mostra un messaggio semplice e leggibile ("Stampante non raggiungibile,
   verifica che sia accesa e vicina") con un'azione "Riprova" o "Cambia stampante" — pensato per
   essere letto al volo in cucina, senza terminologia tecnica.

## ⚠️ Requisito: development build per la stampa Bluetooth

`@mateusdegobi/react-native-bluetooth-escpos-printer` è un modulo nativo: **non funziona in Expo
Go**. Da questa versione in poi, per testare la stampa serve una development build:

```bash
npx expo prebuild
npx expo run:android
# oppure, con EAS:
eas build --profile development --platform android
```

Il resto dell'app (scansione fattura, lotti, prodotti...) continua a funzionare normalmente in
Expo Go: solo il bottone "Stampa etichetta" mostrerà l'avviso "non disponibile in questa build"
finché non si passa a una development build.

**Solo Android.** iOS non espone il Bluetooth Classic (SPP) usato dalle stampanti termiche
ESC/POS generiche (es. NETUM 58mm) alle app di terze parti: è un limite del sistema operativo,
non della libreria. Su iOS `PrinterPairingScreen` mostra questo messaggio invece di provare a
connettersi.

## Ponte di test locale: print-server via USB + Wi-Fi (senza Bluetooth)

Per validare rapidamente il layout etichetta su una stampante NETUM collegata via **USB** al
PC, senza passare dalla development build richiesta dal Bluetooth nativo, c'è un percorso
separato che funziona anche in **Expo Go**:

- `print-server/` (root del monorepo) — server Node/Express che riceve `POST /print` e stampa
  via USB. Vedi `print-server/README.md` per setup e troubleshooting (driver USB su Windows,
  firewall).
- `src/features/lots/printServerApi.ts` — client che chiama direttamente il print-server sulla
  rete locale (non passa dal backend Laravel). URL configurabile con
  `EXPO_PUBLIC_PRINT_SERVER_URL` (es. `http://192.168.1.60:3000`) in `frontend/.env`; se non
  impostata, prova `http://localhost:3000`.
- Bottone **"Stampa di prova"** nella schermata Profilo (`src/features/profile/
  ProfileScreen.tsx`) — invia un'etichetta con dati di esempio per verificare in un colpo solo
  che il print-server sia raggiungibile e che il layout sia leggibile sulla carta reale.

Se il PC non risponde, l'errore mostrato in app è esplicito ("PC non raggiungibile in rete,
verifica che print-server sia avviato e che iPhone/PC siano sulla stessa Wi-Fi") invece di un
errore tecnico generico.

Questo percorso è **solo per test**: il flusso di stampa "vero" resta quello Bluetooth nativo
descritto sopra (`PrintLabelButton`), usato in produzione dopo la conferma di una fattura o dal
dettaglio lotto.

## Permessi Android

`app.json` dichiara i permessi Bluetooth necessari (`BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`,
`BLUETOOTH`, `BLUETOOTH_ADMIN`, `ACCESS_FINE_LOCATION` — quest'ultimo richiesto da Android per lo
scan di dispositivi Bluetooth classic su versioni meno recenti). Su Android 12+ l'utente dovrà
concedere il permesso a runtime la prima volta che si apre `PrinterPairingScreen`.
