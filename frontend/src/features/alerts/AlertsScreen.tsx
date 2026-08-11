import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { alertsApi, AlertType } from './api';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { EmptyState } from '../../shared/components/EmptyState';
import { useApiData } from '../../shared/hooks/useApiData';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

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
      { label: 'Scaduti', value: data.counts.expired, color: colors.danger },
      { label: 'In scadenza', value: data.counts.expiring_soon, color: colors.warning },
      { label: 'Sotto soglia', value: data.counts.low_stock, color: colors.primary },
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
                  { backgroundColor: `${PRIORITY_COLORS[item.priority] ?? colors.textTertiary}20` },
                ]}
              >
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] ?? colors.textTertiary }]}>
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
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.label, color: colors.textSecondary, marginTop: spacing[1] },
  statsRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4], paddingTop: spacing[3] },
  statCard: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: radii.md,
  },
  statValue: { fontSize: typography.sizes.heading, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textTertiary, marginTop: spacing[1] },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], padding: spacing[4] },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontWeight: '600', fontSize: typography.sizes.caption },
  filterTextActive: { color: colors.onPrimary },
  listContent: { paddingHorizontal: spacing[4], paddingBottom: spacing[5] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[3],
    position: 'relative',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  cardTitle: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text, paddingLeft: spacing[2] },
  priorityBadge: { borderRadius: radii.pill, paddingHorizontal: spacing[2], paddingVertical: 4 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: typography.sizes.body, color: colors.textSecondary, marginBottom: spacing[2], paddingLeft: spacing[2] },
  meta: { fontSize: typography.sizes.caption, color: colors.textTertiary, paddingLeft: spacing[2] },
});
