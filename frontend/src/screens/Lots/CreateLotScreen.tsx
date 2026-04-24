import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';
import { lotsApi } from '../../api/lots';
import { productsApi } from '../../api/products';
import { useApiData } from '../../hooks/useApiData';
import { useApiSubmit } from '../../hooks/useApiSubmit';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { FormField } from '../../components/FormField';
import { SubmitButton } from '../../components/SubmitButton';
import { Product, CreateLotPayload, LotUnit } from '../../types';

type NavProps = NativeStackNavigationProp<LotsStackParamList, 'CreateLot'>;

const UNITS: { value: LotUnit; label: string }[] = [
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'Litri' },
  { value: 'pz', label: 'Pezzi' },
];

export function CreateLotScreen({ navigation }: { navigation: NavProps }) {
  // ── Form state ───────────────────────────
  const [productId, setProductId] = useState<number | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<LotUnit>('kg');
  const [expiresAt, setExpiresAt] = useState('');
  const [producedAt, setProducedAt] = useState('');
  const [notes, setNotes] = useState('');

  // ── Carica prodotti per il selettore ─────
  const productsFetcher = useCallback(() => productsApi.getAll(), []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    load: loadProducts,
  } = useApiData<Product[]>(productsFetcher, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Submit ───────────────────────────────
  const submitOptions = useMemo(
    () => ({
      successMessage: 'Lotto creato con successo!',
      onSuccess: () => navigation.goBack(),
    }),
    [navigation],
  );

  const { submit, submitting, fieldErrors } = useApiSubmit<CreateLotPayload, any>(
    lotsApi.create,
    submitOptions,
  );

  const handleSubmit = () => {
    if (!productId) {
      return;
    }

    const parsedQty = Number(quantity);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      return;
    }

    const payload: CreateLotPayload = {
      product_id: productId,
      batch_number: batchNumber.trim(),
      initial_quantity: parsedQty,
      unit,
      expires_at: expiresAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      produced_at: producedAt || null,
      notes: notes.trim() || undefined,
    };

    submit(payload);
  };

  if (productsLoading) return <LoadingScreen />;
  if (productsError)
    return <ErrorScreen message="Impossibile caricare i prodotti" onRetry={loadProducts} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Selettore Prodotto ─────────────────── */}
      <Text style={styles.sectionLabel}>PRODOTTO *</Text>
      {products.length === 0 ? (
        <Text style={styles.noProducts}>
          Nessun prodotto disponibile. Crea prima un prodotto.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productScroller}
          contentContainerStyle={styles.productScrollerContent}
        >
          {products.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.productChip,
                productId === p.id && styles.productChipSelected,
              ]}
              onPress={() => setProductId(p.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.productChipText,
                  productId === p.id && styles.productChipTextSelected,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {!productId && fieldErrors.product_id && (
        <Text style={styles.fieldError}>{fieldErrors.product_id[0]}</Text>
      )}

      {/* ── Campi form ─────────────────────────── */}
      <FormField
        label="Codice Lotto *"
        value={batchNumber}
        onChangeText={setBatchNumber}
        placeholder="es. LOT-2026-042"
        error={fieldErrors.batch_number?.[0]}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField
            label="Quantità *"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="numeric"
            error={fieldErrors.initial_quantity?.[0]}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.unitLabel}>UNITÀ *</Text>
          <View style={styles.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[
                  styles.unitChip,
                  unit === u.value && styles.unitChipSelected,
                ]}
                onPress={() => setUnit(u.value)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    unit === u.value && styles.unitChipTextSelected,
                  ]}
                >
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FormField
        label="Data Scadenza * (YYYY-MM-DD)"
        value={expiresAt}
        onChangeText={setExpiresAt}
        placeholder="2026-05-22"
        error={fieldErrors.expires_at?.[0]}
      />

      <FormField
        label="Data Produzione (YYYY-MM-DD)"
        value={producedAt}
        onChangeText={setProducedAt}
        placeholder="2026-04-22"
        error={fieldErrors.produced_at?.[0]}
      />

      <FormField
        label="Note"
        value={notes}
        onChangeText={setNotes}
        placeholder="Eventuali annotazioni..."
        multiline
      />

      {/* ── Submit ─────────────────────────────── */}
      <SubmitButton
        label="Crea Lotto"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!productId || !batchNumber.trim() || !quantity || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noProducts: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 16,
  },
  productScroller: {
    marginBottom: 20,
  },
  productScrollerContent: {
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  productChipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  productChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  productChipTextSelected: {
    color: '#fff',
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  unitChipSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  unitChipTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
