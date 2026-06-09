// src/screens/PagamentoScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { simularPagamentoRemoto } from '../services/api';
import db from '../database/database';

const PagamentoScreen = ({ route, navigation }) => {
  // Recebe o ID da reserva que foi passado pela tela anterior
  const { reservaId } = route.params;

  const [metodo, setMetodo] = useState('pix'); // 'pix' ou 'cartao'
  const [cpf, setCpf] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [loading, setLoading] = useState(false);

  // Validação simples de CPF (Apenas garante 11 números)
  const validarCPF = (textoCpf) => {
    const apenasNumeros = textoCpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const processarPagamento = async () => {
    if (!validarCPF(cpf)) {
      Alert.alert('Dados Inválidos', 'Por favor, insira um CPF válido com 11 dígitos numéricos.');
      return;
    }

    if (metodo === 'cartao' && numeroCartao.replace(/\D/g, '').length < 16) {
      Alert.alert('Dados Inválidos', 'Insira um número de cartão de crédito válido (16 dígitos).');
      return;
    }

    try {
      setLoading(true);
      // O Axios dispara a requisição real
      await simularPagamentoRemoto(reservaId, 30.00);

      // Atualiza no banco de dados do celular
      await db.runAsync("UPDATE reservas SET status = 'pago_confirmado' WHERE id = ?;", [reservaId]);
      
      Alert.alert('Sucesso! 🥋', 'Pagamento aprovado. Sua credencial de treino está na aba Início.');
      navigation.goBack(); // Volta para a tela de Minhas Reservas (que vai se auto-atualizar)
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema de conexão com a operadora financeira.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.titulo}>Finalizar Compra</Text>
        <Text style={styles.subtitulo}>Valor total: R$ 30,00</Text>

        <Text style={styles.label}>Método de Pagamento</Text>
        <View style={styles.rowMetodo}>
          <TouchableOpacity 
            style={[styles.btnMetodo, metodo === 'pix' && styles.btnMetodoAtivo]} 
            onPress={() => setMetodo('pix')}
          >
            <Text style={[styles.txtMetodo, metodo === 'pix' && styles.txtMetodoAtivo]}>PIX</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btnMetodo, metodo === 'cartao' && styles.btnMetodoAtivo]} 
            onPress={() => setMetodo('cartao')}
          >
            <Text style={[styles.txtMetodo, metodo === 'cartao' && styles.txtMetodoAtivo]}>Cartão de Crédito</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>CPF do Titular</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Apenas números (11 dígitos)" 
          keyboardType="numeric" 
          value={cpf} 
          onChangeText={setCpf} 
          maxLength={14} 
        />

        {metodo === 'cartao' && (
          <>
            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0000 0000 0000 0000" 
              keyboardType="numeric" 
              value={numeroCartao} 
              onChangeText={setNumeroCartao} 
              maxLength={19} 
            />
          </>
        )}

        <TouchableOpacity 
          style={[styles.botaoConfirmar, loading && { opacity: 0.7 }]} 
          onPress={processarPagamento} 
          disabled={loading}
        >
          <Text style={styles.textoBotaoConfirmar}>
            {loading ? 'Processando...' : 'Pagar R$ 30,00'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 30 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864', marginBottom: 4 },
  subtitulo: { fontSize: 16, color: '#16a34a', fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8, marginTop: 12 },
  rowMetodo: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnMetodo: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', backgroundColor: '#fff' },
  btnMetodoAtivo: { borderColor: '#1F3864', backgroundColor: '#e2e8f0' },
  txtMetodo: { fontWeight: 'bold', color: '#64748b' },
  txtMetodoAtivo: { color: '#1F3864' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', padding: 14, borderRadius: 8, fontSize: 16 },
  botaoConfirmar: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  textoBotaoConfirmar: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { padding: 16, alignItems: 'center', marginTop: 8 },
  textoBotaoCancelar: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' }
});

export default PagamentoScreen;