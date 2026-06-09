// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import db from '../database/database';

const HomeScreen = ({ navigation }) => {
  const { usuario, logout } = useAuth();
  const [treinosConfirmados, setTreinosConfirmados] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarTreinosPagos = async () => {
    try {
      setLoading(true);
      
      const query = `
        SELECT r.id as reserva_id, t.modalidade, t.data as data_treino, t.horario, t.duracao_min, a.nome as academia_nome, a.endereco as academia_endereco
        FROM reservas r
        JOIN treinamentos t ON r.treinamento_id = t.id
        JOIN academias a     ON t.academia_id = a.id
        WHERE r.status = 'pago_confirmado'
        ORDER BY t.data ASC, t.horario ASC;
      `;
      
      const resultados = await db.getAllAsync(query);
      setTreinosConfirmados(resultados);
    } catch (error) {
      console.error('Erro ao carregar a home do TKD+MAIS:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTreinosPagos();
    }, [])
  );

  const renderCardConfirmado = ({ item }) => (
    <View style={styles.cardConfirmado}>
      <View style={styles.cardHeader}>
        <Text style={styles.modalidadeText}>🥋 {item.modalidade}</Text>
        <View style={styles.badgePago}>
          <Text style={styles.badgePagoText}>CONFIRMADO</Text>
        </View>
      </View>
      
      <Text style={styles.academiaText}>🏟️ {item.academia_nome}</Text>
      <Text style={styles.enderecoText}>📍 {item.academia_endereco}</Text>
      
      <View style={styles.timeRow}>
        <Text style={styles.dateTimeText}>📅 {item.data_treino} às {item.horario}</Text>
        <Text style={styles.duracaoText}>⏱️ {item.duracao_min} min</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.saudacao}>Olá, {usuario?.nome}!</Text>
        <Text style={styles.subtituloBanner}>Sua credencial eletrônica está ativa</Text>
        
        <View style={styles.contadorContainer}>
          <Text style={styles.numeroContador}>{treinosConfirmados.length}</Text>
          <Text style={styles.textoContador}>Treinos Agendados para esta semana</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.tituloRow}>
          <Text style={styles.secaoTitulo}>Seus Próximos Treinos</Text>
          <TouchableOpacity style={styles.btnSync} onPress={carregarTreinosPagos}>
            <Text style={styles.btnSyncTxt}>🔄 Sincronizar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1F3864" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={treinosConfirmados}
            renderItem={renderCardConfirmado}
            keyExtractor={(item) => item.reserva_id.toString()}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <View style={styles.containerVazio}>
                <Text style={styles.infoVazio}>Nenhum treinamento confirmado no momento.</Text>
                <Text style={styles.subInfoVazio}>Vá na aba "Buscar Treinos" e finalize o pagamento no seu carrinho antes que o tempo expire!</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity style={styles.botaoSair} onPress={logout}>
          <Text style={styles.textoBotaoSair}>Sair do TKD+MAIS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBanner: { backgroundColor: '#1F3864', padding: 24, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  saudacao: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  subtituloBanner: { color: '#BDD7EE', fontSize: 13, marginTop: 4, marginBottom: 16 },
  
  contadorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10 },
  numeroContador: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginRight: 12 },
  textoContador: { color: '#fff', fontSize: 13, fontWeight: '500' },

  content: { flex: 1, padding: 16 },
  tituloRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1F3864' },
  btnSync: { padding: 4 },
  btnSyncTxt: { fontSize: 12, color: '#2E75B6', fontWeight: 'bold' },
  
  lista: { paddingBottom: 20 },
  cardConfirmado: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalidadeText: { fontSize: 16, fontWeight: 'bold', color: '#1F3864' },
  badgePago: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgePagoText: { color: '#16a34a', fontSize: 10, fontWeight: 'bold' },
  academiaText: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 2 },
  enderecoText: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  dateTimeText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  duracaoText: { fontSize: 13, color: '#64748b' },

  containerVazio: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  infoVazio: { fontSize: 15, fontWeight: 'bold', color: '#475569', textAlign: 'center', marginBottom: 6 },
  subInfoVazio: { fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
  
  botaoSair: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 'auto', marginBottom: 10 },
  textoBotaoSair: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default HomeScreen;