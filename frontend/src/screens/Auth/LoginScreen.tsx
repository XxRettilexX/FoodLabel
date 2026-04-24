import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../api/client';
import { AppButton } from '../../components/AppButton';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, spacing } from '../../theme/tokens';

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
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', backgroundColor: colors.bg },
  topBlock: { marginBottom: spacing.lg },
  kicker: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: 8, fontSize: 15, color: colors.textSecondary },
  formCard: { gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  input: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
});
