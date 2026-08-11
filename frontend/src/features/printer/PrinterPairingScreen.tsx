import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../lots/LotsNavigator';
import { bluetoothPrinter, BluetoothDevice, describePrinterError } from './bluetoothPrinter';
import { usePrinterConnection } from './usePrinterConnection';
import { AppButton } from '../../shared/components/AppButton';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { EmptyState } from '../../shared/components/EmptyState';
import { colors, spacing, typography } from '../../core/theme/tokens';

type NavProps = NativeStackNavigationProp<LotsStackParamList, 'PrinterPairing'>;

export function PrinterPairingScreen({ navigation }: { navigation: NavProps }) {
  const { savedDevice, saveDevice } = usePrinterConnection();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectingAddress, setConnectingAddress] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setScanError(null);
    try {
      const found = await bluetoothPrinter.listPairedDevices();
      setDevices(found);
    } catch (err) {
      setScanError(describePrinterError(err));
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    if (bluetoothPrinter.isSupportedPlatform()) {
      scan();
    }
  }, [scan]);

  const handleSelect = async (device: BluetoothDevice) => {
    setConnectingAddress(device.address);
    try {
      await bluetoothPrinter.connect(device.address);
      await saveDevice(device);
      Alert.alert('Stampante collegata', `${device.name} pronta per la stampa.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Connessione fallita', describePrinterError(err));
    } finally {
      setConnectingAddress(null);
    }
  };

  if (!bluetoothPrinter.isSupportedPlatform()) {
    return (
      <View style={styles.container}>
        <EmptyState message="Stampa Bluetooth disponibile solo su Android" />
        <Text style={styles.iosNote}>
          iOS non permette alle app di terze parti di usare il Bluetooth Classic (SPP) richiesto dalle
          stampanti termiche ESC/POS: e' un limite del sistema operativo, non di questa app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stampante Bluetooth</Text>
        <Text style={styles.subtitle}>
          {savedDevice
            ? `Attualmente collegata: ${savedDevice.name}`
            : 'Accendi la stampante e accoppiala prima dalle impostazioni Bluetooth del telefono, poi selezionala qui sotto.'}
        </Text>
      </View>

      {scanError && <Text style={styles.error}>{scanError}</Text>}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        contentContainerStyle={styles.listContent}
        refreshing={scanning}
        onRefresh={scan}
        ListEmptyComponent={!scanning ? <EmptyState message="Nessuna stampante accoppiata trovata." /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceRow}
            onPress={() => handleSelect(item)}
            disabled={connectingAddress !== null}
            activeOpacity={0.7}
          >
            <SurfaceCard style={[styles.deviceCard, savedDevice?.address === item.address && styles.deviceCardSelected]}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceAddress}>{item.address}</Text>
              {connectingAddress === item.address && <Text style={styles.connecting}>Connessione in corso...</Text>}
            </SurfaceCard>
          </TouchableOpacity>
        )}
      />

      <AppButton label="Aggiorna elenco" variant="secondary" onPress={scan} loading={scanning} style={styles.refreshBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing[4] },
  header: { marginBottom: spacing[4] },
  title: { fontSize: typography.sizes.title, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing[2], lineHeight: typography.lineHeights.body },
  error: { fontSize: typography.sizes.caption, color: colors.danger, marginBottom: spacing[3], fontWeight: '600' },
  listContent: { paddingBottom: spacing[10] },
  deviceRow: { marginBottom: spacing[3] },
  deviceCard: {},
  deviceCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  deviceName: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text },
  deviceAddress: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: 2, fontFamily: 'monospace' },
  connecting: { fontSize: typography.sizes.caption, color: colors.primary, marginTop: spacing[2], fontWeight: '600' },
  refreshBtn: { marginTop: spacing[2] },
  iosNote: { fontSize: typography.sizes.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing[3], paddingHorizontal: spacing[6] },
});
