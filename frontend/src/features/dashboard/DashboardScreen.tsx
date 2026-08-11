import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../core/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { ActionIcons, ICON_SIZE, ICON_STROKE, TabIcons } from '../../core/theme/icons';

export function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Ciao, {user?.name || 'Utente'}</Text>
          <Text style={styles.subtitle}>Pannello operativo HACCP</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
          accessibilityRole="button"
          accessibilityLabel="Profilo utente"
        >
          <TabIcons.Profilo size={ICON_SIZE.navbar} color={colors.primary} strokeWidth={ICON_STROKE} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SurfaceCard style={styles.heroCard}>
          <Text style={styles.heroTitle}>Azioni rapide</Text>
          <Text style={styles.heroCaption}>Riduci i tempi sulle operazioni frequenti.</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Lotti')}>
              <Text style={styles.heroButtonText}>Apri Lotti</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroButton, styles.heroButtonSecondary]} onPress={() => navigation.navigate('Alert')}>
              <Text style={[styles.heroButtonText, styles.heroButtonSecondaryText]}>Vedi Alert</Text>
            </TouchableOpacity>
          </View>
        </SurfaceCard>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.card, styles.cardWide]} onPress={() => navigation.navigate('Lotti')}>
            <Text style={styles.cardEyebrow}>Operativita</Text>
            <Text style={styles.cardTitle}>Gestione Lotti</Text>
            <Text style={styles.cardSubtitle}>Crea, consulta e aggiorna disponibilita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Prodotti')}>
            <Text style={styles.cardEyebrow}>Catalogo</Text>
            <Text style={styles.cardTitle}>Prodotti</Text>
            <Text style={styles.cardSubtitle}>Catalogo materie prime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Ricette')}>
            <Text style={styles.cardEyebrow}>Genealogia</Text>
            <Text style={styles.cardTitle}>Ricette e Produzioni</Text>
            <Text style={styles.cardSubtitle}>Origine ingredienti e preparazioni</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.alertCard]}
            onPress={() => navigation.navigate('Alert')}
          >
            <Text style={styles.cardEyebrow}>Sicurezza</Text>
            <Text style={[styles.cardTitle, styles.alertTitle]}>Alert</Text>
            <Text style={styles.cardSubtitle}>Scadenze e soglie immediate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  profileButton: {
    padding: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: { padding: spacing[4], paddingBottom: 28 },
  welcome: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: 4 },
  heroCard: { marginBottom: spacing[4] },
  heroTitle: { fontSize: typography.sizes.heading, fontWeight: '700', color: colors.text },
  heroCaption: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: 4, marginBottom: 12 },
  heroActions: { flexDirection: 'row', gap: 10 },
  heroButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: typography.sizes.body },
  heroButtonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  heroButtonSecondaryText: { color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: radii.md,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWide: { width: '100%' },
  cardEyebrow: { fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  cardTitle: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text, marginBottom: 6 },
  cardSubtitle: { fontSize: typography.sizes.caption, color: colors.textSecondary, lineHeight: 18 },
  alertCard: { borderColor: colors.danger, backgroundColor: '#FEF2F2' },
  alertTitle: { color: colors.danger },
});
