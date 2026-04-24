import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from '../../navigation/PreparationNavigator';
import { recipesApi } from '../../api/recipes';
import { productionsApi } from '../../api/productions';
import { Recipe, Production } from '../../types';
import { useApiData } from '../../hooks/useApiData';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { EmptyState } from '../../components/EmptyState';
import { SurfaceCard } from '../../components/SurfaceCard';
import { AppButton } from '../../components/AppButton';
import { colors } from '../../theme/tokens';

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
          onPress={() => navigation.navigate('CreateProduction')}
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
        ListEmptyComponent={<EmptyState message="Nessuna ricetta disponibile." icon="📘" />}
        ListFooterComponent={
          <>
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Produzioni recenti</Text>
            {productions.length === 0 ? (
              <EmptyState message="Nessuna produzione registrata." icon="🍲" />
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
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: colors.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardMeta: { marginTop: 4, fontSize: 12, color: colors.textTertiary },
});
