// src/screens/TermosAcademiaScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import db from '../database/database';

const TermosAcademiaScreen = ({ navigation }) => {
const { usuario, logout, registrarHomologacao } = useAuth();  const [responsavel, setResponsavel] = useState('');
  const [docCarregado, setDocCarregado] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [aceitoTaxa, setAceitoTaxa] = useState(false);

  const simularUploadDocumento = () => {
    setLoadingDoc(true);
    // Simula o tempo de upload de um PDF/Imagem do celular
    setTimeout(() => {
      setLoadingDoc(false);
      setDocCarregado(true);
      Alert.alert('Upload Concluído! 📄', 'Contrato assinado pelo Mestre/Responsável anexado com sucesso.');
    }, 2000);
  };

  const handleAtivarAcademia = async () => {
  if (!responsavel.trim() || !docCarregado || !aceitoTaxa) {
    Alert.alert('Pendência', 'Preencha todos os campos e aceite a taxa.');
    return;
  }

    try {
      const result = await db.runAsync(
      "INSERT INTO academias (usuario_id, nome, tipo, endereco, telefone, ativa) VALUES (?, ?, ?, ?, ?, 1);",
      [usuario.id, usuario.nome, 'filiada', 'Rua Padrão, 123', '(11) 90000-0000']
    );

    const novaAcademiaId = result.lastInsertRowId;
    
    Alert.alert('Dojang Ativo! 🏟️', 'Homologada com sucesso!');
    
    await registrarHomologacao(novaAcademiaId);
    
  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Falha ao salvar homologação da academia.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Homologação de Dojang</Text>
      <Text style={styles.subtitulo}>Aplicável a Academias, Equipes ou Associações</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome do Mestre / Responsável Técnico</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Mestre Carlos Silva, 4º Dan" 
          value={responsavel} 
          onChangeText={setResponsavel} 
        />

        <Text style={styles.label}>Contrato de Credenciamento</Text>
        <Text style={styles.instrucao}>Anexe o documento impresso e assinado digitalmente pelo responsável autorizando a inscrição.</Text>
        
        <TouchableOpacity 
          style={[styles.btnUpload, docCarregado && styles.btnUploadSucesso]} 
          onPress={simularUploadDocumento}
          disabled={loadingDoc}
        >
          {loadingDoc ? (
            <ActivityIndicator color="#1F3864" />
          ) : (
            <Text style={[styles.txtUpload, docCarregado && styles.txtUploadSucesso]}>
              {docCarregado ? '✓ Documento Anexado' : '📎 Escolher Arquivo Assinado'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.cardTaxa}>
        <Text style={styles.tituloTaxa}>Política Financeira da Plataforma</Text>
        <Text style={styles.textoTaxa}>
          O TKD+MAIS opera sob o modelo de coparticipação. **Não há custos fixos ou taxa de assinatura mensal.** {"\n\n"}
          Fica estipulada a retenção automática de **20% de taxa administrativa** sobre o valor bruto de cada vaga efetivamente comprada por atletas visitantes na plataforma, destinada à manutenção dos servidores e taxas de liquidação bancária.
        </Text>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAceitoTaxa(!aceitoTaxa)}>
          <View style={[styles.checkbox, aceitoTaxa && styles.checkboxAtivo]}>
            {aceitoTaxa && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.txtCheckbox}>Concordo com o desconto de 20% por transação recebida.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoAtivar} onPress={handleAtivarAcademia}>
        <Text style={styles.txtBotaoAtivar}>Homologar e Acessar Painel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={logout}>
        <Text style={styles.txtBotaoSair}>Voltar para o Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#F5F7FA', flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864', marginBottom: 2 },
  subtitulo: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 14 },
  instrucao: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  btnUpload: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#2E75B6', padding: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f7ff' },
  btnUploadSucesso: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  txtUpload: { color: '#2E75B6', fontWeight: 'bold' },
  txtUploadSucesso: { color: '#16a34a' },
  cardTaxa: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  tituloTaxa: { fontSize: 15, fontWeight: 'bold', color: '#dc2626', marginBottom: 8 },
  textoTaxa: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#1F3864', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxAtivo: { backgroundColor: '#1F3864' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  txtCheckbox: { fontSize: 12, fontWeight: '600', color: '#1F3864', flex: 1 },
  botaoAtivar: { backgroundColor: '#1F3864', padding: 16, borderRadius: 8, alignItems: 'center' },
  txtBotaoAtivar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoSair: { padding: 16, alignItems: 'center', marginTop: 8 },
  txtBotaoSair: { color: '#ef4444', fontWeight: 'bold' }
});

export default TermosAcademiaScreen;