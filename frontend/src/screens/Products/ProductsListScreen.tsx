import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ProductsListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data.data.data || res.data.data);
    } catch (error) {
      console.warn("API fallita, uso dati mock");
      setProducts([{ id: 1, name: 'Pomodori Pelati', category: 'Vegetali' }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563eb" />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Catalogo Prodotti</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category || 'Nessuna Categoria'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessun prodotto trovato.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  category: { fontSize: 14, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 20, color: '#6b7280' }
});
