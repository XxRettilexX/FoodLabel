const express = require('express');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const PORT = Number(process.env.PRINT_SERVER_PORT) || 3000;

// Vincoli fisici stampante NETUM NT-1809DD (58mm carta, 203 DPI):
// area di stampa utile ~48mm ≈ 384 dots/linea. A font di default (~12 dots/carattere)
// stanno circa 32 caratteri per riga.
const CHARS_PER_LINE = 32;
// Modulo QR: valore empirico per stare entro ~20mm di lato: va verificato con una stampa
// reale e regolato se il QR esce troppo grande/piccolo per lo scanner che lo leggera'.
const QR_MODULE_SIZE = 6;

const app = express();
app.use(express.json({ limit: '1mb' }));

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

function logError(...args) {
  console.error(`[${new Date().toISOString()}]`, ...args);
}

// Body JSON malformato -> risposta pulita invece della pagina di errore default di Express.
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    logError('Body JSON non valido nella richiesta:', err.message);
    return res.status(400).json({ error: 'Corpo della richiesta non e\' un JSON valido.' });
  }
  next(err);
});

function truncateForWidth(text, maxChars = CHARS_PER_LINE) {
  if (!text) return '';
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    printer: 'NETUM NT-1809DD (USB)',
    charsPerLine: CHARS_PER_LINE,
    time: new Date().toISOString(),
  });
});

app.post('/print', (req, res) => {
  const { qrData, productName, lotNumber, expiryDate } = req.body || {};

  const missing = ['qrData', 'productName', 'lotNumber', 'expiryDate'].filter((key) => !req.body?.[key]);
  if (missing.length > 0) {
    logError('Richiesta di stampa incompleta, campi mancanti:', missing.join(', '), req.body);
    return res.status(400).json({
      error: `Campi mancanti: ${missing.join(', ')}. Richiesti: qrData, productName, lotNumber, expiryDate.`,
    });
  }

  log('Richiesta di stampa ricevuta:', { productName, lotNumber, expiryDate });

  let device;
  try {
    device = new escpos.USB();
  } catch (err) {
    logError('Stampante USB non trovata:', err.message);
    return res.status(503).json({
      error: 'Stampante non trovata via USB. Verifica che sia accesa, collegata al PC e che il driver USB sia corretto (vedi README).',
    });
  }

  device.open((openErr) => {
    if (openErr) {
      logError('Impossibile aprire la connessione USB alla stampante:', openErr.message);
      return res.status(503).json({
        error: 'Impossibile comunicare con la stampante USB. Verifica cavo, alimentazione e driver (vedi README).',
      });
    }

    device.on('error', (usbErr) => {
      // Eventi USB asincroni post-apertura: tipicamente stampante scollegata a meta' stampa.
      logError('Errore USB durante la stampa (stampante scollegata o malfunzionamento?):', usbErr.message);
    });

    const printer = new escpos.Printer(device, { encoding: 'GB18030' });
    let responded = false;

    const respondError = (status, message, err) => {
      if (responded) return;
      responded = true;
      logError(message, err?.message || '');
      try { device.close(); } catch (_closeErr) { /* device gia' chiuso o non apribile */ }
      res.status(status).json({ error: message });
    };

    printer
      .align('CT')
      .qrimage(qrData, { type: 'png', size: QR_MODULE_SIZE }, function printQrCallback(qrErr) {
        if (qrErr) {
          return respondError(500, 'Errore nella generazione del QR code sulla stampante.', qrErr);
        }

        this
          .align('CT')
          .style('B')
          .size(1, 1)
          .text(truncateForWidth(productName))
          .style('NORMAL')
          .size(0, 0)
          .text(`Lotto: ${truncateForWidth(lotNumber, CHARS_PER_LINE - 7)}`)
          .text(`Scad: ${truncateForWidth(expiryDate, CHARS_PER_LINE - 6)}`)
          .feed(2)
          .cut()
          .close(() => {
            if (responded) return;
            responded = true;
            log('Etichetta stampata con successo:', { productName, lotNumber });
            res.json({ success: true });
          });
      });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  log(`Print server in ascolto su http://0.0.0.0:${PORT}`);
  log('Endpoint disponibili: GET /health, POST /print');
});
