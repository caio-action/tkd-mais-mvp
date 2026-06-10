import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import db from '../database/database';

const PagamentoScreen = ({ route, navigation }) => {
  const { reservaId, valorTotal } = route.params;
  const [cpf, setCpf] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');

  const formas = [
    { id: 'pix', label: '⚡ PIX' },
    { id: 'credito', label: '💳 Cartão de Crédito' },
    { id: 'boleto', label: '📄 Boleto Bancário' }
  ];

  const confirmarPagamento = async () => {
    if (!cpf.trim() || cpf.length < 11) {
      Alert.alert('Dados Incompletos', 'Por favor, insira um CPF válido para emissão do comprovante.');
      return;
    }

    try {
      await db.runAsync("UPDATE reservas SET status = 'pago_confirmado' WHERE id = ?;", [reservaId]);
      Alert.alert('Sucesso 🎉', 'Pagamento processado e vaga confirmada.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao confirmar o pagamento no banco.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Finalizar Compra</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Reserva número: #{reservaId}</Text>
        <Text style={styles.valor}>Total: R$ {valorTotal ? valorTotal.toFixed(2) : '0.00'}</Text>
      </View>

      <View style={styles.cardForm}>
        <Text style={styles.secaoTitulo}>Identificação do Comprador</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Digite seu CPF (apenas números)" 
          keyboardType="numeric"
          maxLength={11}
          value={cpf}
          onChangeText={setCpf}
        />

        <Text style={[styles.secaoTitulo, { marginTop: 16 }]}>Forma de Pagamento</Text>
        <View style={styles.formasRow}>
          {formas.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.btnForma, formaPagamento === item.id && styles.btnFormaAtiva]}
              onPress={() => setFormaPagamento(item.id)}
            >
              <Text style={[styles.txtForma, formaPagamento === item.id && styles.txtFormaAtiva]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.btnPagar} onPress={confirmarPagamento}>
        <Text style={styles.btnText}>Confirmar e Pagar Agora</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#F5F7FA', flexGrow: 1, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 16 },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  valor: { fontSize: 24, fontWeight: 'bold', color: '#16a34a' },
  cardForm: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  secaoTitulo: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 6, fontSize: 14, backgroundColor: '#fff', color: '#334155' },
  formasRow: { flexDirection: 'column', gap: 10 },
  btnForma: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
  btnFormaAtiva: { backgroundColor: '#1F3864', borderColor: '#1F3864' },
  txtForma: { color: '#475569', fontWeight: '600', fontSize: 14 },
  txtFormaAtiva: { color: '#fff' },
  btnPagar: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default PagamentoScreen;