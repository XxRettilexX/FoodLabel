import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LotStatus } from '../types';
import { radii } from '../../core/theme/tokens';

interface StatusBadgeProps {
  status: LotStatus;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<LotStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Attivo', bg: '#dcfce7', fg: '#166534' },
  consumed: { label: 'Esaurito', bg: '#e0e7ff', fg: '#3730a3' },
  expired: { label: 'Scaduto', bg: '#fee2e2', fg: '#991b1b' },
  quarantined: { label: 'Quarantena', bg: '#fef3c7', fg: '#92400e' },
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
