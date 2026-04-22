import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  color?: string;
}

export function LoadingScreen({ color = '#2563eb' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
