// ────────────────────────────────────────────────────────
// Types coerenti con le response API del backend Laravel
// ────────────────────────────────────────────────────────

// ── Base ──────────────────────────────────────────────

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// ── Supplier ─────────────────────────────────────────

export interface Supplier extends Timestamps {
  id: number;
  name: string;
  contact_info?: string | null;
}

// ── Product ──────────────────────────────────────────

export interface Product extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  supplier_id: number | null;
  default_shelf_life_days: number | null;
  supplier?: Supplier | null;
  lots?: Lot[];
}

// ── Lot ──────────────────────────────────────────────

export type LotStatus = 'active' | 'consumed' | 'expired' | 'quarantined';
export type LotUnit = 'kg' | 'g' | 'l' | 'pz';

export interface Lot extends Timestamps {
  id: number;
  product_id: number;
  user_id: number;
  batch_number: string;
  produced_at: string | null;
  expires_at: string;
  initial_quantity: number;
  current_quantity: number;
  unit: LotUnit;
  status: LotStatus;
  product?: Product;
  created_by?: User;
  movements?: InventoryMovement[];
  labels?: Label[];
  alerts?: Alert[];
}

// ── InventoryMovement ────────────────────────────────

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface InventoryMovement extends Timestamps {
  id: number;
  lot_id: number;
  user_id: number;
  type: MovementType;
  quantity: number;
  notes: string | null;
  lot?: Lot;
  user?: User;
}

// ── Label (riferimento leggero) ──────────────────────

export interface Label extends Timestamps {
  id: number;
  lot_id: number;
  format: string;
  file_path: string | null;
}

// ── Alert (riferimento leggero) ──────────────────────

export interface Alert extends Timestamps {
  id: number;
  lot_id: number;
  type: string;
  message: string;
  resolved_at: string | null;
}

// ── User (riferimento leggero) ───────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}

// ── API Response Wrappers ────────────────────────────

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiPaginatedResponse<T> {
  data: PaginatedResponse<T>;
}

// ── Payloads per creazione ───────────────────────────

export interface CreateLotPayload {
  product_id: number;
  batch_number: string;
  produced_at?: string | null;
  expires_at: string;
  initial_quantity: number;
  unit: LotUnit;
  notes?: string;
}

export interface CreateMovementPayload {
  lot_id: number;
  type: MovementType;
  quantity: number;
  notes?: string;
}
