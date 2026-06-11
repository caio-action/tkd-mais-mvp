import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TreinamentoController from '../controllers/TreinamentoController';
import ReservaController from '../controllers/ReservaController';

const PainelAcademiaScreen = () => {
  const { usuario, logout } = useAuth();
  const [precoInput, setPrecoInput] = useState('35.00');
  const [modalidade, setModalidade] = useState('Kyorugi'); 
  const [horario, setHorario] = useState('');
  const [dataTreino, setDataTreino] = useState('');
  const [vagas, setVagas] = useState('10');
  const [endereco, setEndereco] = useState('');

  const [atletasInscritos, setAtletasInscritos] = useState([]);
  const [financeiro, setFinanceiro] = useState({ bruto: 0, taxa: 0, liquido: 0 });
  const [loading, setLoading] = useState(true);

  const modalidadesDisponiveis = ['Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarDadosPainel = async () => {
    try {
      setLoading(true);
      const dataPack = await ReservaController.obterFaturamentoAcademia(usuario.idEspecifico);
      setAtletasInscritos(dataPack.atletasInscritos);
      setFinanceiro(dataPack.financeiro);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosPainel();
  }, []);

  const aplicarMascaraData = (text) => {
    const limpo = text.replace(/\D/g, '');
    let formatado = limpo;
    
    if (limpo.length > 2) {
      formatado = `${limpo.substring(0, 2)}/${limpo.substring(2, 4)}`;
    }
    if (limpo.length > 4) {
      formatado += `/${limpo.substring(4, 8)}`;
    }
    setDataTreino(formatado);
  };

  const aplicarMascaraHorario = (text) => {
    const limpo = text.replace(/\D/g, '');
    let formatado = limpo;
    
    if (limpo.length > 2) {
      formatado = `${limpo.substring(0, 2)}:${limpo.substring(2, 4)}`;
    }
    setHorario(formatado);
  };

  const handleCriarAtividade = async () => {
    if (!dataTreino.includes('/') || dataTreino.length < 10) {
      Alert.alert('Formato Inválido', 'Insira a data completa no formato DD/MM/AAAA.');
      return;
    }

    try {
      const [dia, mes, ano] = dataTreino.split('/');
      const dataFormatadaParaSQL = `${ano}-${mes}-${dia}`;

      await TreinamentoController.publicarGradeAcademia(
        usuario.idEspecifico, modalidade, dataFormatadaParaSQL, horario, vagas, endereco, precoInput
      );
      Alert.alert('Sucesso! 🥋', 'Atividade da academia publicada na rede.');
      setHorario('');
      setDataTreino('');
      setEndereco('');
      carregarDadosPainel(); 
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const renderAtletaCard = ({ item }) => (
    <View style={styles.atletaCard}>
      <View style={styles.row}>
        <Text style={styles.atletaNome}>👤 {item.atleta_nome}</Text>
        <Text style={styles.atletaFaixa}>Graduação: {item.faixa}</Text>
      </View>
      <Text style={styles.atletaTreino}>Atividade: {item.modalidade} ({item.data} às {item.horario})</Text>
      <View style={styles.badgePago}><Text style={styles.txtBadge}>PAGAMENTO CONFIRMADO</Text></View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.boasVindas}>Painel do Gestor</Text>
        <Text style={styles.nomeAcademia}>🏢 {usuario?.nome}</Text>
      </View>

      <View style={styles.cardFinanceiro}>
        <Text style={styles.tituloSecao}>Painel de Lucros & Taxas</Text>
        <View style={styles.finRow}><Text style={styles.finLabel}>Faturamento Bruto:</Text><Text style={styles.finValorBruto}>R$ {financeiro.bruto.toFixed(2)}</Text></View>
        <View style={styles.finRow}><Text style={styles.finLabel}>Custo Plataforma (20%):</Text><Text style={styles.finValorTaxa}>- R$ {financeiro.taxa.toFixed(2)}</Text></View>
        <View style={[styles.finRow, { borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}><Text style={styles.finLabelDestaque}>Repasse Líquido:</Text><Text style={styles.finValorLiquido}>R$ {financeiro.liquido.toFixed(2)}</Text></View>
      </View>

      <View style={styles.cardForm}>
        <Text style={styles.subLabel}>Valor da Inscrição por Atleta (R$)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={precoInput} onChangeText={setPrecoInput} />
        
        <Text style={styles.subLabel}>Selecione a Modalidade</Text>
        <View style={styles.rowAbas}>
          {modalidadesDisponiveis.map((mod) => (
            <TouchableOpacity key={mod} style={[styles.aba, modalidade === mod && styles.abaAtiva]} onPress={() => setModalidade(mod)}>
              <Text style={[styles.txtAba, modalidade === mod && styles.txtAbaAtiva]}>{mod}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.gridForm}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Data (DD/MM/AAAA)</Text>
            <TextInput style={styles.input} placeholder="20/06/2026" keyboardType="numeric" maxLength={10} value={dataTreino} onChangeText={aplicarMascaraData} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Horário (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="19:00" keyboardType="numeric" maxLength={5} value={horario} onChangeText={aplicarMascaraHorario} />
          </View>
        </View>

        <Text style={styles.subLabel}>Vagas Disponíveis</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={vagas} onChangeText={setVagas} />

        <Text style={styles.subLabel}>Endereço do Local de Treino</Text>
        <TextInput style={styles.input} placeholder="Rua, Número, Bairro" value={endereco} onChangeText={setEndereco} />

        <TouchableOpacity style={styles.botaoCriar} onPress={handleCriarAtividade}>
          <Text style={styles.txtBotaoCriar}>Publicar Atividade</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloFaturamento}>Lista de Visitantes Confirmados ({atletasInscritos.length})</Text>
      {loading ? <ActivityIndicator size="small" color="#1F3864" /> : (
        <FlatList data={atletasInscritos} renderItem={renderAtletaCard} keyExtractor={(item, index) => index.toString()} scrollEnabled={false} ListEmptyComponent={<Text style={styles.vazioTxt}>Nenhum atleta agendado.</Text>} />
      )}

      <TouchableOpacity style={styles.btnSair} onPress={logout}><Text style={styles.txtSair}>Sair do Painel</Text></TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16, paddingTop: 50 },
  header: { marginBottom: 16 },
  boasVindas: { fontSize: 24, fontWeight: 'bold', color: '#1F3864' },
  nomeAcademia: { fontSize: 14, color: '#475569', fontWeight: '600', marginTop: 2 },
  cardFinanceiro: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 16 },
  tituloSecao: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  finLabel: { color: '#94A3B8', fontSize: 13 },
  finLabelDestaque: { color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' },
  finValorBruto: { color: '#fff', fontWeight: 'bold' },
  finValorTaxa: { color: '#f87171', fontWeight: '500' },
  finValorLiquido: { color: '#4ade80', fontWeight: 'bold', fontSize: 15 },
  cardForm: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  subLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6, marginTop: 8 },
  rowAbas: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  aba: { flex: 1, padding: 10, borderRadius: 6, backgroundColor: '#f1f5f9', alignItems: 'center' },
  abaAtiva: { backgroundColor: '#1F3864' },
  txtAba: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  txtAbaAtiva: { color: '#fff' },
  gridForm: { flexDirection: 'row', gap: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 6, backgroundColor: '#fff', fontSize: 14 },
  botaoCriar: { backgroundColor: '#2E75B6', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  txtBotaoCriar: { color: '#fff', fontWeight: 'bold' },
  tituloFaturamento: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', marginBottom: 10 },
  atletaCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  atletaNome: { fontWeight: 'bold', color: '#334155' },
  atletaFaixa: { fontSize: 12, color: '#64748b' },
  atletaTreino: { fontSize: 12, color: '#475569', marginVertical: 6 },
  badgePago: { backgroundColor: '#ecc94b', padding: 4, borderRadius: 4, width: '70%', alignItems: 'center' },
  txtBadge: { fontSize: 9, fontWeight: 'bold', color: '#744210' },
  vazioTxt: { textAlign: 'center', color: '#64748b', marginTop: 10, fontSize: 13, fontStyle: 'italic' },
  btnSair: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  txtSair: { color: '#fff', fontWeight: 'bold' }
});

export default PainelAcademiaScreen;