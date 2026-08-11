import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LotStatus } from '../types';
import { radii, spacing, typography, statusColors } from '../../core/theme/tokens';
import { StatusIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

interface StatusBadgeProps {
  status: LotStatus;
  style?: ViewStyle;
}

const STATUS_MAP: Record<LotStatus, { label: string; config: typeof statusColors.ok; icon: typeof StatusIcons.ok }> = {
  active: { label: 'VALIDO', config: statusColors.ok, icon: StatusIcons.ok },
  consumed: { label: 'ESAURITO', config: statusColors.pending, icon: StatusIcons.pending },
  expired: { label: 'SCADUTO', config: statusColors.expired, icon: StatusIcons.expired },
  quarantined: { label: 'QUARANTENA', config: statusColors.warning, icon: StatusIcons.warning },
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const mapInfo = STATUS_MAP[status] || STATUS_MAP.active;
  const { label, config, icon: Icon } = mapInfo;

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
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.label,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
