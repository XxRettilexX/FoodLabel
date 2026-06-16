import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../core/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors, spacing } from '../../core/theme/tokens';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profilo operatore</Text>
      <SurfaceCard style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Utente'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Ruolo {user?.role || 'N/A'}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Sessione</Text>
        <Text style={styles.sectionText}>Usa logout per terminare in sicurezza su dispositivi condivisi.</Text>
        <AppButton label="Esci" onPress={logout} variant="danger" style={{ marginTop: spacing.sm }} />
      </SurfaceCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
  header: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  email: { fontSize: 15, color: colors.textSecondary, marginTop: 2, marginBottom: 8 },
  role: { fontSize: 13, color: '#065f46', fontWeight: '700', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionText: { marginTop: 6, color: colors.textSecondary, fontSize: 13 },
});
