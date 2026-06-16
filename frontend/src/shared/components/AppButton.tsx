import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radii } from '../../core/theme/tokens';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'secondary'
      ? styles.secondary
      : variant === 'danger'
      ? styles.danger
      : variant === 'success'
      ? styles.success
      : styles.primary;

  const textStyle = variant === 'secondary' ? styles.secondaryText : styles.primaryText;

  return (
    <TouchableOpacity
      style={[styles.base, variantStyle, isDisabled && styles.disabled, style]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator color={variant === 'secondary' ? colors.primary : '#fff'} /> : <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  success: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
