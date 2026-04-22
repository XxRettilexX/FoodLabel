import apiClient from './client';
import { ApiPaginatedResponse } from '../types';

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

    const match = res.data.data.data[0];
    return match?.lot_id ?? null;
  },
};
