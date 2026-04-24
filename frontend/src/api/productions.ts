import apiClient from './client';
import { ApiPaginatedResponse, ApiResponse, CreateProductionPayload, Production } from '../types';

export const productionsApi = {
  getAll: async (): Promise<Production[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Production>>('/productions');
    return res.data.data.data;
  },

  getById: async (id: number): Promise<Production> => {
    const res = await apiClient.get<ApiResponse<Production>>(`/productions/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateProductionPayload): Promise<Production> => {
    const res = await apiClient.post<ApiResponse<Production>>('/productions', payload);
    return res.data.data;
  },
};
