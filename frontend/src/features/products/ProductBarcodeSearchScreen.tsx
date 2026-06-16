import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '../../shared/components/AppButton';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { productsApi } from './api';
import { Product } from '../../shared/types';
import { colors } from '../../core/theme/tokens';
import { useNavigation } from '@react-navigation/native';

export function ProductBarcodeSearchScreen() {
  const navigation = useNavigation<any>();
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = barcode.trim();
    if (!trimmed) {
      setError('Inserisci un barcode per avviare la ricerca.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const product = await productsApi.findByBarcode(trimmed);
      setResult(product);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Nessun prodotto trovato per questo barcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ricerca barcode</Text>
      <Text style={styles.subtitle}>Inserisci o incolla il codice prodotto per accesso rapido.</Text>
      <TextInput
        value={barcode}
        onChangeText={setBarcode}
        placeholder="es. 8051490140200"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
      />
      <AppButton label="Cerca prodotto" onPress={handleSearch} loading={loading} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result ? (
        <SurfaceCard style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.name}</Text>
          <Text style={styles.resultLine}>Barcode: {result.barcode}</Text>
          <Text style={styles.resultLine}>Categoria: {result.category || 'N/D'}</Text>
          <Text style={styles.resultLine}>Unita: {result.base_unit}</Text>
          <AppButton
            label="Apri dettaglio"
            variant="secondary"
            onPress={() => navigation.navigate('ProductDetail', { productId: result.id })}
            style={{ marginTop: 8 }}
          />
        </SurfaceCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text, backgroundColor: colors.surface, marginBottom: 10 },
  error: { marginTop: 12, color: '#b91c1c', fontSize: 13 },
  resultCard: { marginTop: 14 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  resultLine: { color: colors.textSecondary, fontSize: 13, marginBottom: 3 },
});
