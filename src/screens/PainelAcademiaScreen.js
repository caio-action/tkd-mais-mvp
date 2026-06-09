// src/screens/PainelAcademiaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import db from '../database/database';

const PainelAcademiaScreen = () => {
  const { usuario, logout } = useAuth();
  
  // Estados do Criador de Atividades
  const [modalidade, setModalidade] = useState('Kyorugi'); 
  const [horario, setHorario] = useState('');
  const [dataTreino, setDataTreino] = useState('');
  const [vagas, setVagas] = useState('10');
  const [endereco, setEndereco] = useState('');

  // Estados dos relatórios gerenciais
  const [atletasInscritos, setAtletasInscritos] = useState([]);
  const [financeiro, setFinanceiro] = useState({ bruto: 0, taxa: 0, liquido: 0 });
  const [loading, setLoading] = useState(true);

  const modalidadesDisponiveis = ['Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarDadosPainel = async () => {
    try {
      setLoading(true);

      const queryInscritos = `
        SELECT u.nome as atleta_nome, a.faixa, t.modalidade, t.data, t.horario, r.status
        FROM reservas r
        JOIN atletas a       ON r.atleta_id = a.id
        JOIN usuarios u       ON a.usuario_id = u.id
        JOIN treinamentos t   ON r.treinamento_id = t.id
        WHERE r.status = 'pago_confirmado'
        ORDER BY t.data ASC;
      `;
      const visitantes = await db.getAllAsync(queryInscritos);
      setAtletasInscritos(visitantes);

      const totalBruto = visitantes.length * 30.00;
      const totalTaxa = totalBruto * 0.20; 
      const totalLiquido = totalBruto - totalTaxa;

      setFinanceiro({ bruto: totalBruto, taxa: totalTaxa, liquido: totalLiquido });
    } catch (error) {
      console.error('Erro ao ler relatórios da academia:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosPainel();
  }, []);

  const handleCriarAtividade = async () => {
    if (!horario.trim() || !dataTreino.trim() || !endereco.trim()) {
      Alert.alert('Erro', 'Por favor, preencha horário, data e o endereço completo.');
      return;
    }

    try {
      // CORREÇÃO DEFINITIVA: String SQL perfeitamente limpa e alinhada com as colunas da v5
      await db.runAsync(
        `INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacidade, vagas_disponiveis, endereco_treino, descricao) 
         VALUES (?, null, ?, ?, ?, 90, ?, ?, ?, ?);`,
        [
          usuario.idEspecifico, 
          modalidade, 
          dataTreino, 
          horario, 
          parseInt(vagas), 
          parseInt(vagas), 
          endereco, 
          `Atividade de ${modalidade} aberta organizada e hospedada diretamente por ${usuario.nome}.`
        ]
      );

      Alert.alert('Sucesso! 🥋', `A atividade de ${modalidade} foi publicada e vinculada à sua Equipe/Academia.`);
      
      setHorario('');
      setDataTreino('');
      setEndereco('');
      
      carregarDadosPainel(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível injetar sua atividade personalizada no SQLite.');
    }
  };

  const renderAtletaCard = ({ item }) => (
    <View style={styles.atletaCard}>
      <View style={styles.row}>
        <Text style={styles.atletaNome}>👤 {item.atleta_nome}</Text>
        <Text style={styles.atletaFaixa}>Graduação: {item.faixa}</Text>
      </View>
      <Text style={styles.atletaTreino}>Atividade: {item.modalidade} ({item.data} às {item.horario})</Text>
      <View style={styles.badgePago}><Text style={styles.txtBadge}>PAGAMENTO CONFIRMADO (R$ 30,00)</Text></View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.boasVindas}>Painel do Gestor</Text>
        <Text style={styles.nomeAcademia}>🏢 {usuario?.nome}</Text>
      </View>

      <View style={styles.cardFinanceiro}>
        <Text style={styles.tituloSecao}>Painel de Lucros & Taxas</Text>
        <View style={styles.finRow}>
          <Text style={styles.finLabel}>Faturamento Bruto:</Text>
          <Text style={styles.finValorBruto}>R$ {financeiro.bruto.toFixed(2)}</Text>
        </View>
        <View style={styles.finRow}>
          <Text style={styles.finLabel}>Custo Plataforma (20%):</Text>
          <Text style={styles.finValorTaxa}>- R$ {financeiro.taxa.toFixed(2)}</Text>
        </View>
        <View style={[styles.finRow, { borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}>
          <Text style={styles.finLabelDestaque}>Repasse Líquido Disponível:</Text>
          <Text style={styles.finValorLiquido}>R$ {financeiro.liquido.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.cardForm}>
        <Text style={styles.tituloSecao}>Criar Nova Atividade / Grade</Text>
        
        <Text style={styles.subLabel}>Selecione a Modalidade</Text>
        <View style={styles.rowAbas}>
          {modalidadesDisponiveis.map((mod) => (
            <TouchableOpacity 
              key={mod} 
              style={[styles.aba, modalidade === mod && styles.abaAtiva]} 
              onPress={() => setModalidade(mod)}
            >
              <Text style={[styles.txtAba, modalidade === mod && styles.txtAbaAtiva]}>{mod}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.gridForm}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Data (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2026-06-20" value={dataTreino} onChangeText={setDataTreino} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Horário (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="19:00" value={horario} onChangeText={setHorario} />
          </View>
        </View>

        <Text style={styles.subLabel}>Vagas Disponíveis</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={vagas} onChangeText={setVagas} />

        <Text style={styles.subLabel}>Endereço do Local de Treino</Text>
        <TextInput style={styles.input} placeholder="Rua, Número, Bairro" value={endereco} onChangeText={setEndereco} />

        <TouchableOpacity style={styles.botaoCriar} onPress={handleCriarAtividade}>
          <Text style={styles.txtBotaoCriar}>⚡ Publicar Atividade na Rede</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloFaturamento}>Lista de Visitantes Confirmados ({atletasInscritos.length})</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color="#1F3864" />
      ) : (
        <FlatList
          data={atletasInscritos}
          renderItem={renderAtletaCard}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false} 
          ListEmptyComponent={
            <Text style={styles.vazioTxt}>Nenhum atleta externo agendado para seus dojangs no momento.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.btnSair} onPress={logout}>
        <Text style={styles.txtSair}>Sair do Painel Corporativo</Text>
      </TouchableOpacity>
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