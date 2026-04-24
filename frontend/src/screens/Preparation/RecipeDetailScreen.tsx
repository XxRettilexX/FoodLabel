import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from '../../navigation/PreparationNavigator';
import { recipesApi } from '../../api/recipes';
import { Recipe } from '../../types';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { SurfaceCard } from '../../components/SurfaceCard';
import { AppButton } from '../../components/AppButton';
import { colors } from '../../theme/tokens';

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
  content: { padding: 20, paddingBottom: 30, gap: 12 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  description: { fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  row: { flexDirection: 'row' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  itemCard: { marginBottom: 8 },
  itemName: { fontSize: 15, color: colors.text, fontWeight: '700' },
  itemMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  itemNotes: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
});
