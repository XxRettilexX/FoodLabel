import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from './PreparationNavigator';
import { recipesApi } from './api';
import { Recipe } from '../../shared/types';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

type RouteProps = RouteProp<PreparationStackParamList, 'RecipeDetail'>;
type NavProps = NativeStackNavigationProp<PreparationStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const { recipeId } = route.params;
  const fetcher = useCallback(() => recipesApi.getById(recipeId), [recipeId]);
  const { data: recipe, loading, error, load, refresh } = useApiData<Recipe | null>(fetcher, null);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !recipe) return <LoadingScreen message="Carico dettaglio ricetta..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!recipe) return <ErrorScreen message="Ricetta non trovata." onRetry={refresh} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard>
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.meta}>{recipe.code || 'Senza codice'} • {recipe.is_active ? 'Attiva' : 'Inattiva'}</Text>
        {recipe.description ? <Text style={styles.description}>{recipe.description}</Text> : null}
        {recipe.yield_quantity ? (
          <Text style={styles.meta}>
            Resa: {recipe.yield_quantity} {recipe.yield_unit || ''}
          </Text>
        ) : null}
      </SurfaceCard>

      <View style={styles.row}>
        <AppButton
          label="Nuova produzione"
          onPress={() => navigation.navigate('CreateProduction', { recipeId: recipe.id })}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={styles.sectionTitle}>Ingredienti teorici</Text>
      {recipe.items && recipe.items.length > 0 ? (
        recipe.items.map((item) => (
          <SurfaceCard key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.product?.name || `Prodotto #${item.product_id}`}</Text>
            <Text style={styles.itemMeta}>
              {item.quantity} {item.unit}
            </Text>
            {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard>
          <Text style={styles.itemMeta}>Nessun ingrediente configurato.</Text>
        </SurfaceCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5], paddingBottom: spacing[8], gap: spacing[3] },
  name: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  meta: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing[1] },
  description: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing[2], lineHeight: 20 },
  row: { flexDirection: 'row' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing[1] },
  itemCard: { marginBottom: spacing[2], padding: spacing[4] },
  itemName: { fontSize: typography.sizes.bodyMedium, color: colors.text, fontWeight: '700' },
  itemMeta: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing[1] },
  itemNotes: { fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: spacing[1] },
});
