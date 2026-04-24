import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ProductsStackParamList } from '../../navigation/ProductsNavigator';
import { useApiData } from '../../hooks/useApiData';
import { productsApi } from '../../api/products';
import { Product } from '../../types';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors } from '../../theme/tokens';

type RouteProps = RouteProp<ProductsStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route }: { route: RouteProps }) {
  const { productId } = route.params;
  const fetcher = useCallback(() => productsApi.getById(productId), [productId]);
  const { data: product, loading, error, load, refresh } = useApiData<Product | null>(fetcher, null);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !product) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!product) return <ErrorScreen message="Prodotto non trovato" onRetry={refresh} />;

  return (
    <View style={styles.container}>
      <SurfaceCard style={styles.card}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.line}>Barcode: {product.barcode || 'N/D'}</Text>
        <Text style={styles.line}>SKU: {product.sku || 'N/D'}</Text>
        <Text style={styles.line}>Categoria: {product.category || 'N/D'}</Text>
        <Text style={styles.line}>Unita base: {product.base_unit}</Text>
        <Text style={styles.line}>Stato: {product.is_active ? 'Attivo' : 'Inattivo'}</Text>
        {product.notes ? <Text style={styles.notes}>{product.notes}</Text> : null}
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  card: { gap: 8 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  line: { fontSize: 14, color: colors.textSecondary },
  notes: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: 10,
  },
});
