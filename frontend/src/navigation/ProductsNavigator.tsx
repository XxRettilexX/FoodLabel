import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsListScreen } from '../screens/Products/ProductsListScreen';
import { ProductCreateScreen } from '../screens/Products/ProductCreateScreen';
import { ProductDetailScreen } from '../screens/Products/ProductDetailScreen';
import { ProductBarcodeSearchScreen } from '../screens/Products/ProductBarcodeSearchScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductCreate: undefined;
  ProductDetail: { productId: number };
  ProductBarcodeSearch: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#2563eb',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsListScreen} options={{ title: 'Prodotti' }} />
      <Stack.Screen name="ProductCreate" component={ProductCreateScreen} options={{ title: 'Nuovo prodotto' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Dettaglio prodotto' }} />
      <Stack.Screen name="ProductBarcodeSearch" component={ProductBarcodeSearchScreen} options={{ title: 'Cerca barcode' }} />
    </Stack.Navigator>
  );
}
