import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';
import { colors, spacing, typography } from '../../core/theme/tokens';
import { StateIcons, ICON_STROKE, ICON_SIZE } from '../../core/theme/icons';

interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <StateIcons.Error
        size={ICON_SIZE.emptyState}
        strokeWidth={ICON_STROKE}
        color={colors.warning}
      />
      <Text style={styles.title}>Errore operativo</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton label="Riprova" onPress={onRetry} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing[8],
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  message: {
    fontSize: typography.sizes.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing[5],
    lineHeight: typography.lineHeights.body,
  },
  button: {
    minWidth: 140,
  },
});
