import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../core/theme/tokens';
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
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  message: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing[3],
  },
  caption: {
    marginTop: spacing[1],
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
