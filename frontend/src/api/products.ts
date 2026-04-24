import apiClient from './client';
import { Product, ApiPaginatedResponse, ApiResponse, CreateProductPayload } from '../types';

export const productsApi = {
  /** GET /products — lista paginata */
  getAll: async (query?: string): Promise<Product[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Product>>('/products', {
      params: query ? { q: query } : undefined,
    });
    // L'API ritorna { data: { data: [...], current_page, ... } }
    return res.data.data.data;
  },

  /** GET /products/:id — dettaglio con supplier e lots */
  getById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', payload);
    return res.data.data;
  },

  findByBarcode: async (barcode: string): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/by-barcode/${encodeURIComponent(barcode)}`);
    return res.data.data;
  },
};
