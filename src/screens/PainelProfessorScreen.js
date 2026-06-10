import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import db from '../database/database';

const FormularioProfessor = memo(({
  modalidade,
  setModalidade,
  horario,
  setHorario,
  dataTreino,
  setDataTreino,
  endereco,
  setEndereco,
  precoInput,
  setPrecoInput,
  modalidades,
  handlePublicarAulaParticular,
  usuario,
  financeiro,
  alunosAgendadosLength
}) => {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.boasVindas}>Área do Professor</Text>
        <Text style={styles.nomeProf}>🥋 {usuario?.nome} (Personal Trainer)</Text>
      </View>

      <View style={styles.cardFin}>
        <Text style={styles.tituloSecao}>Faturamento Gerencial (Taxa 35%)</Text>
        <View style={styles.finRow}><Text style={styles.lbl}>Faturamento Bruto:</Text><Text style={styles.val}>R$ {financeiro.bruto.toFixed(2)}</Text></View>
        <View style={styles.finRow}><Text style={styles.lbl}>Taxa Administrativa (35%):</Text><Text style={[styles.val, {color: '#f87171'}]}>- R$ {financeiro.taxa.toFixed(2)}</Text></View>
        <View style={styles.finRow}><Text style={styles.lblDestaque}>Líquido Disponível para Saque:</Text><Text style={styles.valLiquido}>R$ {financeiro.liquido.toFixed(2)}</Text></View>
      </View>

      <View style={styles.cardForm}>
        <Text style={styles.tituloSecao}>Disponibilizar Horário Particular</Text>
        
        <View style={styles.rowAbas}>
          {modalidades.map((mod) => (
            <TouchableOpacity key={mod} style={[styles.aba, modalidade === mod && styles.abaAtiva]} onPress={() => setModalidade(mod)}>
              <Text style={[styles.txtAba, modalidade === mod && styles.txtAbaAtiva]}>{mod}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" value={dataTreino} onChangeText={setDataTreino} />
        <TextInput style={styles.input} placeholder="Horário (HH:MM)" value={horario} onChangeText={setHorario} />
        <TextInput style={styles.input} placeholder="Local de Atendimento" value={endereco} onChangeText={setEndereco} />
        
        <Text style={styles.subLabel}>Valor da Sessão Individual (R$)</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="100.00" value={precoInput} onChangeText={setPrecoInput} />

        <TouchableOpacity style={styles.btnPublicar} onPress={handlePublicarAulaParticular}>
          <Text style={styles.txtBtn}>📅 Abrir Vaga Particular</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloLista}>Meus Alunos Agendados ({alunosAgendadosLength})</Text>
    </View>
  );
});

const PainelProfessorScreen = () => {
  const { usuario, logout } = useAuth();
  
  const [modalidade, setModalidade] = useState('Kyorugi'); 
  const [horario, setHorario] = useState('');
  const [dataTreino, setDataTreino] = useState('');
  const [endereco, setEndereco] = useState('');
  const [precoInput, setPrecoInput] = useState('100.00'); 

  const [alunosAgendados, setAlunosAgendados] = useState([]);
  const [financeiro, setFinanceiro] = useState({ bruto: 0, taxa: 0, liquido: 0 });
  const [loading, setLoading] = useState(true);

  const modalidades = ['Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarPainelProfessor = async () => {
    try {
      setLoading(true);
      
      const queryAlunos = `
        SELECT u.nome as aluno_nome, a.faixa, t.modalidade, t.data, t.horario, t.preco, r.status
        FROM reservas r
        JOIN atletas a       ON r.atleta_id = a.id
        JOIN usuarios u       ON a.usuario_id = u.id
        JOIN treinamentos t   ON r.treinamento_id = t.id
        WHERE t.professor_id = ?
        ORDER BY t.data ASC;
      `;
      const resposta = await db.getAllAsync(queryAlunos, [usuario.idEspecifico]);
      setAlunosAgendados(resposta);

      let totalBruto = 0;
      resposta.forEach(item => {
        if (item.status === 'pago_confirmado') {
          totalBruto += item.preco;
        }
      });
      
      const totalTaxa = totalBruto * 0.35; 
      const totalLiquido = totalBruto - totalTaxa;

      setFinanceiro({ bruto: totalBruto, taxa: totalTaxa, liquido: totalLiquido });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPainelProfessor();
  }, []);

  const handlePublicarAulaParticular = async () => {
    if (!horario.trim() || !dataTreino.trim() || !endereco.trim() || !precoInput.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos, incluindo o preço da aula particular.');
      return;
    }

    try {
      const modalidadeComPrefixo = `Personal: ${modalidade}`;
      const precoFinal = parseFloat(precoInput.replace(',', '.'));

      await db.runAsync(
        `INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacidade, vagas_disponiveis, endereco_treino, preco, descricao) 
         VALUES (null, ?, ?, ?, ?, 60, 1, 1, ?, ?, ?);`,
        [
          usuario.idEspecifico,
          modalidadeComPrefixo, 
          dataTreino,
          horario,
          endereco,
          precoFinal, 
          `Atendimento individualizado de alta performance com o Personal Trainer ${usuario.nome}.`
        ]
      );

      Alert.alert('Aula Publicada! ⚡', `Sua agenda de ${modalidadeComPrefixo} no valor de R$ ${precoFinal.toFixed(2)} está aberta.`);
      
      setHorario('');
      setDataTreino('');
      setEndereco('');
      
      carregarPainelProfessor();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível cadastrar a aula particular no SQLite.');
    }
  };

  const renderAlunoItem = ({ item }) => (
    <View style={styles.alunoCard}>
      <View style={styles.alunoHeader}>
        <Text style={styles.alunoNome}>👤 Aluno: {item.aluno_nome} ({item.faixa})</Text>
        <Text style={[styles.statusBadge, item.status === 'pago_confirmado' ? styles.statusPago : styles.statusPendente]}>
          {item.status === 'pago_confirmado' ? 'PAGO' : 'CARRINHO'}
        </Text>
      </View>
      <Text style={styles.alunoDetalhe}>📅 {item.data} às {item.horario} - {item.modalidade}</Text>
      <Text style={styles.alunoPreco}>Valor: R$ {item.preco.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1F3864" style={{ flex: 1, justifyContent: 'center' }} />
      ) : (
        <FlatList
          data={alunosAgendados}
          renderItem={renderAlunoItem}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <FormularioProfessor
              modalidade={modalidade}
              setModalidade={setModalidade}
              horario={horario}
              setHorario={setHorario}
              dataTreino={dataTreino}
              setDataTreino={setDataTreino}
              endereco={endereco}
              setEndereco={setEndereco}
              precoInput={precoInput}
              setPrecoInput={setPrecoInput}
              modalidades={modalidades}
              handlePublicarAulaParticular={handlePublicarAulaParticular}
              usuario={usuario}
              financeiro={financeiro}
              alunosAgendadosLength={alunosAgendados.length}
            />
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.btnSair} onPress={logout}>
              <Text style={styles.txtSair}>Sair do Painel</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.txtVazio}>Nenhum aluno agendou horários com você ainda.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 16, paddingTop: 50 },
  header: { marginBottom: 16 },
  boasVindas: { fontSize: 24, fontWeight: 'bold', color: '#1F3864' },
  nomeProf: { fontSize: 14, color: '#475569', fontWeight: '600' },
  cardFin: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 },
  tituloSecao: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  lbl: { color: '#94a3b8', fontSize: 13 },
  lblDestaque: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  val: { color: '#fff', fontWeight: 'bold' },
  valLiquido: { color: '#4ade80', fontWeight: 'bold', fontSize: 15 },
  cardForm: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  subLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 4 },
  rowAbas: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  aba: { flex: 1, padding: 10, borderRadius: 6, backgroundColor: '#f1f5f9', alignItems: 'center' },
  abaAtiva: { backgroundColor: '#1F3864' },
  txtAba: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  txtAbaAtiva: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 6, marginBottom: 10, fontSize: 14, backgroundColor: '#fff' },
  btnPublicar: { backgroundColor: '#16a34a', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 6 },
  txtBtn: { color: '#fff', fontWeight: 'bold' },
  tituloLista: { fontSize: 16, fontWeight: 'bold', color: '#1F3864', marginBottom: 10 },
  alunoCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  alunoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  alunoNome: { fontWeight: 'bold', color: '#334155', fontSize: 14 },
  statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusPago: { backgroundColor: '#d1fae5', color: '#065f46' },
  statusPendente: { backgroundColor: '#fef3c7', color: '#92400e' },
  alunoDetalhe: { fontSize: 12, color: '#64748b', marginTop: 2 },
  alunoPreco: { fontSize: 12, fontWeight: 'bold', color: '#16a34a', marginTop: 2 },
  txtVazio: { fontStyle: 'italic', color: '#64748b', textAlign: 'center', marginTop: 8, fontSize: 13, paddingVertical: 10 },
  btnSair: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  txtSair: { color: '#fff', fontWeight: 'bold' }
});

export default PainelProfessorScreen;