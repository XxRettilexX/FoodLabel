import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LotStatus } from '../types';
import { radii, spacing, typography, statusColors } from '../../core/theme/tokens';
import { StatusIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

interface StatusBadgeProps {
  status: LotStatus;
  /**
   * Data di scadenza del lotto (ISO), opzionale. Se fornita e lo stato e' `active`,
   * il badge passa automaticamente al livello "in scadenza" quando mancano pochi
   * giorni — pura logica di presentazione (confronto date), nessuna chiamata API.
   */
  expiresAt?: string | null;
  style?: ViewStyle;
}

/** Livelli visivi disponibili — coincidono con le chiavi di `statusColors`/`StatusIcons`. */
type VisualTier = keyof typeof statusColors;

/** Sotto questa soglia di giorni un lotto ancora `active` viene mostrato come "in scadenza". */
const WARNING_THRESHOLD_DAYS = 3;

const STATUS_LABELS: Record<LotStatus, string> = {
  active: 'VALIDO',
  consumed: 'ESAURITO',
  expired: 'SCADUTO',
  quarantined: 'QUARANTENA',
};

const STATUS_TIER: Record<LotStatus, VisualTier> = {
  active: 'ok',
  consumed: 'pending',
  expired: 'expired',
  quarantined: 'warning',
};

const TIER_ICONS: Record<VisualTier, typeof StatusIcons.ok> = {
  ok: StatusIcons.ok,
  warning: StatusIcons.warning,
  expired: StatusIcons.expired,
  pending: StatusIcons.pending,
};

/** Giorni interi tra oggi e `dateStr`, ignorando l'orario (evita risultati errati a cavallo di mezzanotte). */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
}

export function StatusBadge({ status, expiresAt, style }: StatusBadgeProps) {
  let tier: VisualTier = STATUS_TIER[status] ?? 'ok';
  let label: string = STATUS_LABELS[status] ?? STATUS_LABELS.active;

  if (status === 'active' && expiresAt) {
    const days = daysUntil(expiresAt);
    if (days >= 0 && days <= WARNING_THRESHOLD_DAYS) {
      tier = 'warning';
      label = days === 0 ? 'IN SCADENZA · OGGI' : `IN SCADENZA · ${days} g`;
    }
  }

  const config = statusColors[tier];
  const Icon = TIER_ICONS[tier];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Stato: ${label}`}
    >
      <Icon size={ICON_SIZE.status} color={config.text} strokeWidth={ICON_STROKE} />
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.pill,
    // Bordo pieno e marcato invece di un hairline 1px: deve superare il "2-meter glance
    // test" (design-system/MASTER.md §2.2) anche su schermo sporco/luce scarsa.
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.label,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
