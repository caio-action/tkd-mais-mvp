import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import db from '../database/database';

const TermosProfessorScreen = () => {
  const { usuario, registrarHomologacao, logout } = useAuth();
  const [docMestreCarregado, setDocMestreCarregado] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [aceitoTaxa, setAceitoTaxa] = useState(false);

  const handleUploadAssinaturaMestre = () => {
    setLoadingDoc(true);
    setTimeout(() => {
      setLoadingDoc(false);
      setDocMestreCarregado(true);
      Alert.alert('Documento Validado! 📄', 'Assinatura e autorização do Mestre formador anexadas com sucesso.');
    }, 2000);
  };

  const handleAtivarPerfilIndependente = async () => {
    if (!docMestreCarregado || !aceitoTaxa) {
      Alert.alert('Pendência', 'É obrigatório anexar a autorização do seu Mestre formador e concordar com os termos de comissão de 35%.');
      return;
    }

    try {
      await db.runAsync(
        "UPDATE professores SET especialidade = 'Personal Trainer' WHERE usuario_id = ?;", 
        [usuario.id]
      );
      
      Alert.alert('Perfil Liberado! 🥋', 'Sua credencial de Personal Trainer Independente foi homologada com sucesso.');
      await registrarHomologacao(usuario.idEspecifico);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao ativar perfil de professor no SQLite.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Credenciamento de Personal</Text>
      <Text style={styles.subtitulo}>Módulo de Validação para Professores Independentes</Text>

      <View style={styles.cardInfo}>
        <Text style={styles.labelRegra}>Critérios Homologatórios:</Text>
        <Text style={styles.txtRegra}>• Comprovação de Graduação mínima: Faixa Preta (1º Dan+).</Text>
        <Text style={styles.txtRegra}>• Upload obrigatório do aval digitalizado assinado pelo Mestre Formador.</Text>
      </View>

      <View style={styles.cardUpload}>
        <Text style={styles.label}>Carta do Mestre Formador</Text>
        <Text style={styles.instrucao}>Anexe o documento que atesta sua formação de faixa preta e concede autorização para lecionar de forma autônoma.</Text>
        
        <TouchableOpacity 
          style={[styles.btnUpload, docMestreCarregado && styles.btnUploadSucesso]} 
          onPress={handleUploadAssinaturaMestre}
          disabled={loadingDoc}
        >
          {loadingDoc ? (
            <ActivityIndicator color="#1F3864" />
          ) : (
            <Text style={[styles.txtUpload, docMestreCarregado && styles.txtUploadSucesso]}>
              {docMestreCarregado ? '✓ Carta Autorizada' : '📎 Anexar Assinatura do Mestre'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.cardTaxa}>
        <Text style={styles.tituloTaxa}>Taxa Operacional de Aulas Particulares</Text>
        <Text style={styles.textoTaxa}>
          Devido ao ticket médio superior aplicado em consultorias de Personal Trainer e atendimento individualizado, fica estipulada a retenção de **35% de taxa operacional** sobre o valor bruto configurado por você em cada agendamento individualizado.
        </Text>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAceitoTaxa(!aceitoTaxa)}>
          <View style={[styles.checkbox, aceitoTaxa && styles.checkboxAtivo]}>
            {aceitoTaxa && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.txtCheckbox}>Concordo com a retenção administrativa de 35% por atendimento particular.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoAtivar} onPress={handleAtivarPerfilIndependente}>
        <Text style={styles.txtBotaoAtivar}>Concluir Homologação</Text>
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
  cardInfo: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  labelRegra: { fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 },
  txtRegra: { fontSize: 12, color: '#1e3a8a', marginBottom: 2 },
  cardUpload: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  instrucao: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  btnUpload: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#2E75B6', padding: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f7ff' },
  btnUploadSucesso: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  txtUpload: { color: '#2E75B6', fontWeight: 'bold' },
  txtUploadSucesso: { color: '#16a34a' },
  cardTaxa: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  tituloTaxa: { fontSize: 14, fontWeight: 'bold', color: '#dc2626', marginBottom: 6 },
  textoTaxa: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 12 },
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

export default TermosProfessorScreen;