import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LotsListScreen } from '../screens/Lots/LotsListScreen';
import { LotDetailScreen } from '../screens/Lots/LotDetailScreen';
import { CreateLotScreen } from '../screens/Lots/CreateLotScreen';

export type LotsStackParamList = {
    LotsList: undefined;
    LotDetail: { lotId: number };
    CreateLot: undefined;
};

const Stack = createNativeStackNavigator<LotsStackParamList>();

export function LotsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="LotsList" component={LotsListScreen} options={{ title: 'Elenco Lotti' }} />
      <Stack.Screen name="LotDetail" component={LotDetailScreen} options={{ title: 'Dettagli Lotto' }} />
      <Stack.Screen name="CreateLot" component={CreateLotScreen} options={{ title: 'Nuovo Lotto' }} />
    </Stack.Navigator>
  );
}
