import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, elevation, radii } from '../theme/tokens';

export function SurfaceCard({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...elevation.card,
  },
});
