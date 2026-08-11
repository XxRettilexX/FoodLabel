import React, { useMemo, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormField } from '../../shared/components/FormField';
import { AppButton } from '../../shared/components/AppButton';
import { useApiSubmit } from '../../shared/hooks/useApiSubmit';
import { productsApi } from './api';
import { CreateProductPayload } from '../../shared/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductsStackParamList } from './ProductsNavigator';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { ActionIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LoadingScreen } from '../../shared/components/LoadingScreen';

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

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(false);

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

  const handleScanPress = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    scannerRef.current = false;
    setIsScanning(true);
  };

  if (isScanning) {
    if (!permission) return <LoadingScreen message="Verifica permessi..." />;
    if (!permission.granted) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[5] }]}>
          <Text style={{ textAlign: 'center', marginBottom: spacing[5], color: colors.text }}>Permesso fotocamera necessario per scansionare.</Text>
          <AppButton label="Richiedi Permesso" onPress={requestPermission} />
          <TouchableOpacity style={{ marginTop: spacing[5] }} onPress={() => setIsScanning(false)}>
            <Text style={{ color: colors.primary }}>Torna indietro</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (scannerRef.current) return;
            scannerRef.current = true;
            setBarcode(data);
            setIsScanning(false);
          }}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerText}>Inquadra il codice a barre</Text>
        </View>
        <TouchableOpacity style={styles.scannerCancelBtn} onPress={() => setIsScanning(false)}>
          <Text style={styles.scannerCancelText}>Annulla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuovo prodotto</Text>
      <Text style={styles.subtitle}>Compila i campi essenziali per la tracciabilita barcode-first.</Text>

      <FormField label="Nome prodotto *" value={name} onChangeText={setName} placeholder="es. Passata di pomodoro 5kg" error={fieldErrors.name?.[0]} />
      
      <View style={{ marginBottom: spacing[4] }}>
        <FormField label="Barcode" value={barcode} onChangeText={setBarcode} placeholder="EAN/UPC" error={fieldErrors.barcode?.[0]} />
        <TouchableOpacity style={styles.scanBtn} onPress={handleScanPress}>
          <ActionIcons.Camera size={ICON_SIZE.inline} color={colors.primary} strokeWidth={ICON_STROKE} />
          <Text style={styles.scanBtnText}>Scansiona con fotocamera</Text>
        </TouchableOpacity>
      </View>

      <FormField label="SKU" value={sku} onChangeText={setSku} placeholder="Codice interno" error={fieldErrors.sku?.[0]} />
      <FormField label="Categoria" value={category} onChangeText={setCategory} placeholder="es. Conserva" error={fieldErrors.category?.[0]} />

      <Text style={styles.section}>Unita base *</Text>
      <View style={styles.unitRow}>
        {UNITS.map((item) => (
          <TouchableOpacity key={item} style={[styles.unitChip, unit === item && styles.unitChipActive]} onPress={() => setUnit(item)}>
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

      <AppButton label="Salva prodotto" onPress={handleSubmit} loading={submitting} disabled={!name.trim()} style={{ marginTop: spacing[2] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5], paddingBottom: spacing[10] },
  title: { fontSize: typography.sizes.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.sizes.bodyMedium, color: colors.textSecondary, marginTop: spacing[1], marginBottom: spacing[4] },
  section: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing[2] },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] },
  unitChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md },
  unitChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  unitChipText: { color: colors.textSecondary, fontWeight: '600', fontSize: typography.sizes.body },
  unitChipTextActive: { color: colors.primary },
  stateRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  stateBtn: { flex: 1, minHeight: 52, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stateBtnActive: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  stateText: { color: colors.textSecondary, fontWeight: '700', fontSize: typography.sizes.body },
  stateTextActive: { color: colors.primary },
  errorText: { color: colors.danger, marginBottom: spacing[2], marginTop: -2, fontSize: typography.sizes.caption },
  scanBtn: { alignSelf: 'flex-start', paddingVertical: spacing[2], paddingHorizontal: spacing[3], backgroundColor: colors.surfaceMuted, borderRadius: radii.sm, marginTop: -spacing[2], flexDirection: 'row', gap: spacing[1], alignItems: 'center' },
  scanBtnText: { color: colors.primary, fontWeight: '600', fontSize: typography.sizes.bodyMedium },
  scannerOverlay: { position: 'absolute', top: 100, left: 0, right: 0, alignItems: 'center' },
  scannerText: { color: colors.onPrimary, fontSize: typography.sizes.bodyMedium, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radii.pill, overflow: 'hidden' },
  scannerCancelBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radii.full },
  scannerCancelText: { color: colors.text, fontWeight: 'bold', fontSize: typography.sizes.bodyMedium },
});
