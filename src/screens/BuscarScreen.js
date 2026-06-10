import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import db from '../database/database'; 

const BuscarScreen = ({ navigation }) => {
  const { usuario } = useAuth(); 
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalidadeFiltro, setModalidadeFiltro] = useState('Todos');

  const filtros = ['Todos', 'Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarTreinosDisponiveis = async (modalidade) => {
    try {
      setLoading(true);

      // CORREÇÃO: Buscando também o nome do professor associado via LEFT JOIN na tabela usuarios
      let query = `
        SELECT 
          t.id, 
          t.modalidade, 
          t.data, 
          t.horario, 
          t.duracao_min,
          t.vagas_disponiveis, 
          t.preco,
          t.endereco_treino,
          t.descricao,
          a.tipo as academia_tipo,
          COALESCE(a.nome, 'Prof. ' || u.nome) as instrutor_nome
        FROM treinamentos t
        LEFT JOIN academias a ON t.academia_id = a.id
        LEFT JOIN professores p ON t.professor_id = p.id
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        WHERE t.vagas_disponiveis > 0
      `;

      const params = [];
      if (modalidade !== 'Todos') {
        query += ` AND (t.modalidade = ? OR t.modalidade = ?)`;
        params.push(modalidade);
        params.push(`Personal: ${modalidade}`);
      }

      query += ' ORDER BY t.data ASC, t.horario ASC;';

      const resultados = await db.getAllAsync(query, params);
      setTreinos(resultados);
    } catch (error) {
      console.error('Erro ao buscar treinos na rede:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTreinosDisponiveis(modalidadeFiltro);
  }, [modalidadeFiltro]);

  const handleReservar = async (idTreino, modalidade, nomeInstrutor) => {
    try {
      const atleta = await db.getFirstAsync('SELECT termos_aceitos FROM atletas WHERE id = ?', [usuario.idEspecifico]);
      
      if (!atleta || atleta.termos_aceitos === 0) {
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
    } catch (error) {
      console.error('Erro ao verificar termos do atleta:', error);
      return;
    }

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
      await db.runAsync('UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?', [idTreino]);
      
      await db.runAsync(
        'INSERT INTO reservas (atleta_id, treinamento_id, status, data_reserva) VALUES (?, ?, ?, ?)',
        [usuario.idEspecifico, idTreino, 'pendente_pagamento', new Date().toISOString()]
      );

      Alert.alert(
        'Vaga Reservada! 🛒', 
        'O treino foi adicionado ao seu Carrinho. Vamos te levar para a área de finalização de pagamento.',
        [
          { 
            text: 'Ir para o Carrinho', 
            onPress: () => {
              // Recarrega os treinos da busca (para sumir o que zerou vaga)
              carregarTreinosDisponiveis(modalidadeFiltro);
              // Redireciona o Atleta diretamente para a Aba de Reservas/Carrinho
              navigation.navigate('Minhas Reservas'); 
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 50 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1F3864', paddingHorizontal: 16 },
  subtitulo: { fontSize: 14, color: '#595959', paddingHorizontal: 16, marginBottom: 16 },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, justifyContent: 'space-between' },
  chipFiltro: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1' },
  chipAtivo: { backgroundColor: '#1F3864', borderColor: '#1F3864' },
  textChip: { color: '#475569', fontWeight: '600', fontSize: 13 },
  textChipAtivo: { color: '#ffffff' },
  listaContainer: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalidade: { fontSize: 18, fontWeight: 'bold', color: '#1F3864' },
  badge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  badgeFiliada: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgeIndep: { backgroundColor: '#fef3c7', color: '#92400e' },
  academiaNome: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 2 },
  endereco: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  datetime: { fontSize: 13, fontWeight: '500', color: '#0f172a' },
  duracao: { fontSize: 13, color: '#64748b' },
  descricao: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  vagas: { fontSize: 13, fontWeight: 'bold', color: '#e11d48' },
  botaoReservar: { backgroundColor: '#2E75B6', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
  textoBotao: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  listaVazia: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 }
});

export default BuscarScreen;