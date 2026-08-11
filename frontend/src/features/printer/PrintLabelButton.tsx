import React, { useState } from 'react';
import { Alert, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../lots/LotsNavigator';
import { AppButton } from '../../shared/components/AppButton';
import { bluetoothPrinter, describePrinterError } from './bluetoothPrinter';
import { usePrinterConnection } from './usePrinterConnection';
import { labelPrintApi } from './api';
import { buildLabelPrintCommands } from './escposBuilder';

interface PrintLabelButtonProps {
  lotId: number;
  style?: ViewStyle;
}

/**
 * Bottone "Stampa etichetta" condiviso tra il flusso manuale (LotDetailScreen)
 * e il flusso automatico dopo la conferma di una fattura scansionata
 * (InvoiceReviewScreen). Genera l'etichetta lato server, poi la invia alla
 * stampante Bluetooth ESC/POS gia' accoppiata (o guida l'utente al pairing).
 */
export function PrintLabelButton({ lotId, style }: PrintLabelButtonProps) {
  const navigation = useNavigation<NativeStackNavigationProp<LotsStackParamList>>();
  const { savedDevice } = usePrinterConnection();
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (!bluetoothPrinter.isSupportedPlatform()) {
      Alert.alert(
        'Stampa non disponibile',
        'La stampa via Bluetooth richiede Android: su iOS il sistema operativo non espone il Bluetooth Classic usato dalle stampanti termiche.',
      );
      return;
    }

    if (!savedDevice) {
      Alert.alert(
        'Nessuna stampante collegata',
        'Seleziona prima la stampante Bluetooth. Dopo averla collegata, torna qui e premi di nuovo Stampa.',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Collega stampante', onPress: () => navigation.navigate('PrinterPairing') },
        ],
      );
      return;
    }

    setPrinting(true);
    try {
      const payload = await labelPrintApi.generateForLot(lotId);
      await bluetoothPrinter.connect(savedDevice.address);
      await bluetoothPrinter.printLabel(buildLabelPrintCommands(payload));
    } catch (err: any) {
      const message = err?.response?.data?.message || describePrinterError(err);
      Alert.alert('Stampa non riuscita', message, [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Riprova', onPress: handlePrint },
        { text: 'Cambia stampante', onPress: () => navigation.navigate('PrinterPairing') },
      ]);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <AppButton
      label={printing ? 'Stampa in corso...' : 'Stampa etichetta'}
      variant="success"
      onPress={handlePrint}
      loading={printing}
      style={style}
    />
  );
}
