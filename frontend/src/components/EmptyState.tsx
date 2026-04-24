import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export function EmptyState({
  message = 'Nessun elemento trovato.',
  icon = '📭',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
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
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  caption: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
