// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext'; 
import AppNavigator from './src/navigation/AppNavigator';  
import { initDatabase } from './src/database/database';   

export default function App() {
  useEffect(() => {
    initDatabase().catch(err => console.error('Erro ao iniciar BD:', err));
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