export const primitiveColors = {
  slate: {
    50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8',
    500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A',
    950: '#020617',
  },
  green: {
    50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534',
  },
  amber: {
    50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E',
  },
  red: {
    50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B',
  },
  blue: {
    50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
  },
  white: '#FFFFFF',
  black: '#000000',
};

// Semantic UI Colors (Light Mode)
export const colors = {
  bg: primitiveColors.slate[50], // --color-background
  surface: primitiveColors.white, // --color-surface
  surfaceMuted: primitiveColors.slate[50], // fallback for old code
  surfaceElevated: primitiveColors.white, // --color-surface-elevated
  text: primitiveColors.slate[900], // --color-foreground
  textSecondary: primitiveColors.slate[600], // --color-foreground-secondary
  textTertiary: primitiveColors.slate[400], // --color-foreground-muted
  border: primitiveColors.slate[200], // --color-border
  borderStrong: primitiveColors.slate[300], // --color-border-strong
  primary: primitiveColors.blue[700], // --color-primary
  primaryPressed: '#1E40AF', // --color-primary-hover
  onPrimary: primitiveColors.white, // --color-on-primary
  success: primitiveColors.green[600], // --color-accent
  danger: primitiveColors.red[600], // --color-destructive
  onDanger: primitiveColors.white, // --color-on-destructive
  warning: primitiveColors.amber[600],
  info: primitiveColors.blue[600],
};

export const statusColors = {
  ok: { bg: primitiveColors.green[100], border: primitiveColors.green[600], text: primitiveColors.green[700] },
  warning: { bg: primitiveColors.amber[100], border: primitiveColors.amber[600], text: primitiveColors.amber[800] },
  expired: { bg: primitiveColors.red[100], border: primitiveColors.red[600], text: primitiveColors.red[800] },
  pending: { bg: primitiveColors.slate[100], border: primitiveColors.slate[400], text: primitiveColors.slate[600] },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  // Mapping old tokens to new ones for backwards compatibility during migration
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const typography = {
  sizes: {
    display: 28,
    title: 22,
    heading: 18,
    body: 16,
    bodyMedium: 16,
    label: 14,
    caption: 14,
    mono: 14,
    monoLg: 16,
  },
  lineHeights: {
    body: 24,
    label: 20,
  },
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  modal: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  }
};
