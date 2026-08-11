/**
 * Centralized Lucide icon mapping for the FoodLabel app.
 *
 * All icons use outline style with strokeWidth 1.5 for a premium,
 * Swiss/Apple-like feel. Never use filled icons or colored backgrounds.
 *
 * Size guide:
 *   navbar      → 24
 *   header      → 20
 *   list items  → 18
 *   empty state → 48
 *   badge/inline→ 14-16
 *   status      → 18
 */
import {
  LayoutDashboard,
  Package,
  Layers,
  ChefHat,
  UtensilsCrossed,
  ScanLine,
  Bell,
  Users,
  CircleUserRound,
  Plus,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  PackageOpen,
  ClipboardList,
  ShieldAlert,
  LogOut,
  CookingPot,
  Barcode,
  Info,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  XCircle,
  Clock,
  CalendarClock,
  Warehouse,
  Printer,
  Thermometer,
  WifiOff,
  FileText,
  SlidersHorizontal,
  Pencil,
  Settings,
  Camera,
} from 'lucide-react-native';

/** Default stroke width for all icons across the app. */
export const ICON_STROKE = 1.5;

/** Icon sizes by context. */
export const ICON_SIZE = {
  navbar: 24,
  header: 20,
  list: 18,
  // Alias di `list`: stessa categoria semantica (icone dentro righe/badge di contenuto).
  md: 18,
  emptyState: 48,
  badge: 14,
  inline: 16,
  status: 18,
} as const;

// ── Tab bar icons ──────────────────────────────────────────
export const TabIcons = {
  Dashboard: LayoutDashboard,
  Prodotti: Package,
  Lotti: Layers,
  Ricette: ChefHat,
  Alert: Bell,
  Profilo: CircleUserRound,
} as const;

// ── Action icons ───────────────────────────────────────────
export const ActionIcons = {
  Add: Plus,
  Search,
  Scan: ScanLine,
  Delete: Trash2,
  Logout: LogOut,
  Filter: SlidersHorizontal,
  Close: X,
  Next: ChevronRight,
  Back: ChevronLeft,
  Info,
  Edit: Pencil,
  Print: Printer,
  Settings,
  Camera,
} as const;

// ── Domain icons ───────────────────────────────────────────
export const DomainIcons = {
  Product: Package,
  Lot: Layers,
  Recipe: ChefHat,
  Production: CookingPot,
  Preparation: UtensilsCrossed,
  Movement: ClipboardList,
  Barcode,
  Staff: Users,
  Alert: ShieldAlert,
  Inventory: Warehouse,
  Thermometer,
  Calendar: CalendarClock,
  Invoice: FileText,
} as const;

// ── Movement type icons ────────────────────────────────────
export const MovementIcons = {
  IN: ArrowDownToLine,
  OUT: ArrowUpFromLine,
  ADJUST: RefreshCw,
} as const;

// ── State icons (for empty states & feedback) ──────────────
export const StateIcons = {
  Empty: PackageOpen,
  Error: AlertTriangle,
  Success: CheckCircle2,
  Offline: WifiOff,
} as const;

// ── Status icons (for triple-encoding) ─────────────────────
export const StatusIcons = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  expired: XCircle,
  pending: Clock,
} as const;
