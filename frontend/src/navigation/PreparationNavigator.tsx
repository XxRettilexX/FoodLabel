import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipeListScreen } from '../screens/Preparation/RecipeListScreen';
import { RecipeDetailScreen } from '../screens/Preparation/RecipeDetailScreen';
import { CreateRecipeScreen } from '../screens/Preparation/CreateRecipeScreen';
import { CreateProductionScreen } from '../screens/Preparation/CreateProductionScreen';
import { ProductionDetailScreen } from '../screens/Preparation/ProductionDetailScreen';
import { IngredientOriginScreen } from '../screens/Preparation/IngredientOriginScreen';

export type PreparationStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { recipeId: number };
  CreateRecipe: undefined;
  CreateProduction: { recipeId?: number } | undefined;
  ProductionDetail: { productionId: number };
  IngredientOrigin: { productionId: number };
};

const Stack = createNativeStackNavigator<PreparationStackParamList>();

export function PreparationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
      }}
    >
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ title: 'Ricette' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Dettaglio ricetta' }} />
      <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} options={{ title: 'Nuova ricetta' }} />
      <Stack.Screen name="CreateProduction" component={CreateProductionScreen} options={{ title: 'Nuova produzione' }} />
      <Stack.Screen name="ProductionDetail" component={ProductionDetailScreen} options={{ title: 'Dettaglio produzione' }} />
      <Stack.Screen name="IngredientOrigin" component={IngredientOriginScreen} options={{ title: 'Origine ingredienti' }} />
    </Stack.Navigator>
  );
}
