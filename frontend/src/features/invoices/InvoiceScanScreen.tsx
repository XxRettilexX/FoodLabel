import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LotsStackParamList } from '../lots/LotsNavigator';
import { invoicesApi, suppliersApi, ScannedFile } from './api';
import { useApiData } from '../../shared/hooks/useApiData';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { ErrorScreen } from '../../shared/components/ErrorScreen';
import { AppButton } from '../../shared/components/AppButton';
import { SurfaceCard } from '../../shared/components/SurfaceCard';
import { Supplier } from '../../shared/types';
import { colors, spacing, typography, radii } from '../../core/theme/tokens';
import { ActionIcons, DomainIcons, ICON_SIZE, ICON_STROKE } from '../../core/theme/icons';

type NavProps = NativeStackNavigationProp<LotsStackParamList, 'InvoiceScan'>;

export function InvoiceScanScreen({ navigation }: { navigation: NavProps }) {
  const suppliersFetcher = useCallback(() => suppliersApi.getAll(), []);
  const { data: suppliers, loading: suppliersLoading, error: suppliersError, load: loadSuppliers } =
    useApiData<Supplier[]>(suppliersFetcher, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [file, setFile] = useState<ScannedFile | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const openCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Permesso fotocamera necessario',
          'Concedi il permesso fotocamera per scattare la foto della fattura.',
          [{ text: 'Apri impostazioni', onPress: () => Linking.openSettings() }, { text: 'Annulla' }],
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setFile({ uri: photo.uri, name: `fattura-${Date.now()}.jpg`, type: 'image/jpeg' });
      }
    } catch (err: any) {
      Alert.alert('Errore fotocamera', err?.message || 'Impossibile scattare la foto.');
    } finally {
      setShowCamera(false);
    }
  };

  const importPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name || `fattura-${Date.now()}.pdf`,
        type: asset.mimeType || 'application/pdf',
      });
    } catch (err: any) {
      Alert.alert('Errore', err?.message || 'Impossibile importare il file.');
    }
  };

  const handleUpload = async () => {
    if (!supplierId || !file) return;
    setUploading(true);
    try {
      const invoice = await invoicesApi.scan(supplierId, file);
      navigation.replace('InvoiceReview', { invoiceId: invoice.id });
    } catch (err: any) {
      Alert.alert('Errore scansione', err?.response?.data?.message || 'Impossibile scansionare la fattura. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraHint}>Inquadra l'intera fattura, ben illuminata</Text>
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.cameraCancel} onPress={() => setShowCamera(false)}>
              <ActionIcons.Close size={ICON_SIZE.header} color="#fff" strokeWidth={ICON_STROKE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto} activeOpacity={0.8} />
          </View>
        </View>
      </View>
    );
  }

  if (suppliersLoading) return <LoadingScreen message="Caricamento fornitori..." />;
  if (suppliersError) return <ErrorScreen message={suppliersError} onRetry={loadSuppliers} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>FORNITORE *</Text>
      {suppliers.length === 0 ? (
        <Text style={styles.noSuppliers}>Nessun fornitore disponibile. Crea prima un fornitore.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {suppliers.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, supplierId === s.id && styles.chipSelected]}
              onPress={() => setSupplierId(s.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, supplierId === s.id && styles.chipTextSelected]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionLabel}>DOCUMENTO FATTURA *</Text>
      {file ? (
        <SurfaceCard style={styles.previewCard}>
          {file.type.startsWith('image/') ? (
            <Image source={{ uri: file.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.pdfPreview}>
              <DomainIcons.Invoice size={ICON_SIZE.emptyState} color={colors.textTertiary} strokeWidth={ICON_STROKE} />
            </View>
          )}
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          <TouchableOpacity onPress={() => setFile(null)}>
            <Text style={styles.changeFile}>Cambia documento</Text>
          </TouchableOpacity>
        </SurfaceCard>
      ) : (
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.captureOption} onPress={openCamera} activeOpacity={0.85}>
            <ActionIcons.Camera size={ICON_SIZE.emptyState} color={colors.primary} strokeWidth={ICON_STROKE} />
            <Text style={styles.captureOptionText}>Scatta foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureOption} onPress={importPdf} activeOpacity={0.85}>
            <DomainIcons.Invoice size={ICON_SIZE.emptyState} color={colors.primary} strokeWidth={ICON_STROKE} />
            <Text style={styles.captureOptionText}>Importa PDF</Text>
          </TouchableOpacity>
        </View>
      )}

      <AppButton
        label={uploading ? 'Analisi in corso...' : 'Invia e analizza fattura'}
        onPress={handleUpload}
        loading={uploading}
        disabled={!supplierId || !file}
        style={{ marginTop: spacing[6] }}
      />
      {uploading && (
        <Text style={styles.uploadHint}>
          L'AI sta leggendo la fattura, puo' richiedere qualche secondo...
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, marginBottom: spacing[2], marginTop: spacing[4], textTransform: 'uppercase', letterSpacing: 0.5 },
  noSuppliers: { fontSize: typography.sizes.caption, color: colors.danger },
  chipRow: { gap: spacing[2] },
  chip: { paddingHorizontal: spacing[4], paddingVertical: 12, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.body, fontWeight: '500', color: colors.text },
  chipTextSelected: { color: colors.onPrimary },
  captureRow: { flexDirection: 'row', gap: spacing[3] },
  captureOption: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[8], borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  captureOptionText: { fontSize: typography.sizes.bodyMedium, fontWeight: '600', color: colors.text },
  previewCard: { alignItems: 'center' },
  previewImage: { width: '100%', height: 220, borderRadius: radii.sm, marginBottom: spacing[3] },
  pdfPreview: { width: '100%', height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  fileName: { fontSize: typography.sizes.label, color: colors.textSecondary, marginBottom: spacing[2] },
  changeFile: { fontSize: typography.sizes.label, color: colors.primary, fontWeight: '600' },
  uploadHint: { textAlign: 'center', fontSize: typography.sizes.caption, color: colors.textTertiary, marginTop: spacing[3] },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: spacing[10] },
  cameraHint: { color: '#fff', fontSize: typography.sizes.bodyMedium, fontWeight: '600', marginBottom: spacing[6], textAlign: 'center', paddingHorizontal: spacing[8], textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
  cameraActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[8] },
  cameraCancel: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 4, borderColor: 'rgba(255,255,255,0.4)' },
});
