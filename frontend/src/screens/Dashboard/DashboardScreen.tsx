import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.welcome}>Ciao, {user?.name || 'Utente'}!</Text>
        <Text style={styles.subtitle}>Benvenuto in FoodLabel HACCP</Text>
        
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Lotti')}>
            <Text style={styles.cardTitle}>Gestione Lotti</Text>
            <Text style={styles.cardSubtitle}>Crea o scansiona lotti</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Prodotti')}>
            <Text style={styles.cardTitle}>Prodotti</Text>
            <Text style={styles.cardSubtitle}>Catalogo materie prime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.cardTitle, { color: '#b91c1c' }]}>Allarmi</Text>
            <Text style={styles.cardSubtitle}>Nessun allarme critico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Movimenti</Text>
            <Text style={styles.cardSubtitle}>Storico inventario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  cardSubtitle: { fontSize: 12, color: '#6b7280' }
});
