// src/navigation/AppNavigator.js
import React from 'react';
import MinhasReservasScreen from '../screens/MinhasReservasScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeScreen from '../screens/HomeScreen';
import BuscarScreen from '../screens/BuscarScreen'; // Importa a tela nova

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu inferior para quem já está autenticado no TKD+MAIS
// Menu inferior para quem já está autenticado no TKD+MAIS
const FluxoLogadoTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#1F3864',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIconStyle: { display: 'none' }
      }}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Buscar Treinos" component={BuscarScreen} />
      <Tab.Screen name="Minhas Reservas" component={MinhasReservasScreen} /> 
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1F3864" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        // Se logado, renderiza o menu de abas inferiores
        <Stack.Screen name="Dashboard" component={FluxoLogadoTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;