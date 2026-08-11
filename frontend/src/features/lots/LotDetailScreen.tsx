import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from './LotsNavigator';
import { lotsApi } from './api';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { AppButton } from '../../shared/components/AppButton';
import { Lot, InventoryMovement, MovementType } from '../../shared/types';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { PrintLabelButton } from '../printer/PrintLabelButton';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { MovementIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

type RouteProps = RouteProp<LotsStackParamList, 'LotDetail'>;
type NavProps = NativeStackNavigationProp<LotsStackParamList, 'LotDetail'>;

const MOVEMENT_TYPE_LABELS: Record<MovementType, { label: string; Icon: any; color: string }> = {
  IN: { label: 'Carico', Icon: MovementIcons.IN, color: colors.success },
  OUT: { label: 'Scarico', Icon: MovementIcons.OUT, color: colors.danger },
  ADJUST: { label: 'Rettifica', Icon: MovementIcons.ADJUST, color: colors.warning },
};

export function LotDetailScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const { lotId } = route.params;
  const fetcher = useCallback(() => lotsApi.getById(lotId), [lotId]);
  const { data: lot, loading, error, load, refresh } = useApiData<Lot | null>(fetcher, null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { load(); });
    return unsubscribe;
  }, [navigation, load]);

  if (loading && !lot) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!lot) return <ErrorScreen message="Lotto non trovato" />;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/D';
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = async () => {
    if (!lot) return;
    try {
      Alert.alert('Stampa in corso', 'Generazione etichetta...');
      // Estrai l'IP dell'host dal file .env (es. 100.x.x.x o 192.168.x.x)
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const ipMatch = apiUrl.match(/https?:\/\/([^:]+)/);
      const printerIp = ipMatch ? ipMatch[1] : '127.0.0.1';

      // 1. Crea etichetta a sistema
      const label = await lotsApi.createLabel(lot.id); // Assuming this is correct API mapping
      
      // 2. Invia alla print preview app
      await lotsApi.printLabelNetwork(label.id, printerIp);
      
      Alert.alert('Successo', 'Etichetta inviata all\'app di stampa!');
    } catch (err: any) {
      Alert.alert('Errore di stampa', err.response?.data?.message || 'Impossibile inviare alla stampante.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.batchNumber}>{lot.batch_number}</Text>
          <StatusBadge status={lot.status} />
        </View>
        <Text style={styles.productName}>{lot.product?.name || 'Prodotto sconosciuto'}</Text>
        {lot.product?.supplier?.name && <Text style={styles.supplierName}>Fornitore: {lot.product.supplier.name}</Text>}
      </SurfaceCard>
      <View style={styles.quantityRow}>
        <SurfaceCard style={styles.quantityCard}><Text style={styles.qtyLabel}>Iniziale</Text><Text style={styles.qtyValue}>{lot.initial_quantity} {lot.unit}</Text></SurfaceCard>
        <SurfaceCard style={[styles.quantityCard, styles.quantityCardHighlight]}><Text style={[styles.qtyLabel, { color: '#fff' }]}>Attuale</Text><Text style={[styles.qtyValue, { color: '#fff' }]}>{lot.current_quantity} {lot.unit}</Text></SurfaceCard>
      </View>
      <SurfaceCard style={styles.section}>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}><Text style={styles.dateLabel}>Prodotto il</Text><Text style={styles.dateValue}>{formatDate(lot.produced_at)}</Text></View>
          <View style={styles.dateItem}><Text style={styles.dateLabel}>Scade il</Text><Text style={styles.dateValue}>{formatDate(lot.expires_at)}</Text></View>
        </View>
        {lot.created_by && <Text style={styles.createdBy}>Registrato da: {lot.created_by.name}</Text>}
      </SurfaceCard>
      <View style={styles.actionsRow}>
        <AppButton label="Registra movimento" onPress={() => navigation.navigate('CreateMovement', { lotId: lot.id })} variant="primary" style={{ flex: 1, marginRight: spacing[2] }} />
        <AppButton label="Etichetta (rete)" onPress={handlePrint} variant="secondary" style={{ flex: 1, marginLeft: spacing[2] }} />
      </View>
      <PrintLabelButton lotId={lot.id} style={{ marginBottom: spacing[4] }} />
      <SurfaceCard style={styles.section}>
        <Text style={styles.sectionTitle}>Storico Movimenti ({lot.movements?.length || 0})</Text>
        {lot.movements && lot.movements.length > 0 ? lot.movements.map((m: InventoryMovement) => {
          const config = MOVEMENT_TYPE_LABELS[m.type];
          const Icon = config.Icon;
          return (
            <View key={m.id} style={styles.movementCard}>
              <View style={styles.movementHeader}>
                <View style={styles.movementTitleRow}>
                  <Icon size={ICON_SIZE.inline} color={config.color} strokeWidth={ICON_STROKE} />
                  <Text style={[styles.movementType, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={[styles.movementQty, { color: config.color }]}>{m.type === 'OUT' ? '-' : m.type === 'IN' ? '+' : ''}{m.quantity} {lot.unit}</Text>
              </View>
              <Text style={styles.movementDate}>{formatDateTime(m.created_at)}</Text>
              {m.notes && <Text style={styles.movementNotes}>{m.notes}</Text>}
              {m.user && <Text style={styles.movementUser}>di {m.user.name}</Text>}
            </View>
          );
        }) : <Text style={styles.noMovements}>Nessun movimento registrato.</Text>}
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  header: { padding: spacing[4], marginBottom: spacing[4] },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  batchNumber: { fontSize: typography.sizes.title, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
  productName: { fontSize: typography.sizes.bodyMedium, color: colors.textSecondary, fontWeight: '600' },
  supplierName: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: spacing[1] },
  quantityRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  quantityCard: { flex: 1, alignItems: 'center', padding: spacing[4] },
  quantityCardHighlight: { backgroundColor: colors.primary, borderColor: colors.primary },
  qtyLabel: { fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing[1] },
  qtyValue: { fontSize: typography.sizes.title, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
  section: { marginBottom: spacing[4], padding: spacing[4] },
  dateRow: { flexDirection: 'row', gap: spacing[5] },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: typography.sizes.label, fontWeight: '700', color: colors.textSecondary, marginTop: spacing[1], fontFamily: 'monospace' },
  createdBy: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: spacing[3] },
  actionsRow: { flexDirection: 'row', marginBottom: spacing[4] },
  sectionTitle: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text, marginBottom: spacing[3] },
  movementCard: { backgroundColor: colors.bg, padding: spacing[3], borderRadius: radii.sm, marginBottom: spacing[2], borderWidth: 1, borderColor: colors.border },
  movementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movementTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  movementType: { fontSize: typography.sizes.label, fontWeight: '600' },
  movementDate: { fontSize: 11, color: colors.textTertiary, marginTop: spacing[1] },
  movementQty: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', fontFamily: 'monospace' },
  movementNotes: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: spacing[1], fontStyle: 'italic' },
  movementUser: { fontSize: 11, color: colors.textTertiary, marginTop: spacing[1] },
  noMovements: { fontSize: typography.sizes.caption, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing[3] },
});
