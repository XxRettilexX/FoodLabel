import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from './LotsNavigator';
import { lotsApi, movementsApi } from './api';
import { useApiData } from '../../shared/hooks/useApiData';
import { useApiSubmit } from '../../shared/hooks/useApiSubmit';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { FormField } from '../../shared/components/FormField';
import { AppButton } from '../../shared/components/AppButton';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { Lot, CreateMovementPayload, MovementType } from '../../shared/types';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { MovementIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

type RouteProps = RouteProp<LotsStackParamList, 'CreateMovement'>;
type NavProps = NativeStackNavigationProp<LotsStackParamList, 'CreateMovement'>;

const MOVEMENT_TYPES: { value: MovementType; label: string; Icon: any; desc: string, color: string }[] = [
  { value: 'IN', label: 'Carico', Icon: MovementIcons.IN, desc: 'Aggiunge quantità al lotto', color: colors.success },
  { value: 'OUT', label: 'Scarico', Icon: MovementIcons.OUT, desc: 'Rimuove quantità dal lotto', color: colors.danger },
  { value: 'ADJUST', label: 'Rettifica', Icon: MovementIcons.ADJUST, desc: 'Imposta la giacenza esatta', color: colors.warning },
];

export function CreateMovementScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const { lotId } = route.params;
  const [type, setType] = useState<MovementType>('OUT');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const lotFetcher = useCallback(() => lotsApi.getById(lotId), [lotId]);
  const { data: lot, loading: lotLoading, error: lotError, load: loadLot } = useApiData<Lot | null>(lotFetcher, null);

  useEffect(() => { loadLot(); }, [loadLot]);

  const submitOptions = useMemo(() => ({ successMessage: 'Movimento registrato con successo!', onSuccess: () => navigation.goBack() }), [navigation]);
  const { submit, submitting, fieldErrors } = useApiSubmit<CreateMovementPayload, any>(movementsApi.create, submitOptions);

  const handleSubmit = () => {
    // BUG 7 FIX: guard against NaN — Number("abc") is NaN, and NaN <= 0 is false,
    // so the disabled prop alone doesn't prevent submitting non-numeric input.
    const parsedQty = Number(quantity);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) return;
    submit({ lot_id: lotId, type, quantity: parsedQty, notes: notes.trim() || undefined });
  };

  if (lotLoading) return <LoadingScreen />;
  if (lotError) return <ErrorScreen message={lotError} onRetry={loadLot} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {lot && (
        <SurfaceCard style={styles.lotContext}>
          <View style={styles.lotContextHeader}>
            <Text style={styles.lotBatch}>{lot.batch_number}</Text>
            <StatusBadge status={lot.status} />
          </View>
          <Text style={styles.lotProduct}>{lot.product?.name || 'Prodotto sconosciuto'}</Text>
          <View style={styles.lotQtyRow}>
            <Text style={styles.lotQtyLabel}>Giacenza attuale:</Text>
            <Text style={styles.lotQtyValue}>{lot.current_quantity} {lot.unit}</Text>
          </View>
        </SurfaceCard>
      )}
      <Text style={styles.sectionLabel}>TIPO MOVIMENTO</Text>
      <View style={styles.typeRow}>
        {MOVEMENT_TYPES.map((mt) => {
          const Icon = mt.Icon;
          return (
            <TouchableOpacity key={mt.value} style={[styles.typeCard, type === mt.value && styles.typeCardSelected]} onPress={() => setType(mt.value)} activeOpacity={0.7}>
              <Icon size={ICON_SIZE.md} color={type === mt.value ? mt.color : colors.textTertiary} strokeWidth={ICON_STROKE} />
              <Text style={[styles.typeLabel, type === mt.value && { color: mt.color }]}>{mt.label}</Text>
              <Text style={styles.typeDesc}>{mt.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FormField label={type === 'ADJUST' ? 'Nuova giacenza *' : `Quantità da ${type === 'IN' ? 'caricare' : 'scaricare'} *`} value={quantity} onChangeText={setQuantity} placeholder={type === 'ADJUST' ? 'Nuova giacenza esatta' : '0'} keyboardType="numeric" error={fieldErrors.quantity?.[0]} />
      {lot && quantity && !isNaN(Number(quantity)) && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Risultato previsto</Text>
          <Text style={styles.previewValue}>
            {type === 'IN' ? `${lot.current_quantity} + ${quantity} = ${lot.current_quantity + Number(quantity)} ${lot.unit}` : type === 'OUT' ? `${lot.current_quantity} - ${quantity} = ${Math.max(0, lot.current_quantity - Number(quantity))} ${lot.unit}` : `${lot.current_quantity} → ${quantity} ${lot.unit}`}
          </Text>
        </View>
      )}
      <FormField label="Note" value={notes} onChangeText={setNotes} placeholder="Motivo del movimento..." multiline />
      {/* BUG 7 FIX: Added !Number.isFinite(Number(quantity)) to disabled check to prevent NaN submission */}
      <AppButton label="Registra Movimento" onPress={handleSubmit} loading={submitting} disabled={!quantity || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0} variant={type === 'OUT' ? 'danger' : type === 'IN' ? 'success' : 'primary'} style={{ marginTop: spacing[2] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  lotContext: { padding: spacing[4], marginBottom: spacing[5] },
  lotContextHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  lotBatch: { fontSize: typography.sizes.heading, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
  lotProduct: { fontSize: typography.sizes.body, color: colors.textSecondary, marginBottom: spacing[2] },
  lotQtyRow: { flexDirection: 'row', alignItems: 'center' },
  lotQtyLabel: { fontSize: typography.sizes.body, color: colors.textTertiary, marginRight: spacing[1] },
  lotQtyValue: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.primary, fontFamily: 'monospace' },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[5] },
  typeCard: { flex: 1, backgroundColor: colors.surface, padding: spacing[3], borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  typeCardSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  typeLabel: { fontSize: typography.sizes.body, fontWeight: '600', color: colors.textSecondary, marginTop: spacing[1], marginBottom: 2 },
  typeDesc: { fontSize: typography.sizes.caption, color: colors.textTertiary, textAlign: 'center', lineHeight: 13 },
  preview: { backgroundColor: '#F0FDF4', padding: spacing[3], borderRadius: radii.sm, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: spacing[4] },
  previewLabel: { fontSize: 11, color: colors.success, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing[1] },
  previewValue: { fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.success, fontFamily: 'monospace' },
});
