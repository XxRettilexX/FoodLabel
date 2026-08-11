import apiClient from '../../core/api/client';
import {
  ApiPaginatedResponse,
  ApiResponse,
  ConfirmInvoiceResult,
  DeliveryInvoice,
  Supplier,
  UpdateInvoiceLineItemPayload,
} from '../../shared/types';

// ── Suppliers (lettura minima per il picker fattura) ──

export const suppliersApi = {
  /** GET /suppliers — lista fornitori dell'account, usata per selezionare il fornitore in fase di scansione */
  getAll: async (): Promise<Supplier[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Supplier>>('/suppliers');
    return res.data.data.data;
  },
};

// ── Invoices API ──────────────────────────────────────

export interface ScannedFile {
  uri: string;
  name: string;
  type: string;
}

export const invoicesApi = {
  /** GET /invoices — lista paginata */
  getAll: async (): Promise<DeliveryInvoice[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<DeliveryInvoice>>('/invoices');
    return res.data.data.data;
  },

  /** GET /invoices/:id — dettaglio con righe estratte */
  getById: async (id: number): Promise<DeliveryInvoice> => {
    const res = await apiClient.get<ApiResponse<DeliveryInvoice>>(`/invoices/${id}`);
    return res.data.data;
  },

  /** POST /invoices/scan — upload fattura (foto o PDF) + avvio estrazione AI */
  scan: async (supplierId: number, file: ScannedFile): Promise<DeliveryInvoice> => {
    const formData = new FormData();
    formData.append('supplier_id', String(supplierId));
    // @ts-expect-error — React Native accetta questa forma di file per multipart, diversa dal DOM File.
    formData.append('file', { uri: file.uri, name: file.name, type: file.type });

    const res = await apiClient.post<ApiResponse<DeliveryInvoice>>('/invoices/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // l'estrazione AI puo' richiedere qualche secondo in piu' del default
    });
    return res.data.data;
  },

  /** PATCH /invoices/:id/line-items/:lineItemId — editing manuale di una riga prima della conferma */
  updateLineItem: async (
    invoiceId: number,
    lineItemId: number,
    payload: UpdateInvoiceLineItemPayload,
  ) => {
    const res = await apiClient.patch(`/invoices/${invoiceId}/line-items/${lineItemId}`, payload);
    return res.data.data;
  },

  /** POST /invoices/:id/confirm — crea Lot + InventoryMovement per ogni riga confermata */
  confirm: async (invoiceId: number): Promise<ConfirmInvoiceResult> => {
    const res = await apiClient.post<ApiResponse<ConfirmInvoiceResult>>(`/invoices/${invoiceId}/confirm`);
    return res.data.data;
  },
};
