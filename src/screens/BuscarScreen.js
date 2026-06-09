// src/screens/BuscarScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import db from '../database/database';

const BuscarScreen = () => {
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalidadeFiltro, setModalidadeFiltro] = useState('Todos');

  // Categorias de filtros exigidas pelo escopo técnico
  const filtros = ['Todos', 'Kyorugi', 'Poomsae', 'Freestyle'];

  const carregarTreinos = async (modalidade) => {
    try {
      setLoading(true);
      let query = `
        SELECT t.*, a.nome as academia_nome, a.tipo as academia_tipo, a.endereco as academia_endereco
        FROM treinamentos t
        JOIN academias a ON t.academia_id = a.id
        WHERE t.vagas_disponiveis > 0
      `;
      
      let params = [];
      if (modalidade !== 'Todos') {
        query += ' AND t.modalidade = ?';
        params.push(modalidade);
      }

      query += ' ORDER BY t.data ASC, t.horario ASC';

      const resultados = await db.getAllAsync(query, params);
      setTreinos(resultados);
    } catch (error) {
      console.error('Erro ao buscar treinamentos do SQLite:', error);
      Alert.alert('Erro', 'Não foi possível carregar a grade de treinamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTreinos(modalidadeFiltro);
  }, [modalidadeFiltro]);

  const handleReservar = (idTreino, modalidade, academia) => {
    Alert.alert(
      'Confirmar Reserva',
      `Deseja reservar sua vaga para o treino de ${modalidade} na academia ${academia}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Confirmar', onPress: () => processarReservaLocal(idTreino) }
      ]
    );
  };

 const processarReservaLocal = async (idTreino) => {
    try {
      // 1. Deduz uma vaga temporariamente do treinamento selecionado no SQLite
      await db.runAsync('UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?', [idTreino]);
      
      // 2. Registra a linha na tabela de reservas com status PENDENTE e o TIMESTAMP completo atual
      await db.runAsync(
        'INSERT INTO reservas (atleta_id, treinamento_id, status, data_reserva) VALUES (?, ?, ?, ?)',
        [1, idTreino, 'pendente_pagamento', new Date().toISOString()] // Armazena data e hora exatas
      );

      Alert.alert(
        'Vaga Reservada! 🛒', 
        'O treino foi adicionado ao seu Carrinho. Você tem 5 minutos para realizar o pagamento na aba "Minhas Reservas", ou sua vaga será liberada.'
      );
      
      carregarTreinos(modalidadeFiltro);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao registrar reserva no banco de dados local.');
    }
  };

  const renderCardTreino = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.modalidade}>{item.modalidade}</Text>
        <Text style={[styles.badge, item.academia_tipo === 'filiada' ? styles.badgeFiliada : styles.badgeIndep]}>
          {item.academia_tipo.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.academiaNome}>🏟️ {item.academia_nome}</Text>
      <Text style={styles.endereco}>📍 {item.academia_endereco}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.datetime}>📅 {item.data} às {item.horario}</Text>
        <Text style={styles.duracao}>⏱️ {item.duracao_min} min</Text>
      </View>

      <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.vagas}>🔥 {item.vagas_disponiveis} vagas restantes</Text>
        <TouchableOpacity 
          style={styles.botaoReservar} 
          onPress={() => handleReservar(item.id, item.modalidade, item.academia_nome)}
        >
          <Text style={styles.textoBotao}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Treinos Disponíveis</Text>
      <Text style={styles.subtitulo}>Encontre um Dojang parceiro no seu horário</Text>

      {/* BARRA HORIZONTAL DE FILTROS */}
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

      {/* EXIBIÇÃO DE LOADING OU DA LISTA DE TREINOS */}
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