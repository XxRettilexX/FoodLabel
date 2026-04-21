import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import apiClient from '../../api/client';
import { NativeStackNavigationProp } from '@react-native-stack/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';

type NavigationProp = NativeStackNavigationProp<LotsStackParamList, 'LotsList'>;

export function LotsListScreen({ navigation }: { navigation: NavigationProp }) {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await apiClient.get('/lots');
      setLots(res.data.data.data || res.data.data);
    } catch (error) {
       console.warn("API fallita, uso mock");
       setLots([{ id: 1, batch_number: 'LOT-001', status: 'active', current_quantity: 10, unit: 'kg' }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563eb" />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateLot')}>
        <Text style={styles.fabText}>+ Nuovo Lotto</Text>
      </TouchableOpacity>
      
      <FlatList
        data={lots}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('LotDetail', { lotId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.batch}>{item.batch_number}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.qty}>Qtà: {item.current_quantity} {item.unit}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessun lotto trovato.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  batch: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  status: { fontSize: 12, color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  qty: { fontSize: 14, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 20, color: '#6b7280' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2563eb', padding: 15, borderRadius: 30, zIndex: 10, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold' }
});
