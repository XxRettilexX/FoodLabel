import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { PreparationStackParamList } from './PreparationNavigator';
import { useApiData } from '../../shared/hooks/useApiData';
import { traceabilityApi, ProductionGenealogyResponse } from './api';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

type RouteProps = RouteProp<PreparationStackParamList, 'IngredientOrigin'>;

export function IngredientOriginScreen({ route }: { route: RouteProps }) {
  const { productionId } = route.params;
  const fetcher = useCallback(() => traceabilityApi.getProductionGenealogy(productionId), [productionId]);
  const { data, loading, error, load, refresh } = useApiData<ProductionGenealogyResponse | null>(fetcher, null);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <LoadingScreen message="Carico genealogia..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!data) return <ErrorScreen message="Genealogia non disponibile" onRetry={refresh} />;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/D';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'N/D';
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard style={{ marginBottom: spacing[3] }}>
        <Text style={styles.title}>{data.production.name}</Text>
        <Text style={styles.meta}>Righe ingredienti: {data.meta.ingredient_lines_count}</Text>
        <Text style={styles.meta}>Lotti unici: {data.meta.unique_lots_count}</Text>
        <Text style={styles.meta}>Prodotti unici: {data.meta.unique_products_count}</Text>
      </SurfaceCard>

      {data.ingredients.map((ingredient) => (
        <SurfaceCard key={ingredient.production_input_id} style={styles.card}>
          <Text style={styles.productName}>{ingredient.product?.name || 'Prodotto non disponibile'}</Text>
          <Text style={styles.line}>Barcode: {ingredient.product?.barcode || 'N/D'}</Text>
          <Text style={styles.line}>Lotto: {ingredient.lot?.batch_number || 'N/D'}</Text>
          <Text style={styles.line}>Quantita usata: {ingredient.quantity_used} {ingredient.unit}</Text>
          <Text style={styles.line}>Scadenza lotto: {formatDate(ingredient.lot?.expires_at ?? null)}</Text>
        </SurfaceCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5], paddingBottom: spacing[8] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  meta: { marginTop: spacing[1], color: colors.textSecondary, fontSize: typography.sizes.body },
  card: { marginBottom: spacing[2], padding: spacing[4], gap: spacing[1] },
  productName: { fontSize: typography.sizes.bodyMedium, color: colors.text, fontWeight: '700', marginBottom: spacing[1] },
  line: { fontSize: typography.sizes.caption, color: colors.textSecondary },
});
