import apiClient from '../../core/api/client';
import {
  Recipe,
  CreateRecipePayload,
  Production,
  CreateProductionPayload,
  ApiResponse,
  ApiPaginatedResponse,
} from '../../shared/types';

// ── Recipes API ───────────────────────────────────────

export const recipesApi = {
  getAll: async (): Promise<Recipe[]> => {
    const res = await apiClient.get<ApiPaginatedResponse<Recipe>>('/recipes');
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

// ── Productions API ───────────────────────────────────

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

// ── Traceability API ──────────────────────────────────

export interface ProductionGenealogyResponse {
  production: Production;
  ingredients: Array<{
    production_input_id: number;
    quantity_used: string;
    unit: string;
    product: { id: number; name: string; barcode: string | null } | null;
    lot: { id: number; batch_number: string; expires_at: string | null } | null;
  }>;
  meta: {
    ingredient_lines_count: number;
    unique_lots_count: number;
    unique_products_count: number;
  };
}

export const traceabilityApi = {
  getProductionGenealogy: async (productionId: number): Promise<ProductionGenealogyResponse> => {
    const res = await apiClient.get<ApiResponse<ProductionGenealogyResponse>>(
      `/traceability/productions/${productionId}/genealogy`,
    );
    return res.data.data;
  },

  getLotUsageHistory: async (lotId: number): Promise<any> => {
    const res = await apiClient.get(`/traceability/lots/${lotId}/usage-history`);
    return res.data.data;
  },
};
