import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from './LotsNavigator';
import { lotsApi } from './api';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { EmptyState } from '../../shared/components/EmptyState';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Lot } from '../../shared/types';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, radii, spacing, typography } from '../../core/theme/tokens';
import { ActionIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

type NavigationProp = NativeStackNavigationProp<LotsStackParamList, 'LotsList'>;

export function LotsListScreen({ navigation }: { navigation: NavigationProp }) {
  const fetcher = useCallback(() => lotsApi.getAll(), []);
  const { data: lots, loading, error, load, refresh } = useApiData<Lot[]>(fetcher, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, load]);

  if (loading && lots.length === 0) return <LoadingScreen />;
  if (error && lots.length === 0) return <ErrorScreen message={error} onRetry={refresh} />;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/D';
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <TouchableOpacity style={styles.cardWrap} onPress={() => navigation.navigate('LotDetail', { lotId: item.id })} activeOpacity={0.7}>
            <SurfaceCard>
              <View style={styles.cardHeader}>
                <Text style={styles.batch}>{item.batch_number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.product}>{item.product?.name || 'Prodotto sconosciuto'}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Giacenza</Text>
                  <Text style={styles.infoValue}>{item.current_quantity} {item.unit}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Scadenza</Text>
                  <Text style={styles.infoValue}>{formatDate(item.expires_at)}</Text>
                </View>
              </View>
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Nessun lotto registrato." />}
      />

      <SurfaceCard style={styles.bottomActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionSecondary]} onPress={() => navigation.navigate('ScanLotLabel')} activeOpacity={0.85}>
          <ActionIcons.Scan size={ICON_SIZE.inline} color={colors.text} strokeWidth={ICON_STROKE} />
          <Text style={[styles.actionText, styles.actionTextSecondary]}>Scansiona</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateLot')} activeOpacity={0.85}>
          <ActionIcons.Add size={ICON_SIZE.inline} color={colors.onPrimary} strokeWidth={ICON_STROKE} />
          <Text style={styles.actionText}>Nuovo lotto</Text>
        </TouchableOpacity>
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[2] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.label, color: colors.textSecondary, marginTop: spacing[1] },
  listContent: { paddingHorizontal: spacing[5], paddingBottom: 110, paddingTop: spacing[1] },
  cardWrap: { marginBottom: spacing[3] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  batch: { fontSize: typography.sizes.heading, fontWeight: '800', color: colors.text },
  product: { fontSize: typography.sizes.body, color: colors.textSecondary, marginBottom: spacing[3] },
  cardFooter: { flexDirection: 'row', gap: spacing[6] },
  infoBlock: {},
  infoLabel: { fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: typography.sizes.label, fontWeight: '700', color: colors.textSecondary, marginTop: 2 },
  bottomActions: { position: 'absolute', left: spacing[5], right: spacing[5], bottom: 14, flexDirection: 'row', gap: spacing[2], padding: spacing[2] },
  actionBtn: { flex: 1, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', minHeight: 56, flexDirection: 'row', gap: spacing[2] },
  actionSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.onPrimary, fontWeight: '700', fontSize: typography.sizes.bodyMedium },
  actionTextSecondary: { color: colors.text },
});
