import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../../navigation/LotsNavigator';
import { lotsApi } from '../../api/lots';
import { movementsApi } from '../../api/movements';
import { useApiData } from '../../hooks/useApiData';
import { useApiSubmit } from '../../hooks/useApiSubmit';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { FormField } from '../../components/FormField';
import { SubmitButton } from '../../components/SubmitButton';
import { StatusBadge } from '../../components/StatusBadge';
import { Lot, CreateMovementPayload, MovementType } from '../../types';

type RouteProps = RouteProp<LotsStackParamList, 'CreateMovement'>;
type NavProps = NativeStackNavigationProp<LotsStackParamList, 'CreateMovement'>;

const MOVEMENT_TYPES: { value: MovementType; label: string; icon: string; desc: string }[] = [
  { value: 'IN', label: 'Carico', icon: '📥', desc: 'Aggiunge quantità al lotto' },
  { value: 'OUT', label: 'Scarico', icon: '📤', desc: 'Rimuove quantità dal lotto' },
  { value: 'ADJUST', label: 'Rettifica', icon: '🔄', desc: 'Imposta la giacenza esatta' },
];

export function CreateMovementScreen({
  route,
  navigation,
}: {
  route: RouteProps;
  navigation: NavProps;
}) {
  const { lotId } = route.params;

  // ── Form state ──────────────────────────
  const [type, setType] = useState<MovementType>('OUT');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // ── Carica lotto per mostrare contesto ──
  const lotFetcher = useCallback(() => lotsApi.getById(lotId), [lotId]);
  const {
    data: lot,
    loading: lotLoading,
    error: lotError,
    load: loadLot,
  } = useApiData<Lot | null>(lotFetcher, null);

  useEffect(() => {
    loadLot();
  }, [loadLot]);

  // ── Submit ──────────────────────────────
  const submitOptions = useMemo(
    () => ({
      successMessage: 'Movimento registrato con successo!',
      onSuccess: () => navigation.goBack(),
    }),
    [navigation],
  );

  const { submit, submitting, fieldErrors } = useApiSubmit<CreateMovementPayload, any>(
    movementsApi.create,
    submitOptions,
  );

  const handleSubmit = () => {
    const payload: CreateMovementPayload = {
      lot_id: lotId,
      type,
      quantity: Number(quantity),
      notes: notes.trim() || undefined,
    };
    submit(payload);
  };

  if (lotLoading) return <LoadingScreen />;
  if (lotError) return <ErrorScreen message={lotError} onRetry={loadLot} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Contesto Lotto ─────────────────────── */}
      {lot && (
        <View style={styles.lotContext}>
          <View style={styles.lotContextHeader}>
            <Text style={styles.lotBatch}>{lot.batch_number}</Text>
            <StatusBadge status={lot.status} />
          </View>
          <Text style={styles.lotProduct}>
            {lot.product?.name || 'Prodotto sconosciuto'}
          </Text>
          <View style={styles.lotQtyRow}>
            <Text style={styles.lotQtyLabel}>Giacenza attuale:</Text>
            <Text style={styles.lotQtyValue}>
              {lot.current_quantity} {lot.unit}
            </Text>
          </View>
        </View>
      )}

      {/* ── Tipo Movimento ─────────────────────── */}
      <Text style={styles.sectionLabel}>TIPO MOVIMENTO</Text>
      <View style={styles.typeRow}>
        {MOVEMENT_TYPES.map((mt) => (
          <TouchableOpacity
            key={mt.value}
            style={[
              styles.typeCard,
              type === mt.value && styles.typeCardSelected,
            ]}
            onPress={() => setType(mt.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.typeIcon}>{mt.icon}</Text>
            <Text
              style={[
                styles.typeLabel,
                type === mt.value && styles.typeLabelSelected,
              ]}
            >
              {mt.label}
            </Text>
            <Text style={styles.typeDesc}>{mt.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Quantità ───────────────────────────── */}
      <FormField
        label={
          type === 'ADJUST'
            ? 'Nuova giacenza *'
            : `Quantità da ${type === 'IN' ? 'caricare' : 'scaricare'} *`
        }
        value={quantity}
        onChangeText={setQuantity}
        placeholder={type === 'ADJUST' ? 'Nuova giacenza esatta' : '0'}
        keyboardType="numeric"
        error={fieldErrors.quantity?.[0]}
      />

      {/* ── Anteprima risultato ────────────────── */}
      {lot && quantity && !isNaN(Number(quantity)) && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Risultato previsto</Text>
          <Text style={styles.previewValue}>
            {type === 'IN'
              ? `${lot.current_quantity} + ${quantity} = ${lot.current_quantity + Number(quantity)} ${lot.unit}`
              : type === 'OUT'
              ? `${lot.current_quantity} - ${quantity} = ${Math.max(0, lot.current_quantity - Number(quantity))} ${lot.unit}`
              : `${lot.current_quantity} → ${quantity} ${lot.unit}`}
          </Text>
        </View>
      )}

      {/* ── Note ───────────────────────────────── */}
      <FormField
        label="Note"
        value={notes}
        onChangeText={setNotes}
        placeholder="Motivo del movimento..."
        multiline
      />

      {/* ── Submit ─────────────────────────────── */}
      <SubmitButton
        label="Registra Movimento"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!quantity || Number(quantity) <= 0}
        variant={type === 'OUT' ? 'danger' : type === 'IN' ? 'success' : 'primary'}
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

  // Lot context
  lotContext: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  lotContextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lotBatch: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  lotProduct: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  lotQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lotQtyLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginRight: 6,
  },
  lotQtyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },

  // Type selector
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  typeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: '#2563eb',
  },
  typeDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Preview
  preview: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 11,
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
  },
});
