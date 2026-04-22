import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LotStatus } from '../types';

interface StatusBadgeProps {
  status: LotStatus;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<LotStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Attivo', bg: '#d1fae5', fg: '#065f46' },
  consumed: { label: 'Esaurito', bg: '#e0e7ff', fg: '#3730a3' },
  expired: { label: 'Scaduto', bg: '#fee2e2', fg: '#991b1b' },
  quarantined: { label: 'In Quarantena', bg: '#fef3c7', fg: '#92400e' },
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
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
