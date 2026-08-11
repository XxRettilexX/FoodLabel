import { LabelPrintPayload } from './api';

export type PrintCommand =
  | { type: 'text'; value: string; align?: 'LEFT' | 'CENTER' | 'RIGHT'; bold?: boolean }
  | { type: 'qr'; value: string }
  | { type: 'barcode'; value: string }
  | { type: 'feed' };

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/D';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Costruisce la sequenza di comandi ESC/POS a partire dal payload gia'
 * calcolato dal backend (LabelService::getLabelPayload) — nessuna logica
 * di dominio qui, solo formattazione per la stampante 58mm.
 */
export function buildLabelPrintCommands(payload: LabelPrintPayload): PrintCommand[] {
  const data = payload.readable_data;
  const commands: PrintCommand[] = [
    { type: 'text', value: data.product_name.toUpperCase(), align: 'CENTER', bold: true },
    { type: 'text', value: `Lotto: ${data.batch_number}`, align: 'CENTER' },
    { type: 'text', value: `SCADENZA: ${formatDate(data.expires_at)}`, align: 'CENTER', bold: true },
  ];

  if (data.produced_at) {
    commands.push({ type: 'text', value: `Prodotto il: ${formatDate(data.produced_at)}`, align: 'CENTER' });
  }

  commands.push({ type: 'text', value: `Qta: ${data.quantity} ${data.unit}`, align: 'CENTER' });

  if (data.supplier_name && data.supplier_name !== 'N/A') {
    commands.push({ type: 'text', value: `Fornitore: ${data.supplier_name}`, align: 'CENTER' });
  }

  if (payload.qr_value) {
    commands.push({ type: 'qr', value: payload.qr_value });
  }

  if (payload.barcode_value) {
    commands.push({ type: 'barcode', value: payload.barcode_value });
  }

  commands.push({ type: 'text', value: payload.label_code, align: 'CENTER' });
  commands.push({ type: 'feed' });

  return commands;
}
