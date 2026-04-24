import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { SubmitButton } from '../../components/SubmitButton';
import { useApiSubmit } from '../../hooks/useApiSubmit';
import { productsApi } from '../../api/products';
import { CreateProductPayload } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductsStackParamList } from '../../navigation/ProductsNavigator';
import { colors } from '../../theme/tokens';

type NavProps = NativeStackNavigationProp<ProductsStackParamList, 'ProductCreate'>;
type Unit = CreateProductPayload['base_unit'];

const UNITS: Unit[] = ['kg', 'g', 'l', 'ml', 'pcs'];

export function ProductCreateScreen({ navigation }: { navigation: NavProps }) {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState<Unit>('pcs');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const submitOptions = useMemo(
    () => ({
      successMessage: 'Prodotto creato con successo',
      onSuccess: (result: any) => navigation.replace('ProductDetail', { productId: result.id }),
    }),
    [navigation]
  );

  const { submit, submitting, fieldErrors } = useApiSubmit<CreateProductPayload, any>(
    productsApi.create,
    submitOptions
  );

  const handleSubmit = () => {
    submit({
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      sku: sku.trim() || undefined,
      category: category.trim() || undefined,
      base_unit: unit,
      is_active: isActive,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuovo prodotto</Text>
      <Text style={styles.subtitle}>Compila i campi essenziali per la tracciabilita barcode-first.</Text>

      <FormField
        label="Nome prodotto *"
        value={name}
        onChangeText={setName}
        placeholder="es. Passata di pomodoro 5kg"
        error={fieldErrors.name?.[0]}
      />
      <FormField
        label="Barcode"
        value={barcode}
        onChangeText={setBarcode}
        placeholder="EAN/UPC"
        error={fieldErrors.barcode?.[0]}
      />
      <FormField
        label="SKU"
        value={sku}
        onChangeText={setSku}
        placeholder="Codice interno"
        error={fieldErrors.sku?.[0]}
      />
      <FormField
        label="Categoria"
        value={category}
        onChangeText={setCategory}
        placeholder="es. Conserva"
        error={fieldErrors.category?.[0]}
      />

      <Text style={styles.section}>Unita base *</Text>
      <View style={styles.unitRow}>
        {UNITS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.unitChip, unit === item && styles.unitChipActive]}
            onPress={() => setUnit(item)}
          >
            <Text style={[styles.unitChipText, unit === item && styles.unitChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {fieldErrors.base_unit?.[0] ? <Text style={styles.errorText}>{fieldErrors.base_unit[0]}</Text> : null}

      <Text style={styles.section}>Stato</Text>
      <View style={styles.stateRow}>
        <TouchableOpacity style={[styles.stateBtn, isActive && styles.stateBtnActive]} onPress={() => setIsActive(true)}>
          <Text style={[styles.stateText, isActive && styles.stateTextActive]}>Attivo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stateBtn, !isActive && styles.stateBtnActive]} onPress={() => setIsActive(false)}>
          <Text style={[styles.stateText, !isActive && styles.stateTextActive]}>Inattivo</Text>
        </TouchableOpacity>
      </View>

      <FormField label="Note" value={notes} onChangeText={setNotes} placeholder="Note operative" multiline error={fieldErrors.notes?.[0]} />

      <SubmitButton
        label="Salva prodotto"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!name.trim()}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
  },
  unitChipActive: { borderColor: colors.primary, backgroundColor: '#dbeafe' },
  unitChipText: { color: colors.textSecondary, fontWeight: '600' },
  unitChipTextActive: { color: colors.primary },
  stateRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stateBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stateBtnActive: { borderColor: colors.primary, backgroundColor: '#dbeafe' },
  stateText: { color: colors.textSecondary, fontWeight: '700' },
  stateTextActive: { color: colors.primary },
  errorText: { color: '#ef4444', marginBottom: 10, marginTop: -2, fontSize: 12 },
});
