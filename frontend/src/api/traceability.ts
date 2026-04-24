import apiClient from './client';
import { ApiResponse, MeasureUnit } from '../types';

export interface ProductionGenealogyResponse {
  production: {
    id: number;
    name: string;
    produced_at: string;
    output_quantity: number | string | null;
    output_unit: MeasureUnit | null;
    notes: string | null;
    created_by: { id: number; name: string } | null;
    recipe: { id: number; name: string; code: string | null } | null;
  };
  ingredients: Array<{
    production_input_id: number;
    product: { id: number; name: string; barcode: string | null; sku: string | null } | null;
    lot: { id: number; batch_number: string; status: string; expires_at: string | null } | null;
    quantity_used: number | string;
    unit: MeasureUnit;
    notes: string | null;
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
      `/traceability/productions/${productionId}/genealogy`
    );
    return res.data.data;
  },
};
