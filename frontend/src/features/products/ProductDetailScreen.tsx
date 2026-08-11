import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ProductsStackParamList } from './ProductsNavigator';
import { useApiData } from '../../shared/hooks/useApiData';
import { productsApi } from './api';
import { Product } from '../../shared/types';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

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
        <View style={styles.badgeRow}>
          <View style={[styles.statusPill, product.is_active ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, product.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
              {product.is_active ? 'ATTIVO' : 'INATTIVO'}
            </Text>
          </View>
        </View>
        <Text style={styles.line}><Text style={styles.lineLabel}>Barcode:</Text> {product.barcode || 'N/D'}</Text>
        <Text style={styles.line}><Text style={styles.lineLabel}>SKU:</Text> {product.sku || 'N/D'}</Text>
        <Text style={styles.line}><Text style={styles.lineLabel}>Categoria:</Text> {product.category || 'N/D'}</Text>
        <Text style={styles.line}><Text style={styles.lineLabel}>Unita base:</Text> {product.base_unit}</Text>
        {product.notes ? <Text style={styles.notes}>{product.notes}</Text> : null}
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing[5] },
  card: { gap: spacing[2], padding: spacing[5] },
  name: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text, marginBottom: spacing[1] },
  badgeRow: { flexDirection: 'row', marginBottom: spacing[3] },
  statusPill: { paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: radii.pill },
  statusActive: { backgroundColor: '#dcfce7' },
  statusInactive: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: colors.success },
  statusTextInactive: { color: colors.danger },
  line: { fontSize: typography.sizes.body, color: colors.textSecondary },
  lineLabel: { color: colors.textTertiary, fontWeight: '600' },
  notes: { marginTop: spacing[3], fontSize: typography.sizes.body, lineHeight: 20, color: colors.textSecondary, backgroundColor: colors.surfaceMuted, padding: spacing[3], borderRadius: radii.md },
});
