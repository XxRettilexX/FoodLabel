import apiClient from './client';
import { ApiResponse } from '../types';

export type AlertType = 'expiring_soon' | 'expired' | 'low_stock';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface AlertItem {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  lot_id: number;
  batch_number: string;
  product_name: string;
  expires_at: string | null;
  current_quantity: number;
  unit: string;
}

export interface AlertsDashboard {
  items: AlertItem[];
  counts: Record<AlertType, number>;
}

export const alertsApi = {
  getDashboard: async (type?: AlertType): Promise<AlertsDashboard> => {
    const res = await apiClient.get<ApiResponse<AlertsDashboard>>('/alerts', {
      params: type ? { type } : undefined,
    });
    return res.data.data;
  },
};
