import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../core/theme/tokens';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  error?: string;
  multiline?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  multiline = false,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.sizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: typography.sizes.body,
    color: colors.text,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: typography.sizes.label,
    color: colors.danger,
    marginTop: spacing[1],
  },
});
