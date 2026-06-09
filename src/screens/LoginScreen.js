// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Importante: receba a prop 'navigation' aqui
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos Vazios', 'Preencha o e-mail e a senha.');
      return;
    }

    try {
      await login(email, senha);
    } catch (error) {
      // Exibe o erro "E-mail ou senha incorretos" disparado pelo SQLite
      Alert.alert('Falha na Autenticação ❌', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TKD+MAIS</Text>
      <Text style={styles.subtitulo}>Plataforma Colaborativa</Text>
      
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      
      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      {/* NOVO BOTÃO AQUI */}
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FA' },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#1F3864', textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#595959', textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#CBD5E0', padding: 14, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' },
  botao: { backgroundColor: '#1F3864', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Estilo do novo botão
  linkContainer: { marginTop: 20, alignItems: 'center' },
  link: { color: '#2E75B6', fontSize: 15, fontWeight: 'bold' }
});

export default LoginScreen;