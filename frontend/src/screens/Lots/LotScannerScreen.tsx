import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';
import { labelsApi } from '../../api/labels';

type NavigationProp = NativeStackNavigationProp<LotsStackParamList, 'ScanLotLabel'>;

const DUPLICATE_SCAN_WINDOW_MS = 2500;

export function LotScannerScreen({ navigation }: { navigation: NavigationProp }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cameraFacing] = useState<CameraType>('back');
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);

  const permissionDenied = useMemo(
    () => permission && !permission.granted && !permission.canAskAgain,
    [permission]
  );

  const handleScan = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      const now = Date.now();
      const previous = lastScanRef.current;

      if (isResolving) return;
      if (previous && previous.value === data && now - previous.at < DUPLICATE_SCAN_WINDOW_MS) {
        return;
      }

      lastScanRef.current = { value: data, at: now };
      setIsResolving(true);
      setFeedback(null);

      try {
        const lotId = await labelsApi.findLotIdByScan(data);

        if (!lotId) {
          setFeedback('Codice letto, ma nessun lotto corrispondente trovato.');
          return;
        }

        navigation.replace('LotDetail', { lotId });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Errore durante la ricerca del lotto';
        setFeedback(message);
      } finally {
        setIsResolving(false);
      }
    },
    [isResolving, navigation]
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Accesso fotocamera richiesto</Text>
        <Text style={styles.permissionText}>
          Serve la fotocamera per leggere QR e barcode delle etichette lotto.
        </Text>

        {permissionDenied ? (
          <>
            <Text style={styles.deniedText}>
              Permesso negato in modo permanente. Apri le impostazioni e abilita la fotocamera per
              continuare.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => Linking.openSettings()}>
              <Text style={styles.primaryBtnText}>Apri impostazioni</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Concedi permesso</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraFacing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleScan}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.hintText}>Inquadra QR o barcode della label</Text>
        {isResolving && (
          <View style={styles.loadingChip}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingChipText}>Cerco lotto...</Text>
          </View>
        )}
        {feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#60a5fa',
    borderRadius: 16,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  hintText: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  loadingChip: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loadingChipText: { color: '#fff', fontWeight: '600' },
  feedbackText: {
    marginTop: 16,
    color: '#fecaca',
    backgroundColor: 'rgba(127, 29, 29, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    textAlign: 'center',
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  deniedText: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
