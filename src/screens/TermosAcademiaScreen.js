import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AcademiaModel from '../models/AcademiaModel';

const TermosAcademiaScreen = ({ navigation }) => {
  const { usuario, logout, registrarHomologacao } = useAuth();
  
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const [docCarregado, setDocCarregado] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [aceitoTaxa, setAceitoTaxa] = useState(false);

  const aplicarMascaraTelefone = (text) => {
    const limpo = text.replace(/\D/g, '');
    let formatado = limpo;
    if (limpo.length > 0) formatado = `(${limpo.substring(0, 2)}`;
    if (limpo.length > 2) formatado += `) ${limpo.substring(2, 7)}`;
    if (limpo.length > 7) formatado += `-${limpo.substring(7, 11)}`;
    setTelefone(formatado);
  };

  const buscarCep = async (valorCep) => {
    const cepLimpo = valorCep.replace(/\D/g, '');
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
          Alert.alert('Aviso', 'CEP não localizado.');
        } else {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha de rede ao consultar CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const simularUploadDocumento = () => {
    setLoadingDoc(true);
    setTimeout(() => {
      setLoadingDoc(false);
      setDocCarregado(!docCarregado);
      Alert.alert('Upload Concluído! 📄', 'Contrato assinado anexado com sucesso.');
    }, 1200);
  };

  const handleAtivarAcademia = async () => {
    if (
      !responsavel.trim() || !telefone.trim() || !cep.trim() || 
      !logradouro.trim() || !numero.trim() || !bairro.trim() || 
      !cidade.trim() || !estado.trim() || !docCarregado || !aceitoTaxa
    ) {
      Alert.alert('Pendência', 'Preencha todos os campos e anexe o contrato.');
      return;
    }

    try {
      // Executa inserção via Model isolado (Padrão MVC)
      const result = await AcademiaModel.cadastrarHomologacaoLocal(
        usuario.id, usuario.nome, 'filiada', cep, logradouro, numero, bairro, cidade, estado, telefone
      );

      const novaAcademiaId = result.lastInsertRowId;
      
      // Salva log de atividade
      await AcademiaModel.registrarLogAtividade(
        usuario.id, 'HOMOLOGACAO', `Dojang "${usuario.nome}" homologado por ${responsavel}.`
      );

      Alert.alert('Dojang Ativo! 🏟️', 'Homologação registrada com sucesso!');
      await registrarHomologacao(novaAcademiaId);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar homologação da academia.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Homologação de Dojang</Text>
      <Text style={styles.subtitulo}>Módulo Corporativo para Equipes e Associações</Text>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Identificação</Text>
        <Text style={styles.label}>Nome do Mestre / Responsável Técnico</Text>
        <TextInput style={styles.input} placeholder="Ex: Mestre Carlos Silva" value={responsavel} onChangeText={setResponsavel} />

        <Text style={styles.label}>Telefone Comercial / WhatsApp</Text>
        <TextInput style={styles.input} placeholder="(11) 99999-9999" keyboardType="phone-pad" value={telefone} onChangeText={aplicarMascaraTelefone} maxLength={15} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Localização Geográfica</Text>
        <Text style={styles.label}>CEP (Preenchimento Automático)</Text>
        <View style={styles.cepContainer}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="00000-000" keyboardType="numeric" value={cep} onChangeText={buscarCep} maxLength={9} />
          {loadingCep && <ActivityIndicator style={{ marginLeft: 10 }} color="#1F3864" />}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 3, marginRight: 8 }}>
            <Text style={styles.label}>Logradouro</Text>
            <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={numero} onChangeText={setNumero} />
          </View>
        </View>

        <Text style={styles.label}>Bairro</Text>
        <TextInput style={styles.input} value={bairro} onChangeText={setBairro} />

        <View style={styles.row}>
          <View style={{ flex: 3, marginRight: 8 }}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput style={styles.input} value={cidade} editable={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>UF</Text>
            <TextInput style={styles.input} value={estado} editable={false} maxLength={2} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Contrato de Credenciamento</Text>
        <TouchableOpacity style={[styles.btnUpload, docCarregado && styles.btnUploadSucesso]} onPress={simularUploadDocumento} disabled={loadingDoc}>
          {loadingDoc ? <ActivityIndicator color="#1F3864" /> : <Text style={[styles.txtUpload, docCarregado && styles.txtUploadSucesso]}>{docCarregado ? '✓ Documento Anexado' : '📎 Escolher Arquivo Assinado'}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.cardTaxa}>
        <Text style={styles.tituloTaxa}>Política Financeira</Text>
        <Text style={styles.textoTaxa}>Retenção de 20% de taxa administrativa sobre treinos comprados.</Text>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAceitoTaxa(!aceitoTaxa)}>
          <View style={[styles.checkbox, aceitoTaxa && styles.checkboxAtivo]}>{aceitoTaxa && <Text style={styles.checkmark}>✓</Text>}</View>
          <Text style={styles.txtCheckbox}>Concordo com os termos operacionais.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoAtivar} onPress={handleAtivarAcademia}>
        <Text style={styles.txtBotaoAtivar}>Homologar Sede</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={logout}>
        <Text style={styles.txtBotaoSair}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, backgroundColor: '#F5F7FA', flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864', marginBottom: 2 },
  subtitulo: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#1F3864', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 4 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12, color: '#334155' },
  cepContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  row: { flexDirection: 'row' },
  btnUpload: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#2E75B6', padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f7ff' },
  btnUploadSucesso: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  txtUpload: { color: '#2E75B6', fontWeight: 'bold' },
  txtUploadSucesso: { color: '#16a34a' },
  cardTaxa: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  tituloTaxa: { fontSize: 14, fontWeight: 'bold', color: '#dc2626', marginBottom: 8 },
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