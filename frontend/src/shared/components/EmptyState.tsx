import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../core/theme/tokens';
import { StateIcons, ICON_STROKE, ICON_SIZE } from '../../core/theme/icons';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  message?: string;
  Icon?: LucideIcon;
}

export function EmptyState({
  message = 'Nessun elemento trovato.',
  Icon = StateIcons.Empty,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon
        size={ICON_SIZE.emptyState}
        strokeWidth={ICON_STROKE}
        color={colors.textTertiary}
      />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.caption}>I nuovi dati appariranno qui appena disponibili.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  caption: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
