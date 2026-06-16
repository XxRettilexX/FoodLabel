import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '../../core/theme/tokens';

interface LoadingScreenProps {
  color?: string;
  message?: string;
}

export function LoadingScreen({ color = colors.primary, message = 'Caricamento in corso...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    gap: 10,
  },
  label: {
    color: colors.textTertiary,
    fontSize: 13,
  },
});
