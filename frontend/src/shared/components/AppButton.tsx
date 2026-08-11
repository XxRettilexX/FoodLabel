import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../core/theme/tokens';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const variantStyle =
    variant === 'secondary'
      ? styles.secondary
      : variant === 'danger'
      ? styles.danger
      : variant === 'success'
      ? styles.success
      : variant === 'ghost'
      ? styles.ghost
      : styles.primary;

  const textStyle =
    variant === 'secondary'
      ? styles.secondaryText
      : variant === 'ghost'
      ? styles.ghostText
      : styles.primaryText;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.base,
          variantStyle,
          isDisabled && styles.disabled,
          !isDisabled && pressed && styles.pressed,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.primary : colors.onPrimary} />
        ) : (
          <Text style={textStyle}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56, // gloves-compatible
    paddingHorizontal: spacing[6],
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  success: {
    backgroundColor: colors.success,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  primaryText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.bodyMedium,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: typography.sizes.bodyMedium,
    fontWeight: '700',
  },
  ghostText: {
    color: colors.text,
    fontSize: typography.sizes.bodyMedium,
    fontWeight: '700',
  },
});
