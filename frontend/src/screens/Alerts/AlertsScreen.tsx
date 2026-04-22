import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { alertsApi, AlertItem, AlertType } from '../../api/alerts';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { useApiData } from '../../hooks/useApiData';

type FilterType = 'all' | AlertType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tutti' },
  { key: 'expiring_soon', label: 'In scadenza' },
  { key: 'expired', label: 'Scaduti' },
  { key: 'low_stock', label: 'Sotto soglia' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#b91c1c',
  medium: '#b45309',
  low: '#1d4ed8',
};

export function AlertsScreen({ navigation }: { navigation: any }) {
  const [filter, setFilter] = useState<FilterType>('all');

  const fetcher = useCallback(
    () => alertsApi.getDashboard(filter === 'all' ? undefined : filter),
    [filter]
  );
  const { data, loading, error, load, refresh } = useApiData(fetcher, {
    items: [],
    counts: { expiring_soon: 0, expired: 0, low_stock: 0 },
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, load]);

  const headerStats = useMemo(
    () => [
      { label: 'Scaduti', value: data.counts.expired, color: '#b91c1c' },
      { label: 'In scadenza', value: data.counts.expiring_soon, color: '#d97706' },
      { label: 'Sotto soglia', value: data.counts.low_stock, color: '#2563eb' },
    ],
    [data.counts]
  );

  if (loading && data.items.length === 0) return <LoadingScreen />;
  if (error && data.items.length === 0) return <ErrorScreen message={error} onRetry={refresh} />;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {headerStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data.items}
        keyExtractor={(item, index) => `${item.lot_id}-${item.type}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Lotti', { screen: 'LotDetail', params: { lotId: item.lot_id } })}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${PRIORITY_COLORS[item.priority] ?? '#6b7280'}20` },
                ]}
              >
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] ?? '#6b7280' }]}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.meta}>
              Lotto {item.batch_number} • {item.current_quantity} {item.unit}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Nessun alert attivo." icon="✅" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  filterChip: {
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  priorityBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 13, color: '#374151', marginBottom: 8 },
  meta: { fontSize: 12, color: '#6b7280' },
});
