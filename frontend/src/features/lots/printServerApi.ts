import axios from 'axios';
import { LabelPrintPayload } from '../printer/api';

const DEFAULT_PRINT_SERVER_URL = 'http://localhost:3000';

/**
 * URL del print-server locale (Node/Express + USB), usato SOLO per test rapidi da PC:
 * il flusso di produzione resta la stampa Bluetooth nativa in src/features/printer.
 * Configurabile via EXPO_PUBLIC_PRINT_SERVER_URL (es. http://192.168.1.60:3000),
 * cosi' si puo' cambiare facilmente tra un PC di test e un altro senza ricompilare.
 */
export function getPrintServerUrl(): string {
  return process.env.EXPO_PUBLIC_PRINT_SERVER_URL || DEFAULT_PRINT_SERVER_URL;
}

/** Corpo atteso da print-server/src/index.js — POST /print */
export interface PrintServerLabelData {
  qrData: string;
  productName: string;
  lotNumber: string;
  expiryDate: string;
}

/** Mappa il payload etichetta gia' generato dal backend (GET/POST /labels) nel formato del print-server. */
export function toPrintServerPayload(payload: LabelPrintPayload): PrintServerLabelData {
  return {
    qrData: payload.qr_value || payload.label_code,
    productName: payload.readable_data.product_name,
    lotNumber: payload.readable_data.batch_number,
    expiryDate: payload.readable_data.expires_at,
  };
}

export class PrintServerUnreachableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintServerUnreachableError';
  }
}

const UNREACHABLE_MESSAGE = () =>
  `PC non raggiungibile in rete (${getPrintServerUrl()}). Verifica che print-server sia avviato (npm start) e che iPhone e PC siano sulla stessa Wi-Fi.`;

export const printServerApi = {
  /** GET {PRINT_SERVER_URL}/health — true se il server risponde entro pochi secondi. */
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await axios.get(`${getPrintServerUrl()}/health`, { timeout: 4000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * POST {PRINT_SERVER_URL}/print — chiamata diretta dal telefono al PC sulla rete locale
   * (bypassa il backend Laravel: e' un ponte di test temporaneo, non il flusso Bluetooth).
   */
  printLabel: async (data: PrintServerLabelData): Promise<void> => {
    try {
      await axios.post(`${getPrintServerUrl()}/print`, data, { timeout: 12000 });
    } catch (err: any) {
      if (!err?.response) {
        // Nessuna risposta HTTP: timeout, server spento, IP sbagliato o rete diversa.
        throw new PrintServerUnreachableError(UNREACHABLE_MESSAGE());
      }
      const message = err.response?.data?.error || 'Errore durante la stampa sul print-server.';
      throw new Error(message);
    }
  },
};
