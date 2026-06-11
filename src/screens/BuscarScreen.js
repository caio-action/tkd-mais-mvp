import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import TreinamentoController from '../controllers/TreinamentoController';
import ReservaController from '../controllers/ReservaController';
import styles from '../styles/BuscarStyles';

const BuscarScreen = ({ navigation }) => {
  const { usuario } = useAuth(); 
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalidadeFiltro, setModalidadeFiltro] = useState('Todos');

  const filtros = ['Todos', 'Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarTreinosDisponiveis = async (modalidade) => {
    try {
      setLoading(true);
      const resultados = await TreinamentoController.listarTreinos(modalidade);
      setTreinos(resultados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTreinosDisponiveis(modalidadeFiltro);
  }, [modalidadeFiltro]);

  const handleReservar = async (idTreino, modalidade, nomeInstrutor) => {
    Alert.alert(
      'Confirmar Reserva',
      `Deseja reservar sua vaga para ${modalidade} com ${nomeInstrutor}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Confirmar', onPress: () => processarReservaLocal(idTreino) }
      ]
    );
  };

  const processarReservaLocal = async (idTreino) => {
    try {
      const resultado = await ReservaController.realizarReservaLocal(usuario.idEspecifico, idTreino);
      
      if (!resultado.sucesso && resultado.status === 'termos_pendentes') {
        Alert.alert(
          'Termos Pendentes', 
          'Antes de realizar sua primeira reserva, é obrigatório ler e aceitar os termos de participação da plataforma.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ler Termos', onPress: () => navigation.navigate('Termos') }
          ]
        );
        return;
      }

      Alert.alert(
        'Vaga Reservada! 🛒', 
        'O treino foi adicionado ao seu Carrinho. Vamos te levar para a área de finalização de pagamento.',
        [
          { 
            text: 'Ir para o Carrinho', 
            onPress: () => {
              carregarTreinosDisponiveis(modalidadeFiltro);
              navigation.navigate('Minhas Reservas'); 
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar reserva no banco de dados local.');
    }
  };

  const renderCardTreino = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.modalidade}>{item.modalidade}</Text>
        <Text style={[styles.badge, item.academia_tipo ? styles.badgeFiliada : styles.badgeIndep]}>
          {item.academia_tipo ? item.academia_tipo.toUpperCase() : 'PERSONAL'}
        </Text>
      </View>
      
      <Text style={styles.academiaNome}>🥋 {item.instrutor_nome}</Text>
      <Text style={styles.endereco}>📍 {item.endereco_treino || 'Local combinado'}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.datetime}>📅 {item.data} às {item.horario}</Text>
        <Text style={styles.duracao}>⏱️ {item.duracao_min} min</Text>
      </View>

      <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.vagas}>🔥 {item.vagas_disponiveis} vaga(s) restante(s)</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#16a34a' }}>R$ {item.preco.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.botaoReservar} 
          onPress={() => handleReservar(item.id, item.modalidade, item.instrutor_nome)}
        >
          <Text style={styles.textoBotao}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Treinos Disponíveis</Text>
      <Text style={styles.subtitulo}>Encontre uma academia ou Personal Trainer de TKD</Text>

      <View style={styles.filtrosRow}>
        {filtros.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.chipFiltro, modalidadeFiltro === item && styles.chipAtivo]}
            onPress={() => setModalidadeFiltro(item)}
          >
            <Text style={[styles.textChip, modalidadeFiltro === item && styles.textChipAtivo]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1F3864" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={treinos}
          renderItem={renderCardTreino}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum treino disponível para esta modalidade.</Text>
          }
        />
      )}
    </View>
  );
};

export default BuscarScreen;