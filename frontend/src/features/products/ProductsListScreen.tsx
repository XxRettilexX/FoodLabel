import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { productsApi } from './api';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { EmptyState } from '../../shared/components/EmptyState';
import { Product } from '../../shared/types';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductsStackParamList } from './ProductsNavigator';

type NavProps = NativeStackNavigationProp<ProductsStackParamList, 'ProductsList'>;

export function ProductsListScreen({ navigation }: { navigation: NavProps }) {
  const [query, setQuery] = React.useState('');
  // Bug fix: keep API query separate from the input value so typing does not fire a request per keystroke.
  const [searchQuery, setSearchQuery] = React.useState('');
  const fetcher = useCallback(
    () => productsApi.getAll(searchQuery.trim() || undefined),
    [searchQuery],
  );
  const { data: products, loading, error, load, refresh } = useApiData<Product[]>(fetcher, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSearch = () => {
    setSearchQuery(query);
  };

  if (loading && products.length === 0) return <LoadingScreen />;
  if (error && products.length === 0) return <ErrorScreen message={error} onRetry={refresh} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogo prodotti</Text>
      <Text style={styles.subtitle}>Gestione rapida anagrafica, barcode e stato operativo</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cerca per nome, barcode, categoria..."
        placeholderTextColor={colors.textTertiary}
        style={styles.search}
        onSubmitEditing={runSearch}
        returnKeyType="search"
      />
      <View style={styles.actionsRow}>
        <AppButton
          label="Cerca barcode"
          variant="secondary"
          onPress={() => navigation.navigate('ProductBarcodeSearch')}
          style={{ flex: 1 }}
        />
        <AppButton
          label="Nuovo prodotto"
          onPress={() => navigation.navigate('ProductCreate')}
          style={{ flex: 1 }}
        />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} activeOpacity={0.75}>
            <SurfaceCard style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.statusPill, item.is_active ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, item.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
                    {item.is_active ? 'ATTIVO' : 'INATTIVO'}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {item.category || 'Categoria n/d'} • {item.base_unit}
              </Text>
              <Text style={styles.barcode}>{item.barcode || 'Barcode non assegnato'}</Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState message="Nessun prodotto nel catalogo." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  subtitle: { paddingHorizontal: spacing[5], fontSize: typography.sizes.label, color: colors.textSecondary, marginTop: spacing[1], marginBottom: spacing[3] },
  search: { marginHorizontal: spacing[5], borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing[4], paddingVertical: 14, color: colors.text, fontSize: typography.sizes.body, minHeight: 52 },
  actionsRow: { flexDirection: 'row', gap: spacing[2], marginHorizontal: spacing[5], marginTop: spacing[2], marginBottom: spacing[3] },
  listContent: { paddingHorizontal: spacing[5], paddingBottom: spacing[5] },
  card: { marginBottom: spacing[2] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  name: { fontSize: typography.sizes.heading, fontWeight: '800', color: colors.text, flex: 1 },
  statusPill: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radii.pill, marginLeft: spacing[2] },
  statusActive: { backgroundColor: '#dcfce7' },
  statusInactive: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextActive: { color: colors.success },
  statusTextInactive: { color: colors.danger },
  meta: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginBottom: spacing[1] },
  barcode: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: radii.sm, color: colors.text, fontSize: typography.sizes.body, fontWeight: '600', marginBottom: spacing[2], fontFamily: 'monospace' },
  description: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginBottom: spacing[2], lineHeight: 18 },
});
