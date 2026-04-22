import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsApi } from '../../api/products';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';

export function ProductsListScreen() {
  const fetcher = useCallback(() => productsApi.getAll(), []);
  const { data: products, loading, error, load, refresh } = useApiData<Product[]>(fetcher, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Catalogo Prodotti</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={false}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              {item.default_shelf_life_days && (
                <View style={styles.shelfBadge}>
                  <Text style={styles.shelfText}>{item.default_shelf_life_days}gg</Text>
                </View>
              )}
            </View>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.cardFooter}>
              <Text style={styles.supplier}>
                {item.supplier?.name || 'Fornitore non assegnato'}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState message="Nessun prodotto nel catalogo." icon="📦" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
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
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  shelfBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  shelfText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d28d9',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplier: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
