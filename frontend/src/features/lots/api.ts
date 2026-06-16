import apiClient from '../../core/api/client';
import {
  Lot,
  LotStatus,
  CreateLotPayload,
  InventoryMovement,
  CreateMovementPayload,
  ApiPaginatedResponse,
  ApiResponse,
} from '../../shared/types';

// ── Lots API ──────────────────────────────────────────

export const lotsApi = {
  /** GET /lots — lista paginata con prodotto */
  getAll: async (): Promise<Lot[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Lot>>('/lots');
    return res.data.data.data;
  },

  /** GET /lots/:id — dettaglio completo (product, movements, labels, alerts) */
  getById: async (id: number): Promise<Lot> => {
    const res = await apiClient.get<ApiResponse<Lot>>(`/lots/${id}`);
    return res.data.data;
  },

  /** POST /lots — crea un nuovo lotto */
  create: async (payload: CreateLotPayload): Promise<Lot> => {
    const res = await apiClient.post<ApiResponse<Lot>>('/lots', payload);
    return res.data.data;
  },

  /** PATCH /lots/:id/status — cambia stato */
  updateStatus: async (id: number, status: LotStatus): Promise<Lot> => {
    const res = await apiClient.patch<ApiResponse<Lot>>(`/lots/${id}/status`, { status });
    return res.data.data;
  },
};

// ── Movements API ─────────────────────────────────────

export const movementsApi = {
  /** GET /inventory-movements?lot_id=X — storico movimenti (opzionalmente filtrato per lotto) */
  getByLot: async (lotId: number): Promise<InventoryMovement[]> => {
    const res = await apiClient.get('/inventory-movements', {
      params: { lot_id: lotId },
    });
    // La response è paginata: { data: { data: [...] } }
    return res.data.data.data ?? res.data.data;
  },

  /** POST /inventory-movements — registra un movimento */
  create: async (payload: CreateMovementPayload): Promise<InventoryMovement> => {
    const res = await apiClient.post<ApiResponse<InventoryMovement>>(
      '/inventory-movements',
      payload,
    );
    return res.data.data;
  },
};

// ── Labels API ────────────────────────────────────────

export interface LabelListItem {
  id: number;
  lot_id: number;
  label_code: string;
  qr_data: string | null;
  barcode: string | null;
}

const parseLotIdFromScannedValue = (rawValue: string): number | null => {
  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed?.lot_id === 'number' && Number.isFinite(parsed.lot_id)) {
      return parsed.lot_id;
    }
  } catch {
    // Se non e' un JSON valido, proseguiamo con il fallback API.
  }

  return null;
};

export const labelsApi = {
  findLotIdByScan: async (rawValue: string): Promise<number | null> => {
    const lotIdFromQr = parseLotIdFromScannedValue(rawValue);
    if (lotIdFromQr) return lotIdFromQr;

    const res = await apiClient.get<ApiPaginatedResponse<LabelListItem>>('/labels', {
      params: { search: rawValue },
    });

    // Bug fix: guard empty/malformed paginated payloads instead of throwing on undefined[0].
    const rows = res.data?.data?.data;
    const match = Array.isArray(rows) ? rows[0] : undefined;
    return match?.lot_id ?? null;
  },
};
