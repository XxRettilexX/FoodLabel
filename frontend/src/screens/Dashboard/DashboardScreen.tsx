import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors, spacing } from '../../theme/tokens';

export function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.welcome}>Ciao, {user?.name || 'Utente'}</Text>
        <Text style={styles.subtitle}>Pannello operativo HACCP</Text>

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

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profilo')}>
            <Text style={styles.cardEyebrow}>Account</Text>
            <Text style={styles.cardTitle}>Profilo</Text>
            <Text style={styles.cardSubtitle}>Vai al profilo operatore</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 28 },
  welcome: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  heroCard: { marginBottom: spacing.md },
  heroTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  heroCaption: { fontSize: 13, color: colors.textTertiary, marginTop: 4, marginBottom: 12 },
  heroActions: { flexDirection: 'row', gap: 10 },
  heroButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  heroButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroButtonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  heroButtonSecondaryText: { color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWide: { width: '100%' },
  cardEyebrow: { fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  alertCard: { borderColor: '#fecaca', backgroundColor: '#fff7f7' },
  alertTitle: { color: colors.danger },
});
