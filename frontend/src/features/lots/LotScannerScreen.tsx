import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from './LotsNavigator';
import { labelsApi } from './api';
import { AppButton } from '../../shared/components/AppButton';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { colors, spacing, typography } from '../../core/theme/tokens';

type NavProps = NativeStackNavigationProp<LotsStackParamList, 'ScanLotLabel'>;

export function LotScannerScreen({ navigation }: { navigation: NavProps }) {
  const [permission, requestPermission] = useCameraPermissions();
  // BUG 8 FIX: Use a ref for isResolving to avoid stale closures in the scan callback.
  // The state is kept for UI updates, but the ref is the authoritative flag for the callback.
  const [isResolving, setIsResolving] = useState(false);
  const isResolvingRef = useRef(false);
  const lastScanRef = useRef<string | null>(null);

  const handleScan = useCallback(async ({ data }: { data: string }) => {
    // BUG 8 FIX: Read from ref (always current) instead of captured state variable (potentially stale).
    if (isResolvingRef.current) return;
    if (lastScanRef.current === data) return;
    lastScanRef.current = data;

    isResolvingRef.current = true;
    setIsResolving(true);
    try {
      const lotId = await labelsApi.findLotIdByScan(data);
      if (lotId) {
        navigation.replace('LotDetail', { lotId });
      } else {
        Alert.alert('Etichetta non trovata', 'Il QR/barcode scansionato non corrisponde a nessun lotto.', [
          { text: 'Riprova', onPress: () => { lastScanRef.current = null; isResolvingRef.current = false; setIsResolving(false); } },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Errore', error?.message || 'Impossibile cercare il lotto.', [
        { text: 'OK', onPress: () => { lastScanRef.current = null; isResolvingRef.current = false; setIsResolving(false); } },
      ]);
    }
  }, [navigation]);

  if (!permission) return <LoadingScreen message="Verifica permessi camera..." />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permesso fotocamera</Text>
        <Text style={styles.permissionText}>
          La fotocamera è necessaria per scansionare QR code e codici a barre dei lotti.
        </Text>
        <AppButton
          label={permission.canAskAgain ? 'Concedi permesso' : 'Apri impostazioni'}
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
        onBarcodeScanned={isResolving ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <View style={styles.frameBorder} />
        <Text style={styles.hint}>
          {isResolving ? 'Ricerca in corso...' : 'Inquadra il QR o il barcode del lotto'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: spacing[8] },
  permissionTitle: { fontSize: typography.sizes.heading, fontWeight: '700', color: colors.text, marginBottom: spacing[3] },
  permissionText: { fontSize: typography.sizes.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing[5] },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  frameBorder: { width: 240, height: 240, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 16 },
  hint: { color: '#fff', fontSize: typography.sizes.bodyMedium, fontWeight: '600', marginTop: spacing[5], textAlign: 'center', paddingHorizontal: spacing[8], textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
});
