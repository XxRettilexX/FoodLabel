import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { PreparationStackParamList } from '../../navigation/PreparationNavigator';
import { useApiData } from '../../hooks/useApiData';
import { traceabilityApi, ProductionGenealogyResponse } from '../../api/traceability';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { SurfaceCard } from '../../components/SurfaceCard';
import { colors } from '../../theme/tokens';

type RouteProps = RouteProp<PreparationStackParamList, 'IngredientOrigin'>;

export function IngredientOriginScreen({ route }: { route: RouteProps }) {
  const { productionId } = route.params;
  const fetcher = useCallback(() => traceabilityApi.getProductionGenealogy(productionId), [productionId]);
  const { data, loading, error, load, refresh } = useApiData<ProductionGenealogyResponse | null>(fetcher, null);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) return <LoadingScreen message="Carico genealogia..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!data) return <ErrorScreen message="Genealogia non disponibile" onRetry={refresh} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard>
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
          <Text style={styles.line}>
            Quantita usata: {ingredient.quantity_used} {ingredient.unit}
          </Text>
          <Text style={styles.line}>Scadenza lotto: {ingredient.lot?.expires_at || 'N/D'}</Text>
        </SurfaceCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10, paddingBottom: 30 },
  title: { fontSize: 21, fontWeight: '800', color: colors.text },
  meta: { marginTop: 4, color: colors.textSecondary, fontSize: 13 },
  card: { marginBottom: 8 },
  productName: { fontSize: 15, color: colors.text, fontWeight: '700', marginBottom: 6 },
  line: { fontSize: 12, color: colors.textSecondary, marginBottom: 3 },
});
