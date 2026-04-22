import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
