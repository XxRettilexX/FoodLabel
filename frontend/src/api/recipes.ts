import apiClient from './client';
import { ApiPaginatedResponse, ApiResponse, CreateRecipePayload, Recipe } from '../types';

export const recipesApi = {
  getAll: async (query?: string): Promise<Recipe[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Recipe>>('/recipes', {
      params: query ? { q: query } : undefined,
    });
    return res.data.data.data;
  },

  getById: async (id: number): Promise<Recipe> => {
    const res = await apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateRecipePayload): Promise<Recipe> => {
    const res = await apiClient.post<ApiResponse<Recipe>>('/recipes', payload);
    return res.data.data;
  },
};
