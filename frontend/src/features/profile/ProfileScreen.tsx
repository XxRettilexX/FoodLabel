import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../core/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import {
  getPrintServerUrl,
  printServerApi,
  PrintServerUnreachableError,
} from '../lots/printServerApi';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { ActionIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

// Payload di esempio per validare connettivita' e layout etichetta sul print-server
// locale (USB+Wi-Fi), senza dipendere da un lotto reale.
function buildSamplePrintPayload() {
  const sampleExpiry = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  return {
    qrData: JSON.stringify({ test: true, label_code: 'TEST-0001' }),
    productName: 'Prodotto di Prova',
    lotNumber: 'TEST-001',
    expiryDate: sampleExpiry,
  };
}

export function ProfileScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [testingPrint, setTestingPrint] = useState(false);

  const handleTestPrint = async () => {
    setTestingPrint(true);
    try {
      await printServerApi.printLabel(buildSamplePrintPayload());
      Alert.alert('Stampa inviata', 'Controlla la stampante NETUM collegata al PC.');
    } catch (err: any) {
      const message =
        err instanceof PrintServerUnreachableError
          ? err.message
          : err?.message || 'Errore durante la stampa di prova.';
      Alert.alert('Stampa non riuscita', message);
    } finally {
      setTestingPrint(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7} accessibilityLabel="Indietro" accessibilityRole="button">
          <ActionIcons.Back size={ICON_SIZE.header} color={colors.text} strokeWidth={ICON_STROKE} />
        </TouchableOpacity>
        <Text style={styles.title}>Profilo operatore</Text>
      </View>
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
        <AppButton label="Esci" onPress={logout} variant="danger" style={{ marginTop: spacing[4] }} />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Test di stampa (Wi-Fi)</Text>
        <Text style={styles.sectionText}>
          Invia un'etichetta di prova al print-server locale ({getPrintServerUrl()}), collegato
          via USB alla NETUM sul PC. Solo per validare layout e connettivita' in fase di test.
        </Text>
        <AppButton
          label={testingPrint ? 'Invio in corso...' : 'Stampa di prova'}
          onPress={handleTestPrint}
          loading={testingPrint}
          variant="secondary"
          style={{ marginTop: spacing[4] }}
        />
      </SurfaceCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing[5], gap: spacing[4] },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[2] },
  backBtn: { padding: spacing[2], marginRight: spacing[2], borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  header: { alignItems: 'center', padding: spacing[5] },
  avatar: { width: 72, height: 72, borderRadius: radii.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[3] },
  avatarText: { fontSize: typography.sizes.display, color: colors.onPrimary, fontWeight: '700' },
  name: { fontSize: typography.sizes.title, fontWeight: '800', color: colors.text },
  email: { fontSize: typography.sizes.bodyMedium, color: colors.textSecondary, marginTop: spacing[1], marginBottom: spacing[2] },
  role: { fontSize: typography.sizes.label, color: colors.success, fontWeight: '700', backgroundColor: '#d1fae5', paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: radii.pill },
  sectionTitle: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text },
  sectionText: { marginTop: spacing[2], color: colors.textSecondary, fontSize: typography.sizes.body },
});
