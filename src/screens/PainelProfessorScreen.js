import React, { useState, useEffect, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TreinamentoController from '../controllers/TreinamentoController';
import ReservaController from '../controllers/ReservaController';
import styles from '../styles/PainelProfessorStyles.js';

const FormularioProfessor = memo(({
  modalidade,
  setModalidade,
  horario,
  aplicarMascaraHorario,
  dataTreino,
  aplicarMascaraData,
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
        <Text style={styles.tituloSecao}>Faturamento Gerencial (Taxa 35% WORK)</Text>
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

        <TextInput style={styles.input} placeholder="Data (DD/MM/AAAA)" keyboardType="numeric" maxLength={10} value={dataTreino} onChangeText={aplicarMascaraData} />
        <TextInput style={styles.input} placeholder="Horário (HH:MM)" keyboardType="numeric" maxLength={5} value={horario} onChangeText={aplicarMascaraHorario} />
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
      const pacoteDados = await ReservaController.obterAlunosEFinanceiro(usuario.idEspecifico);
      setAlunosAgendados(pacoteDados.listaAlunos);
      setFinanceiro(pacoteDados.financeiro);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPainelProfessor();
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

  const handlePublicarAulaParticular = async () => {
    if (!dataTreino.includes('/') || dataTreino.length < 10) {
      Alert.alert('Formato Inválido', 'Insira a data completa no formato DD/MM/AAAA.');
      return;
    }

    try {
      // Conversão estruturada antes do Controller/Model
      const [dia, mes, ano] = dataTreino.split('/');
      const dataFormatadaParaSQL = `${ano}-${mes}-${dia}`;

      const retorno = await TreinamentoController.publicarAgendaParticular(
        usuario.idEspecifico,
        usuario.nome,
        modalidade,
        dataFormatadaParaSQL,
        horario,
        endereco,
        precoInput
      );

      Alert.alert('Aula Publicada! ⚡', `Sua agenda de ${retorno.modalidadeComPrefixo} no valor de R$ ${retorno.precoFinal.toFixed(2)} está aberta.`);
      setHorario('');
      setDataTreino('');
      setEndereco('');
      carregarPainelProfessor();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar a aula particular.');
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
              aplicarMascaraHorario={aplicarMascaraHorario}
              dataTreino={dataTreino}
              aplicarMascaraData={aplicarMascaraData}
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

export default PainelProfessorScreen;