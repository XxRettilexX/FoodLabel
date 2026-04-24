import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';
import { lotsApi } from '../../api/lots';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Lot } from '../../types';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors } from '../../theme/tokens';

type NavigationProp = NativeStackNavigationProp<LotsStackParamList, 'LotsList'>;

export function LotsListScreen({ navigation }: { navigation: NavigationProp }) {
  const fetcher = useCallback(() => lotsApi.getAll(), []);
  const { data: lots, loading, error, load, refresh } = useApiData<Lot[]>(fetcher, []);

  useEffect(() => {
    // Ricarica i dati ogni volta che la schermata torna in focus
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, load]);

  if (loading && lots.length === 0) return <LoadingScreen />;
  if (error && lots.length === 0) return <ErrorScreen message={error} onRetry={refresh} />;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/D';
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lotti</Text>
        <Text style={styles.subtitle}>Controllo rapido disponibilita e scadenze</Text>
      </View>

      <FlatList
        data={lots}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrap}
            onPress={() => navigation.navigate('LotDetail', { lotId: item.id })}
            activeOpacity={0.7}
          >
            <SurfaceCard>
              <View style={styles.cardHeader}>
                <Text style={styles.batch}>{item.batch_number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.product}>
                {item.product?.name || 'Prodotto sconosciuto'}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Giacenza</Text>
                  <Text style={styles.infoValue}>
                    {item.current_quantity} {item.unit}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Scadenza</Text>
                  <Text style={styles.infoValue}>{formatDate(item.expires_at)}</Text>
                </View>
              </View>
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState message="Nessun lotto registrato." icon="📋" />
        }
      />

      <SurfaceCard style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSecondary]}
          onPress={() => navigation.navigate('ScanLotLabel')}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionText, styles.actionTextSecondary]}>Scansiona</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('CreateLot')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>Nuovo lotto</Text>
        </TouchableOpacity>
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 4,
  },
  cardWrap: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  batch: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  product: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 24,
  },
  infoBlock: {},
  infoLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 14,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  actionSecondary: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionTextSecondary: {
    color: colors.text,
  },
});
