import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';
import { lotsApi } from '../../api/lots';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { StatusBadge } from '../../components/StatusBadge';
import { SubmitButton } from '../../components/SubmitButton';
import { Lot, InventoryMovement, MovementType } from '../../types';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors } from '../../theme/tokens';

type RouteProps = RouteProp<LotsStackParamList, 'LotDetail'>;
type NavProps = NativeStackNavigationProp<LotsStackParamList, 'LotDetail'>;

const MOVEMENT_TYPE_LABELS: Record<MovementType, { label: string; icon: string; color: string }> = {
  IN: { label: 'Carico', icon: '📥', color: '#059669' },
  OUT: { label: 'Scarico', icon: '📤', color: '#dc2626' },
  ADJUST: { label: 'Rettifica', icon: '🔄', color: '#d97706' },
};

export function LotDetailScreen({
  route,
  navigation,
}: {
  route: RouteProps;
  navigation: NavProps;
}) {
  const { lotId } = route.params;

  const fetcher = useCallback(() => lotsApi.getById(lotId), [lotId]);
  const { data: lot, loading, error, load, refresh } = useApiData<Lot | null>(fetcher, null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, load]);

  const handleGenerateLabel = () => {
    Alert.alert('Etichetta', 'Generazione etichetta richiesta!');
  };

  if (loading && !lot) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!lot) return <ErrorScreen message="Lotto non trovato" />;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/D';
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.batchNumber}>{lot.batch_number}</Text>
          <StatusBadge status={lot.status} />
        </View>
        <Text style={styles.productName}>
          {lot.product?.name || 'Prodotto sconosciuto'}
        </Text>
        {lot.product?.supplier?.name && (
          <Text style={styles.supplierName}>Fornitore: {lot.product.supplier.name}</Text>
        )}
      </SurfaceCard>

      <View style={styles.quantityRow}>
        <SurfaceCard style={styles.quantityCard}>
          <Text style={styles.qtyLabel}>Iniziale</Text>
          <Text style={styles.qtyValue}>
            {lot.initial_quantity} {lot.unit}
          </Text>
        </SurfaceCard>
        <SurfaceCard style={[styles.quantityCard, styles.quantityCardHighlight]}>
          <Text style={[styles.qtyLabel, { color: '#fff' }]}>Attuale</Text>
          <Text style={[styles.qtyValue, { color: '#fff' }]}>
            {lot.current_quantity} {lot.unit}
          </Text>
        </SurfaceCard>
      </View>

      <SurfaceCard style={styles.section}>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Prodotto il</Text>
            <Text style={styles.dateValue}>{formatDate(lot.produced_at)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Scade il</Text>
            <Text style={styles.dateValue}>{formatDate(lot.expires_at)}</Text>
          </View>
        </View>
        {lot.created_by && (
          <Text style={styles.createdBy}>
            Registrato da: {lot.created_by.name}
          </Text>
        )}
      </SurfaceCard>

      <View style={styles.actionsRow}>
        <SubmitButton
          label="Registra movimento"
          onPress={() => navigation.navigate('CreateMovement', { lotId: lot.id })}
          variant="primary"
          style={{ flex: 1, marginRight: 8 }}
        />
        <SubmitButton
          label="Etichetta"
          onPress={handleGenerateLabel}
          variant="success"
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      <SurfaceCard style={styles.section}>
        <Text style={styles.sectionTitle}>
          Storico Movimenti ({lot.movements?.length || 0})
        </Text>
        {lot.movements && lot.movements.length > 0 ? (
          lot.movements.map((m: InventoryMovement) => {
            const config = MOVEMENT_TYPE_LABELS[m.type];
            return (
              <View key={m.id} style={styles.movementCard}>
                <View style={styles.movementHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.movementType, { color: config.color }]}>
                      {config.icon} {config.label}
                    </Text>
                    <Text style={styles.movementDate}>
                      {formatDateTime(m.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.movementQty, { color: config.color }]}>
                    {m.type === 'OUT' ? '-' : m.type === 'IN' ? '+' : ''}
                    {m.quantity} {lot.unit}
                  </Text>
                </View>
                {m.notes && (
                  <Text style={styles.movementNotes}>{m.notes}</Text>
                )}
                {m.user && (
                  <Text style={styles.movementUser}>di {m.user.name}</Text>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.noMovements}>Nessun movimento registrato.</Text>
        )}
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    padding: 18,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  productName: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  supplierName: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Quantity
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quantityCard: {
    flex: 1,
    alignItems: 'center',
  },
  quantityCardHighlight: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  qtyLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  qtyValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  // Dates
  section: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
  createdBy: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 12,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  // Movements
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  movementCard: {
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  movementType: {
    fontSize: 14,
    fontWeight: '600',
  },
  movementDate: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  movementQty: {
    fontSize: 16,
    fontWeight: '700',
  },
  movementNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 28,
    fontStyle: 'italic',
  },
  movementUser: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
    marginLeft: 28,
  },
  noMovements: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
