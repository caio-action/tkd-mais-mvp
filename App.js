// App.js
import React, { useEffect } from 'react';
import { inicializarBanco } from './src/database/database';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    const ligarBancoDeDados = async () => {
      try {
        await inicializarBanco();
      } catch (err) {
        console.error('Erro na inicialização do SQLite:', err);
      }
    };

    ligarBancoDeDados();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}