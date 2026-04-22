import apiClient from './client';
import {
  InventoryMovement,
  CreateMovementPayload,
  ApiResponse,
} from '../types';

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
