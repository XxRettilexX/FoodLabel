import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../core/store/useAuthStore';
import apiClient from '../../core/api/client';
import { AppButton } from '../../shared/components/AppButton';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/login', { email, password, device_name: 'expo_app' });
      await login(response.data.access_token, response.data.user);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        Alert.alert('Errore di Accesso', 'Credenziali non valide. Riprova.');
      } else if (error.request) {
        Alert.alert('Errore di Rete', 'Impossibile connettersi al server. Controlla la tua connessione.');
      } else {
        Alert.alert('Errore', 'Si è verificato un imprevisto durante il login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBlock}>
        <Text style={styles.kicker}>FoodLabel</Text>
        <Text style={styles.title}>Tracciabilita lotto HACCP</Text>
        <Text style={styles.subtitle}>Accesso rapido e sicuro per uso operativo.</Text>
      </View>

      <SurfaceCard style={styles.formCard}>
        <Text style={styles.sectionTitle}>Accedi</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppButton label="Accedi" onPress={handleLogin} loading={loading} />
      </SurfaceCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[10], justifyContent: 'center', backgroundColor: colors.bg },
  topBlock: { marginBottom: spacing[8] },
  kicker: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.sizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[1],
  },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: spacing[2], fontSize: typography.sizes.bodyMedium, color: colors.textSecondary },
  formCard: { gap: spacing[4] },
  sectionTitle: { fontSize: typography.sizes.heading, fontWeight: '700', color: colors.text, marginBottom: spacing[1] },
  input: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: typography.sizes.body,
    color: colors.text,
    minHeight: 52,
  },
});
