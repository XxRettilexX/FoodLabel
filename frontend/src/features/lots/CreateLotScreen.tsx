import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from './LotsNavigator';
import { lotsApi } from './api';
import { productsApi } from '../products/api';
import { useApiData } from '../../shared/hooks/useApiData';
import { useApiSubmit } from '../../shared/hooks/useApiSubmit';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { FormField } from '../../shared/components/FormField';
import { AppButton } from '../../shared/components/AppButton';
import { Product, CreateLotPayload, LotUnit } from '../../shared/types';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

type NavProps = NativeStackNavigationProp<LotsStackParamList, 'CreateLot'>;

const UNITS: { value: LotUnit; label: string }[] = [
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'Litri' },
  { value: 'pz', label: 'Pezzi' },
];

export function CreateLotScreen({ navigation }: { navigation: NavProps }) {
  const [productId, setProductId] = useState<number | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<LotUnit>('kg');
  const [expiresAt, setExpiresAt] = useState('');
  const [producedAt, setProducedAt] = useState('');
  const [notes, setNotes] = useState('');

  const productsFetcher = useCallback(() => productsApi.getAll(), []);
  const { data: products, loading: productsLoading, error: productsError, load: loadProducts } = useApiData<Product[]>(productsFetcher, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const submitOptions = useMemo(() => ({ successMessage: 'Lotto creato con successo!', onSuccess: () => navigation.goBack() }), [navigation]);
  const { submit, submitting, fieldErrors } = useApiSubmit<CreateLotPayload, any>(lotsApi.create, submitOptions);

  const handleSubmit = () => {
    if (!productId) return;
    const parsedQty = Number(quantity);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) return;
    submit({
      product_id: productId,
      batch_number: batchNumber.trim(),
      initial_quantity: parsedQty,
      unit,
      expires_at: expiresAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      produced_at: producedAt || null,
      notes: notes.trim() || undefined,
    });
  };

  if (productsLoading) return <LoadingScreen />;
  if (productsError) return <ErrorScreen message="Impossibile caricare i prodotti" onRetry={loadProducts} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>PRODOTTO *</Text>
      {products.length === 0 ? (
        <Text style={styles.noProducts}>Nessun prodotto disponibile. Crea prima un prodotto.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroller} contentContainerStyle={styles.productScrollerContent}>
          {products.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.productChip, productId === p.id && styles.productChipSelected]} onPress={() => setProductId(p.id)} activeOpacity={0.7}>
              <Text style={[styles.productChipText, productId === p.id && styles.productChipTextSelected]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {!productId && fieldErrors.product_id && <Text style={styles.fieldError}>{fieldErrors.product_id[0]}</Text>}

      <FormField label="Codice Lotto *" value={batchNumber} onChangeText={setBatchNumber} placeholder="es. LOT-2026-042" error={fieldErrors.batch_number?.[0]} />
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing[2] }}>
          <FormField label="Quantità *" value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" error={fieldErrors.initial_quantity?.[0]} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing[2] }}>
          <Text style={styles.unitLabel}>UNITÀ *</Text>
          <View style={styles.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity key={u.value} style={[styles.unitChip, unit === u.value && styles.unitChipSelected]} onPress={() => setUnit(u.value)}>
                <Text style={[styles.unitChipText, unit === u.value && styles.unitChipTextSelected]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <FormField label="Data Scadenza * (YYYY-MM-DD)" value={expiresAt} onChangeText={setExpiresAt} placeholder="2026-05-22" error={fieldErrors.expires_at?.[0]} />
      <FormField label="Data Produzione (YYYY-MM-DD)" value={producedAt} onChangeText={setProducedAt} placeholder="2026-04-22" error={fieldErrors.produced_at?.[0]} />
      <FormField label="Note" value={notes} onChangeText={setNotes} placeholder="Eventuali annotazioni..." multiline />
      <AppButton label="Crea Lotto" onPress={handleSubmit} loading={submitting} disabled={!productId || !batchNumber.trim() || !quantity || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0} style={{ marginTop: spacing[2] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },
  noProducts: { fontSize: typography.sizes.caption, color: colors.danger, marginBottom: spacing[4] },
  productScroller: { marginBottom: spacing[5] },
  productScrollerContent: { gap: spacing[2] },
  productChip: { paddingHorizontal: spacing[4], paddingVertical: 12, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  productChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  productChipText: { fontSize: typography.sizes.body, fontWeight: '500', color: colors.text },
  productChipTextSelected: { color: colors.onPrimary },
  fieldError: { fontSize: typography.sizes.caption, color: colors.danger, marginTop: -12, marginBottom: 12 },
  row: { flexDirection: 'row' },
  unitLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  unitChipSelected: { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
  unitChipText: { fontSize: typography.sizes.body, fontWeight: '500', color: colors.textSecondary },
  unitChipTextSelected: { color: colors.primary, fontWeight: '600' },
});
