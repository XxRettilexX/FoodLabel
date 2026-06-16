import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipeListScreen } from './RecipeListScreen';
import { RecipeDetailScreen } from './RecipeDetailScreen';
import { CreateRecipeScreen } from './CreateRecipeScreen';
import { ProductionDetailScreen } from './ProductionDetailScreen';
import { CreateProductionScreen } from './CreateProductionScreen';
import { IngredientOriginScreen } from './IngredientOriginScreen';

export type PreparationStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { recipeId: number };
  CreateRecipe: undefined;
  ProductionDetail: { productionId: number };
  CreateProduction: { recipeId?: number };
  IngredientOrigin: { productionId: number };
};

const Stack = createNativeStackNavigator<PreparationStackParamList>();

export function PreparationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '600', color: '#1f2937' },
      }}
    >
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ title: 'Ricette e Produzioni' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Dettaglio Ricetta' }} />
      <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} options={{ title: 'Nuova Ricetta' }} />
      <Stack.Screen name="ProductionDetail" component={ProductionDetailScreen} options={{ title: 'Dettaglio Produzione' }} />
      <Stack.Screen name="CreateProduction" component={CreateProductionScreen} options={{ title: 'Registra Produzione' }} />
      <Stack.Screen name="IngredientOrigin" component={IngredientOriginScreen} options={{ title: 'Origine Ingredienti' }} />
    </Stack.Navigator>
  );
}
