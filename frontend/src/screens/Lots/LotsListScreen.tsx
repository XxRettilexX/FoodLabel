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
      <FlatList
        data={lots}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LotDetail', { lotId: item.id })}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState message="Nessun lotto registrato." icon="📋" />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLot')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+ Nuovo Lotto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  batch: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  product: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 24,
  },
  infoBlock: {},
  infoLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
