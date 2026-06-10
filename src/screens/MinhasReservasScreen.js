import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import db from '../database/database';
import { simularPagamentoRemoto } from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const MinhasReservasScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const checarEFiltrarReservas = async () => {
    try {
      setLoading(true);
      
      const pendentes = await db.getAllAsync("SELECT * FROM reservas WHERE status = 'pendente_pagamento';");
      const agora = new Date();

      for (const res of pendentes) {
        const dataCriacao = new Date(res.data_reserva);
       
        if (isNaN(dataCriacao.getTime())) {
          await db.runAsync("UPDATE reservas SET status = 'cancelada_expirada' WHERE id = ?;", [res.id]);
          await db.runAsync("UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?;", [res.treinamento_id]);
          console.log(`[BD] Reserva antiga ${res.id} limpa e cancelada por formato incompatível.`);
        } else {
          const diferencaMinutos = (agora - dataCriacao) / (1000 * 60);
          
          if (diferencaMinutos > 5) {
            await db.runAsync("UPDATE reservas SET status = 'cancelada_expirada' WHERE id = ?;", [res.id]);
            await db.runAsync("UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?;", [res.treinamento_id]);
            console.log(`[BD] Reserva ${res.id} cancelada automaticamente por estourar o tempo de 5min.`);
          }
        }
      }

      const queryGeral = `
        SELECT 
          r.id as reserva_id,
          r.status,
          r.data_reserva,
          t.modalidade,
          t.data as data_treino,
          t.horario,
          t.preco,
          COALESCE(a.nome, 'Prof. ' || u.nome) as local_ou_professor
        FROM reservas r
        JOIN treinamentos t    ON r.treinamento_id = t.id
        LEFT JOIN academias a  ON t.academia_id = a.id
        LEFT JOIN professores p ON t.professor_id = p.id
        LEFT JOIN usuarios u   ON p.usuario_id = u.id
        WHERE r.atleta_id = ?
        ORDER BY r.id DESC;
      `;
      const listaAtualizada = await db.getAllAsync(queryGeral, [usuario.idEspecifico]);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864' },
  btnAtualizar: { backgroundColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  txtBtn: { fontSize: 12, fontWeight: 'bold', color: '#1F3864' },
  subtitulo: { fontSize: 13, color: '#595959', paddingHorizontal: 16, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  modalidade: { fontSize: 17, fontWeight: 'bold', color: '#1F3864' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  academia: { fontSize: 14, color: '#475569', marginBottom: 2 },
  data: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  botaoPagar: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  textoBotaoPagar: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vazio: { textAlign: 'center', color: '#64748b', marginTop: 40 }
});

export default MinhasReservasScreen;