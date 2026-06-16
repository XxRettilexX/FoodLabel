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
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  base_unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs';
  is_active: boolean;
  notes?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
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
  role: 'owner' | 'manager' | 'warehouse' | 'kitchen' | 'viewer';
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

export interface CreateProductPayload {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  base_unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs';
  is_active?: boolean;
  notes?: string;
}

export type MeasureUnit = 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pz';

export interface RecipeItem extends Timestamps {
  id: number;
  recipe_id: number;
  product_id: number;
  quantity: number | string;
  unit: MeasureUnit;
  notes: string | null;
  product?: Product;
}

export interface Recipe extends Timestamps {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  yield_quantity: number | string | null;
  yield_unit: MeasureUnit | null;
  is_active: boolean;
  items?: RecipeItem[];
  items_count?: number;
}

export interface CreateRecipePayload {
  name: string;
  code?: string;
  description?: string;
  yield_quantity?: number;
  yield_unit?: MeasureUnit;
  is_active?: boolean;
  items?: Array<{
    product_id: number;
    quantity: number;
    unit: MeasureUnit;
    notes?: string;
  }>;
}

export interface ProductionInput extends Timestamps {
  id: number;
  production_id: number;
  lot_id: number;
  product_id: number;
  quantity_used: number | string;
  unit: MeasureUnit;
  notes: string | null;
  lot?: Lot;
  product?: Product;
}

export interface Production extends Timestamps {
  id: number;
  recipe_id: number | null;
  name: string;
  produced_at: string;
  output_quantity: number | string | null;
  output_unit: MeasureUnit | null;
  notes: string | null;
  created_by: number;
  recipe?: Recipe | null;
  createdBy?: User;
  inputs?: ProductionInput[];
  inputs_count?: number;
}

export interface CreateProductionPayload {
  recipe_id?: number;
  name: string;
  produced_at: string;
  output_quantity?: number;
  output_unit?: MeasureUnit;
  notes?: string;
  inputs: Array<{
    lot_id: number;
    product_id: number;
    quantity_used: number;
    unit: MeasureUnit;
    notes?: string;
  }>;
}
