import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bluetoothPrinter, BluetoothDevice, describePrinterError } from './bluetoothPrinter';

const STORAGE_KEY = 'printer:last_device';

/**
 * Gestisce la persistenza dell'ultima stampante accoppiata, cosi' l'operatore
 * non deve ripetere il pairing ad ogni stampa. La connessione fisica va
 * comunque ristabilita ad ogni utilizzo (il Bluetooth classic si disconnette
 * quando l'app va in background).
 */
export function usePrinterConnection() {
  const [savedDevice, setSavedDevice] = useState<BluetoothDevice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          setSavedDevice(JSON.parse(raw));
        } catch {
          // ignora dati corrotti nello storage
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveDevice = useCallback(async (device: BluetoothDevice) => {
    setSavedDevice(device);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(device));
  }, []);

  const forgetDevice = useCallback(async () => {
    setSavedDevice(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { savedDevice, hydrated, saveDevice, forgetDevice };
}

export { describePrinterError };
