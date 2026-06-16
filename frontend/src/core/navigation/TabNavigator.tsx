import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../features/dashboard/DashboardScreen';
import { LotsNavigator } from '../../features/lots/LotsNavigator';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { AlertsScreen } from '../../features/alerts/AlertsScreen';
import { ProductsNavigator } from '../../features/products/ProductsNavigator';
import { PreparationNavigator } from '../../features/preparation/PreparationNavigator';
import { colors } from '../theme/tokens';
import { TabIcons, ICON_STROKE, ICON_SIZE } from '../theme/icons';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarIcon: ({ color }) => {
          const Icon = TabIcons[route.name as keyof typeof TabIcons];
          if (!Icon) return null;
          return <Icon size={ICON_SIZE.navbar} strokeWidth={ICON_STROKE} color={color} />;
        },
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Prodotti" component={ProductsNavigator} />
      <Tab.Screen name="Lotti" component={LotsNavigator} />
      <Tab.Screen name="Ricette" component={PreparationNavigator} />
      <Tab.Screen name="Alert" component={AlertsScreen} />
      <Tab.Screen name="Profilo" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
});
