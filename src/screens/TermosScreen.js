// src/screens/TermosScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import db from '../database/database';

const TermosScreen = ({ navigation }) => {
  const [aceito, setAceito] = useState(false);

  const handleAceitar = async () => {
    if (!aceito) {
      Alert.alert('Atenção', 'Você precisa marcar a caixa de seleção para concordar com os termos.');
      return;
    }

    try {
      // Atualiza no banco de dados que o atleta (ID 1 do nosso mock) aceitou os termos
      await db.runAsync("UPDATE atletas SET termos_aceitos = 1, data_aceite = ? WHERE id = 1;", [new Date().toISOString()]);
      Alert.alert('Sucesso', 'Termos aceitos! Você já pode realizar suas reservas.');
      navigation.goBack(); // Volta para a tela de busca
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível registrar o aceite.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Termos de Participação</Text>
      <Text style={styles.subtitulo}>Leia atentamente antes de prosseguir</Text>

      <ScrollView style={styles.caixaTermos}>
        <Text style={styles.textoTermos}>
          1. O presente termo regula a participação na Plataforma TKD+MAIS.{"\n\n"}
          2. A participação tem caráter exclusivamente complementar e não implica transferência de vínculo esportivo do atleta com sua equipe de origem.{"\n\n"}
          3. O atleta compromete-se a respeitar as instalações, professores e regras de convivência do dojang anfitrião.{"\n\n"}
          4. O cancelamento gratuito só é permitido antes do prazo de 5 minutos do carrinho ou conforme regras específicas.{"\n\n"}
          5. O atleta declara estar em plenas condições físicas para a prática de Taekwondo.
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAceito(!aceito)}>
        <View style={[styles.checkbox, aceito && styles.checkboxAtivo]}>
          {aceito && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.textoCheckbox}>Li e concordo com os termos de participação e regras de conduta do TKD+MAIS.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, !aceito && styles.botaoDesativado]} onPress={handleAceitar}>
        <Text style={styles.textoBotao}>Confirmar e Aceitar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoBotaoCancelar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 24, paddingTop: 60 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1F3864', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  caixaTermos: { backgroundColor: '#fff', borderRadius: 8, padding: 16, flex: 1, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  textoTermos: { fontSize: 14, color: '#334155', lineHeight: 22 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingRight: 20 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#1F3864', borderRadius: 4, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxAtivo: { backgroundColor: '#1F3864' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textoCheckbox: { fontSize: 13, color: '#475569', flex: 1 },
  botao: { backgroundColor: '#1F3864', padding: 16, borderRadius: 8, alignItems: 'center' },
  botaoDesativado: { backgroundColor: '#94a3b8' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { padding: 16, alignItems: 'center', marginTop: 8 },
  textoBotaoCancelar: { color: '#64748b', fontSize: 14, fontWeight: 'bold' }
});

export default TermosScreen;