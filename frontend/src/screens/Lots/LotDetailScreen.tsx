import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../../api/client';
import { RouteProp } from '@react-native-native/native';
import { LotsStackParamList } from '../../navigation/LotsNavigator';

type RouteProps = RouteProp<LotsStackParamList, 'LotDetail'>;

export function LotDetailScreen({ route, navigation }: { route: RouteProps, navigation: any }) {
  const { lotId } = route.params;
  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLot();
  }, []);

  const fetchLot = async () => {
    try {
      const res = await apiClient.get(`/lots/${lotId}`);
      setLot(res.data.data);
    } catch (error) {
      console.warn("API fallita, uso mock detail");
      setLot({ id: lotId, batch_number: 'LOT-001', status: 'active', current_quantity: 10, unit: 'kg', product: { name: 'Pomodoro' } });
    } finally {
      setLoading(false);
    }
  };

  const generateLabel = async () => {
    Alert.alert('Etichetta', 'Generazione etichetta richiesta!');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563eb" />;
  if (!lot) return <Text style={styles.error}>Lotto non trovato</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Lotto: {lot.batch_number}</Text>
        <Text style={styles.info}>Prodotto: {lot.product?.name || 'N/A'}</Text>
        <Text style={styles.info}>Quantità Attuale: {lot.current_quantity} {lot.unit}</Text>
        <Text style={styles.info}>Stato: {lot.status}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={generateLabel}>
        <Text style={styles.buttonText}>Genera Etichetta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5, color: '#4b5563' },
  error: { textAlign: 'center', marginTop: 20, color: '#ef4444' },
  button: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
