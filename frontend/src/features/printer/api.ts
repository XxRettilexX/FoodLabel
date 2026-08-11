import apiClient from '../../core/api/client';

/**
 * Rispecchia esattamente LabelService::getLabelPayload() nel backend
 * (App\Services\Modules\Labels\LabelService).
 */
export interface LabelPrintPayload {
  label_code: string;
  barcode_value: string | null;
  qr_value: string | null;
  print_url: string;
  readable_data: {
    batch_number: string;
    product_name: string;
    supplier_name: string;
    produced_at: string | null;
    expires_at: string;
    quantity: number;
    unit: string;
    printed_by: number | null;
    created_at: string;
  };
}

export const labelPrintApi = {
  /** POST /labels — genera una nuova etichetta per il lotto e ne ritorna il payload di stampa completo */
  generateForLot: async (lotId: number): Promise<LabelPrintPayload> => {
    const res = await apiClient.post<{ data: LabelPrintPayload }>('/labels', { lot_id: lotId });
    return res.data.data;
  },
};
