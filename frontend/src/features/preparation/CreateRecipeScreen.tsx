import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { productsApi } from '../products/api';
import { recipesApi } from './api';
import { Product, CreateRecipePayload, MeasureUnit } from '../../shared/types';
import { useApiData } from '../../shared/hooks/useApiData';
import { useApiSubmit } from '../../shared/hooks/useApiSubmit';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { FormField } from '../../shared/components/FormField';
import { AppButton } from '../../shared/components/AppButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from './PreparationNavigator';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';

type NavProps = NativeStackNavigationProp<PreparationStackParamList, 'CreateRecipe'>;

type DraftItem = {
  product_id: number;
  quantity: string;
  unit: MeasureUnit;
  notes: string;
};

const UNITS: MeasureUnit[] = ['kg', 'g', 'l', 'ml', 'pcs'];

export function CreateRecipeScreen({ navigation }: { navigation: NavProps }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [yieldQuantity, setYieldQuantity] = useState('');
  const [yieldUnit, setYieldUnit] = useState<MeasureUnit>('pcs');
  const [items, setItems] = useState<DraftItem[]>([]);

  const productsFetcher = useCallback(() => productsApi.getAll(), []);
  const { data: products, loading, error, load, refresh } = useApiData<Product[]>(productsFetcher, []);

  useEffect(() => { load(); }, [load]);

  const submitOptions = useMemo(
    () => ({
      successMessage: 'Ricetta creata',
      onSuccess: (result: any) => navigation.replace('RecipeDetail', { recipeId: result.id }),
    }),
    [navigation]
  );

  const { submit, submitting, fieldErrors } = useApiSubmit<CreateRecipePayload, any>(recipesApi.create, submitOptions);

  const addIngredient = () => {
    if (!products[0]) return;
    setItems((prev) => [...prev, { product_id: products[0].id, quantity: '1', unit: products[0].base_unit || 'pcs', notes: '' }]);
  };

  const updateItem = (index: number, next: Partial<DraftItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    submit({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      yield_quantity: yieldQuantity ? Number(yieldQuantity) : undefined,
      yield_unit: yieldQuantity ? yieldUnit : undefined,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit: item.unit,
        notes: item.notes.trim() || undefined,
      })),
    });
  };

  if (loading) return <LoadingScreen message="Carico prodotti..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuova ricetta</Text>
      <Text style={styles.subtitle}>Definizione teorica ingredienti, pronta per la produzione reale.</Text>

      <FormField label="Nome ricetta *" value={name} onChangeText={setName} placeholder="es. Lasagna base" error={fieldErrors.name?.[0]} />
      <FormField label="Codice" value={code} onChangeText={setCode} placeholder="es. RC-LAS-001" error={fieldErrors.code?.[0]} />
      <FormField label="Descrizione" value={description} onChangeText={setDescription} placeholder="Note preparazione" multiline />
      <FormField label="Quantita resa" value={yieldQuantity} onChangeText={setYieldQuantity} placeholder="es. 10" keyboardType="numeric" />

      <Text style={styles.section}>Unita resa</Text>
      <View style={styles.unitRow}>
        {UNITS.map((unit) => (
          <TouchableOpacity key={unit} onPress={() => setYieldUnit(unit)} style={[styles.unitChip, yieldUnit === unit && styles.unitChipActive]}>
            <Text style={[styles.unitChipText, yieldUnit === unit && styles.unitChipTextActive]}>{unit}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ingredientsHeader}>
        <Text style={styles.section}>Ingredienti teorici</Text>
        <TouchableOpacity onPress={addIngredient}><Text style={styles.addText}>+ Aggiungi</Text></TouchableOpacity>
      </View>

      {items.map((item, index) => (
        <View key={`item-${index}`} style={styles.itemBlock}>
          <Text style={styles.itemLabel}>Ingrediente #{index + 1}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2], marginBottom: spacing[3] }}>
            {products.map((p) => (
              <TouchableOpacity key={`${index}-${p.id}`} onPress={() => updateItem(index, { product_id: p.id, unit: p.base_unit || 'pcs' })} style={[styles.productChip, item.product_id === p.id && styles.productChipActive]}>
                <Text style={[styles.productChipText, item.product_id === p.id && styles.productChipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FormField label="Quantita" value={item.quantity} onChangeText={(v) => updateItem(index, { quantity: v })} keyboardType="numeric" /></View>
            <View style={{ width: 92, marginLeft: spacing[2] }}><FormField label="Unita" value={item.unit} onChangeText={(v) => updateItem(index, { unit: v as MeasureUnit })} /></View>
          </View>
          <FormField label="Note" value={item.notes} onChangeText={(v) => updateItem(index, { notes: v })} />
          <TouchableOpacity onPress={() => removeItem(index)}><Text style={styles.removeText}>Rimuovi ingrediente</Text></TouchableOpacity>
        </View>
      ))}

      <AppButton label="Salva ricetta" onPress={handleSave} loading={submitting} disabled={!name.trim()} style={{ marginTop: spacing[2] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5], paddingBottom: spacing[8] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.bodyMedium, color: colors.textSecondary, marginTop: spacing[1], marginBottom: spacing[4] },
  section: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing[2] },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  unitChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  unitChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  unitChipText: { color: colors.textSecondary, fontWeight: '600', fontSize: typography.sizes.body },
  unitChipTextActive: { color: colors.primary },
  ingredientsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  addText: { color: colors.primary, fontWeight: '700', fontSize: typography.sizes.body },
  itemBlock: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, padding: spacing[3], marginBottom: spacing[3] },
  itemLabel: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text, marginBottom: spacing[2] },
  productChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceMuted },
  productChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  productChipText: { fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: '600' },
  productChipTextActive: { color: colors.primary },
  row: { flexDirection: 'row' },
  removeText: { color: colors.danger, fontWeight: '600', marginTop: spacing[1], fontSize: typography.sizes.body },
});
