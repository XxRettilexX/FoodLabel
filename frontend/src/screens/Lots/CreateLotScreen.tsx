import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../../api/client';

export function CreateLotScreen({ navigation }: any) {
  const [batch, setBatch] = useState('');
  const [qty, setQty] = useState('');
  
  const handleCreate = async () => {
    try {
      await apiClient.post('/lots', {
        batch_number: batch,
        initial_quantity: Number(qty),
        current_quantity: Number(qty),
        unit: 'kg',
        product_id: 1, // mock
        produced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 864000000).toISOString()
      });
      Alert.alert('Successo', 'Lotto creato con successo');
      navigation.goBack();
    } catch(err) {
      Alert.alert('Attenzione', 'Creazione fallita o API non disponibile, torna indietro');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Codice Lotto Batch</Text>
      <TextInput style={styles.input} value={batch} onChangeText={setBatch} placeholder="es. LTT-001" />
      
      <Text style={styles.label}>Quantità (Kg)</Text>
      <TextInput style={styles.input} value={qty} onChangeText={setQty} keyboardType="numeric" placeholder="10" />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Salva Lotto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#374151' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 15 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
