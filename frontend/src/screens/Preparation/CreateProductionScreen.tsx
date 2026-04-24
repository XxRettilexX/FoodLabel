import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PreparationStackParamList } from '../../navigation/PreparationNavigator';
import { lotsApi } from '../../api/lots';
import { recipesApi } from '../../api/recipes';
import { productionsApi } from '../../api/productions';
import { CreateProductionPayload, Lot, MeasureUnit, Recipe } from '../../types';
import { useApiData } from '../../hooks/useApiData';
import { useApiSubmit } from '../../hooks/useApiSubmit';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { FormField } from '../../components/FormField';
import { SubmitButton } from '../../components/SubmitButton';
import { colors } from '../../theme/tokens';

type RouteProps = RouteProp<PreparationStackParamList, 'CreateProduction'>;
type NavProps = NativeStackNavigationProp<PreparationStackParamList, 'CreateProduction'>;

type DraftInput = {
  lot_id: number;
  product_id: number;
  quantity_used: string;
  unit: MeasureUnit;
  notes: string;
};

export function CreateProductionScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const defaultRecipeId = route.params?.recipeId ?? null;
  const [name, setName] = useState('');
  const [recipeId, setRecipeId] = useState<number | null>(defaultRecipeId);
  const [producedAt, setProducedAt] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [outputQuantity, setOutputQuantity] = useState('');
  const [outputUnit, setOutputUnit] = useState<MeasureUnit>('pcs');
  const [notes, setNotes] = useState('');
  const [inputs, setInputs] = useState<DraftInput[]>([]);

  const lotsFetcher = useCallback(() => lotsApi.getAll(), []);
  const recipesFetcher = useCallback(() => recipesApi.getAll(), []);
  const { data: lots, loading: lotsLoading, error: lotsError, load: loadLots, refresh: refreshLots } = useApiData<Lot[]>(lotsFetcher, []);
  const { data: recipes, loading: recipesLoading, load: loadRecipes } = useApiData<Recipe[]>(recipesFetcher, []);

  useEffect(() => {
    loadLots();
    loadRecipes();
  }, [loadLots, loadRecipes]);

  const submitOptions = useMemo(
    () => ({
      successMessage: 'Produzione registrata',
      onSuccess: (result: any) => navigation.replace('ProductionDetail', { productionId: result.id }),
    }),
    [navigation]
  );
  const { submit, submitting, fieldErrors } = useApiSubmit<CreateProductionPayload, any>(
    productionsApi.create,
    submitOptions
  );

  const addLotInput = (lot: Lot) => {
    setInputs((prev) => {
      if (prev.some((p) => p.lot_id === lot.id)) return prev;
      return [
        ...prev,
        {
          lot_id: lot.id,
          product_id: lot.product_id,
          quantity_used: '',
          unit: (lot.unit as MeasureUnit) || 'pcs',
          notes: '',
        },
      ];
    });
  };

  const updateInput = (lotId: number, next: Partial<DraftInput>) => {
    setInputs((prev) => prev.map((item) => (item.lot_id === lotId ? { ...item, ...next } : item)));
  };

  const removeInput = (lotId: number) => {
    setInputs((prev) => prev.filter((item) => item.lot_id !== lotId));
  };

  const hasInvalidInputs = useMemo(() => {
    if (inputs.length === 0) return true;
    return inputs.some((i) => {
      const n = Number(i.quantity_used);
      return !Number.isFinite(n) || n <= 0;
    });
  }, [inputs]);

  const handleSave = () => {
    submit({
      recipe_id: recipeId || undefined,
      name: name.trim(),
      produced_at: producedAt,
      output_quantity: outputQuantity ? Number(outputQuantity) : undefined,
      output_unit: outputQuantity ? outputUnit : undefined,
      notes: notes.trim() || undefined,
      inputs: inputs.map((item) => ({
        lot_id: item.lot_id,
        product_id: item.product_id,
        quantity_used: Number(item.quantity_used),
        unit: item.unit,
        notes: item.notes.trim() || undefined,
      })),
    });
  };

  if (lotsLoading || recipesLoading) return <LoadingScreen message="Carico lotti e ricette..." />;
  if (lotsError) return <ErrorScreen message={lotsError} onRetry={refreshLots} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuova produzione</Text>
      <Text style={styles.subtitle}>Registra lotti reali usati e quantita per genealogia completa.</Text>

      <FormField label="Nome produzione *" value={name} onChangeText={setName} placeholder="es. Sugo del giorno" error={fieldErrors.name?.[0]} />
      <FormField label="Prodotta il * (YYYY-MM-DD HH:mm)" value={producedAt} onChangeText={setProducedAt} error={fieldErrors.produced_at?.[0]} />

      <Text style={styles.section}>Ricetta (opzionale)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
        <TouchableOpacity onPress={() => setRecipeId(null)} style={[styles.recipeChip, recipeId === null && styles.recipeChipActive]}>
          <Text style={[styles.recipeText, recipeId === null && styles.recipeTextActive]}>Nessuna</Text>
        </TouchableOpacity>
        {recipes.map((r) => (
          <TouchableOpacity key={r.id} onPress={() => setRecipeId(r.id)} style={[styles.recipeChip, recipeId === r.id && styles.recipeChipActive]}>
            <Text style={[styles.recipeText, recipeId === r.id && styles.recipeTextActive]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FormField label="Output quantita" value={outputQuantity} onChangeText={setOutputQuantity} keyboardType="numeric" />
        </View>
        <View style={{ width: 96, marginLeft: 8 }}>
          <FormField label="Unita" value={outputUnit} onChangeText={(v) => setOutputUnit(v as MeasureUnit)} />
        </View>
      </View>
      <FormField label="Note" value={notes} onChangeText={setNotes} multiline />

      <Text style={styles.section}>Selezione lotti input *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
        {lots.map((lot) => (
          <TouchableOpacity key={lot.id} onPress={() => addLotInput(lot)} style={styles.lotChip}>
            <Text style={styles.lotChipText}>{lot.batch_number}</Text>
            <Text style={styles.lotChipSub}>{lot.product?.name || 'Prodotto'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {inputs.map((input) => {
        const lot = lots.find((l) => l.id === input.lot_id);
        return (
          <View key={`in-${input.lot_id}`} style={styles.inputCard}>
            <Text style={styles.inputTitle}>{lot?.batch_number || `Lotto #${input.lot_id}`}</Text>
            <Text style={styles.inputMeta}>{lot?.product?.name || 'Prodotto'} • giacenza {lot?.current_quantity ?? '-'} {lot?.unit}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Quantita usata"
                  value={input.quantity_used}
                  onChangeText={(v) => updateInput(input.lot_id, { quantity_used: v })}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 96, marginLeft: 8 }}>
                <FormField label="Unita" value={input.unit} onChangeText={(v) => updateInput(input.lot_id, { unit: v as MeasureUnit })} />
              </View>
            </View>
            <FormField label="Note input" value={input.notes} onChangeText={(v) => updateInput(input.lot_id, { notes: v })} />
            <TouchableOpacity onPress={() => removeInput(input.lot_id)}>
              <Text style={styles.remove}>Rimuovi lotto</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {fieldErrors.inputs?.[0] ? <Text style={styles.error}>{fieldErrors.inputs[0]}</Text> : null}

      <SubmitButton
        label="Registra produzione"
        onPress={handleSave}
        loading={submitting}
        disabled={!name.trim() || hasInvalidInputs}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 14 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: 'row' },
  recipeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  recipeChipActive: { borderColor: colors.primary, backgroundColor: '#dbeafe' },
  recipeText: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  recipeTextActive: { color: colors.primary },
  lotChip: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minWidth: 130 },
  lotChipText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  lotChipSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  inputCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12 },
  inputTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  inputMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2, marginBottom: 8 },
  remove: { color: '#b91c1c', fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8, fontSize: 12 },
});
