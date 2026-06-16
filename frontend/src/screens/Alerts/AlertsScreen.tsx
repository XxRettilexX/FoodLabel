import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { alertsApi, AlertType } from '../../api/alerts';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { useApiData } from '../../hooks/useApiData';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors } from '../../theme/tokens';

type FilterType = 'all' | AlertType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tutti' },
  { key: 'expiring_soon', label: 'In scadenza' },
  { key: 'expired', label: 'Scaduti' },
  { key: 'low_stock', label: 'Sotto soglia' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.primary,
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

  // Bug fix: changing the filter updates fetcher but focus listener alone never reloads data.
  useEffect(() => {
    load();
  }, [filter, load]);

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
      <View style={styles.header}>
        <Text style={styles.title}>Alert operativi</Text>
        <Text style={styles.subtitle}>Priorita immediate su sicurezza e stock</Text>
      </View>

      <View style={styles.statsRow}>
        {headerStats.map((stat) => (
          <SurfaceCard key={stat.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </SurfaceCard>
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
            <View style={[styles.accent, { backgroundColor: PRIORITY_COLORS[item.priority] ?? colors.textTertiary }]} />
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
        ListEmptyComponent={<EmptyState message="Nessun alert attivo." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, paddingLeft: 6 },
  priorityBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, paddingLeft: 6 },
  meta: { fontSize: 12, color: colors.textTertiary, paddingLeft: 6 },
});
