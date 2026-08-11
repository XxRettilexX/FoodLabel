import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LotsListScreen } from './LotsListScreen';
import { LotDetailScreen } from './LotDetailScreen';
import { CreateLotScreen } from './CreateLotScreen';
import { CreateMovementScreen } from './CreateMovementScreen';
import { LotScannerScreen } from './LotScannerScreen';
import { InvoiceScanScreen } from '../invoices/InvoiceScanScreen';
import { InvoiceReviewScreen } from '../invoices/InvoiceReviewScreen';
import { PrinterPairingScreen } from '../printer/PrinterPairingScreen';

export type LotsStackParamList = {
    LotsList: undefined;
    LotDetail: { lotId: number };
    CreateLot: undefined;
    CreateMovement: { lotId: number };
    ScanLotLabel: undefined;
    InvoiceScan: undefined;
    InvoiceReview: { invoiceId: number };
    PrinterPairing: { onPairedGoBack?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<LotsStackParamList>();

export function LotsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '600', color: '#1f2937' },
      }}
    >
      <Stack.Screen name="LotsList" component={LotsListScreen} options={{ title: 'Elenco Lotti' }} />
      <Stack.Screen name="LotDetail" component={LotDetailScreen} options={{ title: 'Dettagli Lotto' }} />
      <Stack.Screen name="CreateLot" component={CreateLotScreen} options={{ title: 'Nuovo Lotto' }} />
      <Stack.Screen name="CreateMovement" component={CreateMovementScreen} options={{ title: 'Nuovo Movimento' }} />
      <Stack.Screen name="ScanLotLabel" component={LotScannerScreen} options={{ title: 'Scansiona Etichetta' }} />
      <Stack.Screen name="InvoiceScan" component={InvoiceScanScreen} options={{ title: 'Scansiona Fattura' }} />
      <Stack.Screen name="InvoiceReview" component={InvoiceReviewScreen} options={{ title: 'Revisione Fattura' }} />
      <Stack.Screen name="PrinterPairing" component={PrinterPairingScreen} options={{ title: 'Stampante Bluetooth' }} />
    </Stack.Navigator>
  );
}
