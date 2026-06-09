// src/screens/CadastroScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CadastroScreen = ({ navigation }) => {
  const { cadastro } = useAuth();
  
  // Estados gerais
  const [tipo, setTipo] = useState('atleta'); // atleta, professor, ou equipe
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados específicos
  const [faixa, setFaixa] = useState(''); // Para atleta
  const [equipeOrigem, setEquipeOrigem] = useState(''); // Para atleta
  const [especialidade, setEspecialidade] = useState(''); // Para professor

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Nome, e-mail e senha são obrigatórios.');
      return;
    }

    const dados = { nome, email, senha, tipo };
    
    // Adiciona os dados específicos dependendo do tipo
    if (tipo === 'atleta') {
      dados.faixa = faixa;
      dados.equipeOrigem = equipeOrigem;
    } else if (tipo === 'professor') {
      dados.especialidade = especialidade;
    }

    await cadastro(dados);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Nova Conta</Text>
      <Text style={styles.subtitulo}>Junte-se à rede do TKD Time</Text>

      {/* SELETOR DE PERFIL */}
      <View style={styles.seletorContainer}>
        <TouchableOpacity 
          style={[styles.aba, tipo === 'atleta' && styles.abaAtiva]} 
          onPress={() => setTipo('atleta')}
        >
          <Text style={[styles.textoAba, tipo === 'atleta' && styles.textoAbaAtiva]}>Atleta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.aba, tipo === 'professor' && styles.abaAtiva]} 
          onPress={() => setTipo('professor')}
        >
          <Text style={[styles.textoAba, tipo === 'professor' && styles.textoAbaAtiva]}>Professor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.aba, tipo === 'equipe' && styles.abaAtiva]} 
          onPress={() => setTipo('equipe')}
        >
          <Text style={[styles.textoAba, tipo === 'equipe' && styles.textoAbaAtiva]}>Equipe</Text>
        </TouchableOpacity>
      </View>

      {/* CAMPOS GERAIS */}
      <TextInput style={styles.input} placeholder={tipo === 'equipe' ? "Nome da Academia/Equipe" : "Nome Completo"} value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      {/* CAMPOS ESPECÍFICOS: ATLETA */}
      {tipo === 'atleta' && (
        <>
          <TextInput style={styles.input} placeholder="Equipe de Origem" value={equipeOrigem} onChangeText={setEquipeOrigem} />
          <TextInput style={styles.input} placeholder="Sua Faixa (ex: Branca, Preta 1º Dan)" value={faixa} onChangeText={setFaixa} />
        </>
      )}

      {/* CAMPOS ESPECÍFICOS: PROFESSOR */}
      {tipo === 'professor' && (
        <TextInput 
          style={styles.input} 
          placeholder="Especialidade (ex: Kyorugi, Poomsae, Freestyle)" 
          value={especialidade} 
          onChangeText={setEspecialidade} 
        />
      )}

      <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
        <Text style={styles.textoBotao}>Criar Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
        <Text style={styles.link}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FA' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#1F3864', textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#595959', textAlign: 'center', marginBottom: 24 },
  
  seletorContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, marginBottom: 20, padding: 4 },
  aba: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  abaAtiva: { backgroundColor: '#1F3864' },
  textoAba: { color: '#64748b', fontWeight: 'bold' },
  textoAbaAtiva: { color: '#ffffff' },

  input: { borderWidth: 1, borderColor: '#CBD5E0', padding: 14, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' },
  botao: { backgroundColor: '#2E75B6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  link: { color: '#1F3864', fontWeight: 'bold' }
});

export default CadastroScreen;