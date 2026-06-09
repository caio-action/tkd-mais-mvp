// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarSessao = async () => {
      try {
        const userData = await AsyncStorage.getItem('@tkdtime:usuario');
        if (userData) setUsuario(JSON.parse(userData));
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      } finally {
        setLoading(false);
      }
    };
    carregarSessao();
  }, []);

  const login = async (email, senha) => {
    // Mock de login para o MVP
    const mockUser = { id: 1, nome: 'Usuário TKD', email, tipo: 'atleta' };
    await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(mockUser));
    setUsuario(mockUser);
  };

  // NOVA FUNÇÃO: Cadastro
  const cadastro = async (dadosUsuario) => {
    // Aqui no futuro enviaremos os dados para a API e pro SQLite.
    // Por enquanto, simulamos a criação e já logamos o usuário.
    const newUser = { 
      id: Date.now(), 
      nome: dadosUsuario.nome, 
      email: dadosUsuario.email, 
      tipo: dadosUsuario.tipo 
    };
    await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(newUser));
    setUsuario(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@tkdtime:usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cadastro, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);