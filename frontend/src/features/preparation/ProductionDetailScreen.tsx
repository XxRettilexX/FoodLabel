import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from './PreparationNavigator';
import { productionsApi } from './api';
import { Production } from '../../shared/types';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../core/theme/tokens';

type RouteProps = RouteProp<PreparationStackParamList, 'ProductionDetail'>;
type NavProps = NativeStackNavigationProp<PreparationStackParamList, 'ProductionDetail'>;

export function ProductionDetailScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const { productionId } = route.params;
  const fetcher = useCallback(() => productionsApi.getById(productionId), [productionId]);
  const { data: production, loading, error, load, refresh } = useApiData<Production | null>(fetcher, null);

  useEffect(() => { load(); }, [load]);

  if (loading && !production) return <LoadingScreen message="Carico dettaglio produzione..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!production) return <ErrorScreen message="Produzione non trovata" onRetry={refresh} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.name}>{production.name}</Text>
        <Text style={styles.meta}>{new Date(production.produced_at).toLocaleString('it-IT')}</Text>
        <Text style={styles.meta}>Ricetta: {production.recipe?.name || 'Nessuna ricetta collegata'}</Text>
        {production.output_quantity ? (
          <Text style={styles.meta}>Output: {production.output_quantity} {production.output_unit || ''}</Text>
        ) : null}
      </SurfaceCard>

      <AppButton label="Vista origine ingredienti" onPress={() => navigation.navigate('IngredientOrigin', { productionId: production.id })} style={{ marginTop: 12 }} />

      <Text style={styles.section}>Input registrati</Text>
      {production.inputs && production.inputs.length > 0 ? (
        production.inputs.map((input) => (
          <SurfaceCard key={input.id} style={styles.inputCard}>
            <Text style={styles.inputName}>{input.product?.name || `Prodotto #${input.product_id}`}</Text>
            <Text style={styles.inputMeta}>Lotto {input.lot?.batch_number || input.lot_id} • {input.quantity_used} {input.unit}</Text>
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard><Text style={styles.inputMeta}>Nessun input disponibile.</Text></SurfaceCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12, paddingBottom: 30 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  meta: { marginTop: 4, color: colors.textSecondary, fontSize: 13 },
  section: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  inputCard: { marginBottom: 8 },
  inputName: { fontSize: 15, fontWeight: '700', color: colors.text },
  inputMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
