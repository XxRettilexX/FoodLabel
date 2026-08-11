import { Platform } from 'react-native';
import { PrintCommand } from './escposBuilder';

export interface BluetoothDevice {
  address: string;
  name: string;
}

/**
 * Errore sollevato quando il modulo nativo della stampante non e' presente:
 * succede sempre in Expo Go (nessun modulo nativo custom) e va gestito
 * mostrando un messaggio chiaro invece di far crashare la funzione.
 */
export class PrinterUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrinterUnavailableError';
  }
}

/**
 * Import dinamico: @mateusdegobi/react-native-bluetooth-escpos-printer e' un
 * modulo nativo (fork mantenuto di react-native-bluetooth-escpos-printer con
 * supporto alla New Architecture), disponibile solo in una development build
 * (expo prebuild / EAS dev client). In Expo Go il require lancia, e lo
 * intercettiamo per degradare con un messaggio leggibile invece di un crash.
 */
function loadNativeModule(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return require('@mateusdegobi/react-native-bluetooth-escpos-printer');
  } catch {
    return null;
  }
}

function requireNativeModule(): any {
  const native = loadNativeModule();
  if (!native) {
    throw new PrinterUnavailableError(
      'Modulo di stampa Bluetooth non disponibile in questa build (serve una development build, non Expo Go).',
    );
  }
  return native;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 800): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

function parseDeviceList(raw: unknown): BluetoothDevice[] {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const paired = Array.isArray(parsed?.paired) ? parsed.paired : [];
  const found = Array.isArray(parsed?.found) ? parsed.found : [];

  const seen = new Set<string>();
  return [...paired, ...found]
    .filter((d: any) => {
      if (!d?.address || seen.has(d.address)) return false;
      seen.add(d.address);
      return true;
    })
    .map((d: any) => ({ address: d.address, name: d.name || d.address }));
}

export const bluetoothPrinter = {
  /** iOS non espone Bluetooth Classic (SPP) alle app di terze parti: limite di piattaforma. */
  isSupportedPlatform(): boolean {
    return Platform.OS === 'android';
  },

  async listPairedDevices(): Promise<BluetoothDevice[]> {
    const { BluetoothManager } = requireNativeModule();
    const enabled = await BluetoothManager.isBluetoothEnabled();
    if (!enabled) {
      await BluetoothManager.enableBluetooth();
    }
    const raw = await BluetoothManager.scanDevices();
    return parseDeviceList(raw);
  },

  async connect(address: string): Promise<void> {
    const { BluetoothManager } = requireNativeModule();
    await withRetry(() => BluetoothManager.connect(address));
  },

  /** Invia i comandi ESC/POS gia' costruiti (vedi escposBuilder) alla stampante collegata. */
  async printLabel(commands: PrintCommand[]): Promise<void> {
    const { BluetoothEscposPrinter } = requireNativeModule();

    await withRetry(async () => {
      for (const command of commands) {
        switch (command.type) {
          case 'text':
            await BluetoothEscposPrinter.printerAlign(
              BluetoothEscposPrinter.ALIGN[command.align ?? 'LEFT'],
            );
            await BluetoothEscposPrinter.printText(`${command.value}\n`, {
              encoding: 'GBK',
              codepage: 0,
              widthtimes: command.bold ? 1 : 0,
              heigthtimes: command.bold ? 1 : 0,
              fonttype: 1,
            });
            break;
          case 'qr':
            await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
            await BluetoothEscposPrinter.printQRCode(
              command.value,
              200,
              BluetoothEscposPrinter.ERROR_CORRECTION.M,
            );
            break;
          case 'barcode':
            await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
            await BluetoothEscposPrinter.printBarCode(
              command.value,
              BluetoothEscposPrinter.BARCODETYPE.CODE128,
              2,
              80,
              0,
              2,
            );
            break;
          case 'feed':
            await BluetoothEscposPrinter.printText('\n\n\n', {});
            break;
        }
      }
    });
  },
};

/** Traduce un errore tecnico in un messaggio leggibile da chi lavora in cucina, senza glove-off. */
export function describePrinterError(err: unknown): string {
  if (err instanceof PrinterUnavailableError) {
    return 'Stampa Bluetooth non disponibile in questa versione dell\'app (serve una development build).';
  }
  return 'Stampante non raggiungibile. Verifica che sia accesa, carica e vicina, poi riprova.';
}
