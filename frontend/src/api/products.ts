import apiClient from './client';
import { Product, ApiPaginatedResponse, ApiResponse } from '../types';

export const productsApi = {
  /** GET /products — lista paginata */
  getAll: async (): Promise<Product[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Product>>('/products');
    // L'API ritorna { data: { data: [...], current_page, ... } }
    return res.data.data.data;
  },

  /** GET /products/:id — dettaglio con supplier e lots */
  getById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
};
