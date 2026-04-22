import apiClient from './client';
import {
  Lot,
  LotStatus,
  CreateLotPayload,
  ApiPaginatedResponse,
  ApiResponse,
} from '../types';

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
