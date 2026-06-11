import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ReservaController from '../controllers/ReservaController';
import styles from '../styles/MinhasReservasStyles';

const MinhasReservasScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const checarEFiltrarReservas = async () => {
    try {
      setLoading(true);
      const listaAtualizada = await ReservaController.gerenciarFiltroECancelamentos(usuario.idEspecifico);
      setReservas(listaAtualizada);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checarEFiltrarReservas();
  }, []);

  const handleCheckoutCarrinho = (reservaId, precoTreino) => {
    navigation.navigate('Pagamento', { 
      reservaId: reservaId,
      valorTotal: precoTreino 
    });
  };

  const getStatusEstilo = (status) => {
    switch(status) {
      case 'pago_confirmado': return { texto: 'Pago & Confirmado', cor: '#16a34a' };
      case 'cancelada_expirada': return { texto: 'Cancelada: Tempo Excedido', cor: '#dc2626' };
      default: return { texto: 'Aguardando Pagamento (Max 5min)', cor: '#d97706' };
    }
  };

  const renderItemReserva = ({ item }) => {
    const infoStatus = getStatusEstilo(item.status);
    
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.modalidade}>{item.modalidade}</Text>
          <Text style={[styles.statusText, { color: infoStatus.cor }]}>{infoStatus.texto}</Text>
        </View>
        <Text style={styles.academia}>🏟️ {item.local_ou_professor}</Text>
        <Text style={styles.data}>📅 {item.data_treino} às {item.horario}</Text>

        {item.status === 'pendente_pagamento' && (
          <TouchableOpacity 
            style={styles.botaoPagar} 
            onPress={() => handleCheckoutCarrinho(item.reserva_id, item.preco)}
          >
            <Text style={styles.textoBotaoPagar}>🛒 Finalizar Compra (R$ {item.preco ? item.preco.toFixed(2) : '30.00'})</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>Minhas Reservas</Text>
        <TouchableOpacity style={styles.btnAtualizar} onPress={checarEFiltrarReservas}>
          <Text style={styles.txtBtn}>🔄 Atualizar Lista</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitulo}>Acompanhe seus agendamentos e compras</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1F3864" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={reservas}
          renderItem={renderItemReserva}
          keyExtractor={(item) => item.reserva_id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.vazio}>Você não tem nenhuma atividade no seu histórico.</Text>}
        />
      )}
    </View>
  );
};

export default MinhasReservasScreen;