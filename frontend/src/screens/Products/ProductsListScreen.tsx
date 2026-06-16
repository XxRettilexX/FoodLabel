import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { productsApi } from '../../api/products';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';
import { SurfaceCard } from '../../components/SurfaceCard';
import { AppButton } from '../../components/AppButton';
import { colors } from '../../theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductsStackParamList } from '../../navigation/ProductsNavigator';

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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    paddingHorizontal: 20,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  search: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#991b1b',
  },
  meta: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  barcode: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
});
