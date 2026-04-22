import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { ProductsListScreen } from '../screens/Products/ProductsListScreen';
import { LotsNavigator } from './LotsNavigator';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { AlertsScreen } from '../screens/Alerts/AlertsScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            headerShown: false,
        }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Prodotti" component={ProductsListScreen} />
      <Tab.Screen name="Lotti" component={LotsNavigator} />
      <Tab.Screen name="Alert" component={AlertsScreen} />
      <Tab.Screen name="Profilo" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
