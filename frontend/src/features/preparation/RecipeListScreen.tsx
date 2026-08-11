import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from './PreparationNavigator';
import { recipesApi, productionsApi } from './api';
import { Recipe, Production } from '../../shared/types';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { EmptyState } from '../../shared/components/EmptyState';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

type NavProps = NativeStackNavigationProp<PreparationStackParamList, 'RecipeList'>;

export function RecipeListScreen({ navigation }: { navigation: NavProps }) {
  const recipesFetcher = useCallback(() => recipesApi.getAll(), []);
  const prodFetcher = useCallback(() => productionsApi.getAll(), []);

  const { data: recipes, loading, error, load, refresh } = useApiData<Recipe[]>(recipesFetcher, []);
  const { data: productions, load: loadProductions } = useApiData<Production[]>(prodFetcher, []);

  useEffect(() => {
    load();
    loadProductions();
  }, [load, loadProductions]);

  if (loading && recipes.length === 0) return <LoadingScreen message="Carico ricette..." />;
  if (error && recipes.length === 0) return <ErrorScreen message={error} onRetry={refresh} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ricette e produzioni</Text>
      <Text style={styles.subtitle}>La genealogia parte da qui: definisci e registra.</Text>

      <View style={styles.actionsRow}>
        <AppButton label="Nuova ricetta" onPress={() => navigation.navigate('CreateRecipe')} style={{ flex: 1 }} />
        <AppButton
          label="Nuova produzione"
          variant="secondary"
          onPress={() => navigation.navigate('CreateProduction', {})}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={styles.sectionTitle}>Ricette</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => `r-${item.id}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })} activeOpacity={0.8}>
            <SurfaceCard style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.code || 'Senza codice'} • {item.items_count ?? item.items?.length ?? 0} ingredienti
              </Text>
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Nessuna ricetta disponibile." />}
        ListFooterComponent={
          <>
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Produzioni recenti</Text>
            {productions.length === 0 ? (
              <EmptyState message="Nessuna produzione registrata." />
            ) : (
              productions.slice(0, 6).map((prod) => (
                <TouchableOpacity
                  key={`p-${prod.id}`}
                  onPress={() => navigation.navigate('ProductionDetail', { productionId: prod.id })}
                  activeOpacity={0.8}
                >
                  <SurfaceCard style={styles.card}>
                    <Text style={styles.cardTitle}>{prod.name}</Text>
                    <Text style={styles.cardMeta}>
                      {new Date(prod.produced_at).toLocaleString('it-IT')} • {prod.inputs_count ?? prod.inputs?.length ?? 0} input
                    </Text>
                  </SurfaceCard>
                </TouchableOpacity>
              ))
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing[4] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text, paddingHorizontal: spacing[5] },
  subtitle: { fontSize: typography.sizes.label, color: colors.textSecondary, paddingHorizontal: spacing[5], marginTop: spacing[1], marginBottom: spacing[3] },
  actionsRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: spacing[5], marginBottom: spacing[2] },
  listContent: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[2], padding: spacing[4], gap: spacing[1] },
  cardTitle: { fontSize: typography.sizes.heading, fontWeight: '800', color: colors.text },
  cardMeta: { fontSize: typography.sizes.caption, color: colors.textTertiary },
});
