import React from 'react';
import { ViewStyle } from 'react-native';
import { AppButton } from './AppButton';

interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger';
  style?: ViewStyle;
}

export function SubmitButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: SubmitButtonProps) {
  return <AppButton label={label} onPress={onPress} loading={loading} disabled={disabled} variant={variant} style={style} />;
}
