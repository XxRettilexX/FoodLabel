import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../lots/LotsNavigator';
import { invoicesApi } from './api';
import { productsApi } from '../products/api';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { AppButton } from '../../shared/components/AppButton';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { FormField } from '../../shared/components/FormField';
import { PrintLabelButton } from '../printer/PrintLabelButton';
import { ConfirmInvoiceResult, DeliveryInvoice, InvoiceLineItem, Lot, LotUnit, Product } from '../../shared/types';
import { colors, spacing, typography, radii, statusColors } from '../../core/theme/tokens';

type RouteProps = RouteProp<LotsStackParamList, 'InvoiceReview'>;
type NavProps = NativeStackNavigationProp<LotsStackParamList, 'InvoiceReview'>;

const UNITS: LotUnit[] = ['kg', 'g', 'l', 'pz'];

function confidenceTier(score: number | string): { label: string; colors: typeof statusColors.ok } {
  const value = Number(score) || 0;
  if (value >= 0.85) return { label: `ALTA · ${Math.round(value * 100)}%`, colors: statusColors.ok };
  if (value >= 0.6) return { label: `MEDIA · ${Math.round(value * 100)}%`, colors: statusColors.warning };
  return { label: `BASSA · ${Math.round(value * 100)}%`, colors: statusColors.expired };
}

export function InvoiceReviewScreen({ route, navigation }: { route: RouteProps; navigation: NavProps }) {
  const { invoiceId } = route.params;

  const invoiceFetcher = useCallback(() => invoicesApi.getById(invoiceId), [invoiceId]);
  const { data: invoice, loading, error, load, refresh } = useApiData<DeliveryInvoice | null>(invoiceFetcher, null);

  const productsFetcher = useCallback(() => productsApi.getAll(), []);
  const { data: products, load: loadProducts } = useApiData<Product[]>(productsFetcher, []);

  useEffect(() => { load(); loadProducts(); }, [load, loadProducts]);

  const [confirming, setConfirming] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmInvoiceResult | null>(null);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const result = await invoicesApi.confirm(invoiceId);
      setConfirmResult(result);
    } catch (err: any) {
      Alert.alert('Impossibile confermare', err?.response?.data?.message || 'Verifica che tutte le righe abbiano un prodotto collegato.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading && !invoice) return <LoadingScreen message="Caricamento fattura..." />;
  if (error) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!invoice) return <ErrorScreen message="Fattura non trovata" />;

  if (invoice.status === 'pending') {
    return <LoadingScreen message="L'AI sta ancora analizzando la fattura..." />;
  }

  if (invoice.status === 'failed') {
    return (
      <ErrorScreen
        message={invoice.failure_reason || 'Estrazione fallita. Riprova con una foto piu\' nitida o un\'altra fattura.'}
        onRetry={() => navigation.replace('InvoiceScan')}
      />
    );
  }

  if (confirmResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SurfaceCard style={styles.successCard}>
          <Text style={styles.successTitle}>Fattura confermata</Text>
          <Text style={styles.successSubtitle}>
            {confirmResult.lots.length} {confirmResult.lots.length === 1 ? 'lotto creato' : 'lotti creati'}. Stampa subito le etichette.
          </Text>
        </SurfaceCard>
        {confirmResult.lots.map((lot: Lot) => (
          <SurfaceCard key={lot.id} style={styles.lotCard}>
            <Text style={styles.lotBatch}>{lot.batch_number}</Text>
            <Text style={styles.lotProduct}>{lot.product?.name || 'Prodotto'}</Text>
            <PrintLabelButton lotId={lot.id} style={{ marginTop: spacing[3] }} />
          </SurfaceCard>
        ))}
        <AppButton label="Torna ai lotti" variant="secondary" onPress={() => navigation.navigate('LotsList')} style={{ marginTop: spacing[4] }} />
      </ScrollView>
    );
  }

  const lineItems = invoice.lineItems || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SurfaceCard style={styles.headerCard}>
        <Text style={styles.headerSupplier}>{invoice.supplier?.name || 'Fornitore'}</Text>
        <Text style={styles.headerMeta}>
          {invoice.invoice_number ? `Fattura ${invoice.invoice_number}` : 'Numero non rilevato'}
          {invoice.invoice_date ? ` · ${invoice.invoice_date}` : ''}
        </Text>
      </SurfaceCard>

      <Text style={styles.sectionLabel}>{lineItems.length} RIGHE ESTRATTE — CONTROLLA PRIMA DI CONFERMARE</Text>

      {lineItems.map((line) => (
        <LineItemCard
          key={line.id}
          line={line}
          products={products}
          onSaved={refresh}
        />
      ))}

      <AppButton
        label={confirming ? 'Creazione lotti...' : 'Conferma e crea lotti'}
        onPress={handleConfirm}
        loading={confirming}
        disabled={lineItems.length === 0}
        style={{ marginTop: spacing[6] }}
      />
    </ScrollView>
  );
}

function LineItemCard({
  line,
  products,
  onSaved,
}: {
  line: InvoiceLineItem;
  products: Product[];
  onSaved: () => void;
}) {
  const [productId, setProductId] = useState<number | null>(line.product_id);
  const [quantity, setQuantity] = useState(String(line.quantity));
  const [unit, setUnit] = useState<LotUnit>(line.unit);
  const [batchNumber, setBatchNumber] = useState(line.batch_number || '');
  const [expiresAt, setExpiresAt] = useState(line.expires_at || '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const rejected = line.status === 'rejected';

  const tier = confidenceTier(line.confidence_score);
  const matchedProduct = products.find((p) => p.id === productId);

  const markDirty = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  const save = async (overrides?: Partial<{ product_id: number | null; status: 'pending' | 'confirmed' | 'rejected' }>) => {
    setSaving(true);
    try {
      await invoicesApi.updateLineItem(line.delivery_invoice_id, line.id, {
        product_id: overrides?.product_id !== undefined ? overrides.product_id : productId,
        quantity: Number(quantity) || 0,
        unit,
        batch_number: batchNumber.trim() || null,
        expires_at: expiresAt.trim() || null,
        status: overrides?.status ?? line.status,
      });
      setDirty(false);
      onSaved();
    } catch (err: any) {
      Alert.alert('Errore', err?.response?.data?.message || 'Impossibile salvare la riga.');
    } finally {
      setSaving(false);
    }
  };

  const toggleReject = () => save({ status: rejected ? 'pending' : 'rejected' });

  return (
    <SurfaceCard style={[styles.lineCard, rejected && styles.lineCardRejected]}>
      <View style={styles.lineHeader}>
        <Text style={styles.lineRawName} numberOfLines={1}>{line.raw_product_name}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: tier.colors.bg, borderColor: tier.colors.border }]}>
          <Text style={[styles.confidenceText, { color: tier.colors.text }]}>{tier.label}</Text>
        </View>
      </View>

      {matchedProduct ? (
        <Text style={styles.matchedProduct}>Collegato a: {matchedProduct.name}</Text>
      ) : (
        <View>
          <Text style={styles.noMatch}>Nessun prodotto collegato — selezionane uno:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productChipRow}>
            {products.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.productChip}
                onPress={() => { setProductId(p.id); save({ product_id: p.id }); }}
                activeOpacity={0.7}
              >
                <Text style={styles.productChipText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!rejected && (
        <>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing[2] }}>
              <FormField label="Quantita'" value={quantity} onChangeText={markDirty(setQuantity)} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1, marginLeft: spacing[2] }}>
              <Text style={styles.unitLabel}>UNITA'</Text>
              <View style={styles.unitRow}>
                {UNITS.map((u) => (
                  <TouchableOpacity key={u} style={[styles.unitChip, unit === u && styles.unitChipSelected]} onPress={() => markDirty(setUnit)(u)}>
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextSelected]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <FormField label="Numero Lotto" value={batchNumber} onChangeText={markDirty(setBatchNumber)} placeholder="generato automaticamente se vuoto" />
          <FormField label="Data Scadenza (YYYY-MM-DD)" value={expiresAt} onChangeText={markDirty(setExpiresAt)} placeholder="opzionale" />
        </>
      )}

      <View style={styles.lineActions}>
        {!rejected && (
          <AppButton
            label={saving ? 'Salvataggio...' : 'Salva modifiche'}
            variant="secondary"
            onPress={() => save()}
            loading={saving}
            disabled={!dirty}
            style={{ flex: 1, marginRight: spacing[2] }}
          />
        )}
        <AppButton
          label={rejected ? 'Ripristina riga' : 'Scarta riga'}
          variant={rejected ? 'success' : 'danger'}
          onPress={toggleReject}
          loading={saving}
          style={{ flex: 1 }}
        />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  headerCard: { marginBottom: spacing[4] },
  headerSupplier: { fontSize: typography.sizes.heading, fontWeight: '800', color: colors.text },
  headerMeta: { fontSize: typography.sizes.caption, color: colors.textSecondary, marginTop: spacing[1] },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing[3], textTransform: 'uppercase', letterSpacing: 0.5 },
  lineCard: { marginBottom: spacing[3] },
  lineCardRejected: { opacity: 0.55 },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2], marginBottom: spacing[2] },
  lineRawName: { flex: 1, fontSize: typography.sizes.bodyMedium, fontWeight: '700', color: colors.text },
  confidenceBadge: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radii.pill, borderWidth: 1 },
  confidenceText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  matchedProduct: { fontSize: typography.sizes.caption, color: colors.success, fontWeight: '600', marginBottom: spacing[3] },
  noMatch: { fontSize: typography.sizes.caption, color: colors.danger, fontWeight: '600', marginBottom: spacing[2] },
  productChipRow: { gap: spacing[2], marginBottom: spacing[3] },
  productChip: { paddingHorizontal: spacing[3], paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  productChipText: { fontSize: typography.sizes.caption, color: colors.text, fontWeight: '500' },
  row: { flexDirection: 'row' },
  unitLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border },
  unitChipSelected: { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
  unitChipText: { fontSize: typography.sizes.caption, fontWeight: '500', color: colors.textSecondary },
  unitChipTextSelected: { color: colors.primary, fontWeight: '600' },
  lineActions: { flexDirection: 'row', marginTop: spacing[2] },
  successCard: { alignItems: 'center', marginBottom: spacing[4], paddingVertical: spacing[6] },
  successTitle: { fontSize: typography.sizes.title, fontWeight: '800', color: colors.success, marginBottom: spacing[2] },
  successSubtitle: { fontSize: typography.sizes.body, color: colors.textSecondary, textAlign: 'center' },
  lotCard: { marginBottom: spacing[3] },
  lotBatch: { fontSize: typography.sizes.heading, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
  lotProduct: { fontSize: typography.sizes.body, color: colors.textSecondary, marginTop: spacing[1] },
});
