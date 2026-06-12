import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';
import { colors } from '../theme/tokens';
import { StateIcons, ICON_STROKE, ICON_SIZE } from '../theme/icons';

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
    padding: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    minWidth: 140,
  },
});
