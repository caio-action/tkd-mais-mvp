import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeScreen from '../screens/HomeScreen';
import BuscarScreen from '../screens/BuscarScreen';
import MinhasReservasScreen from '../screens/MinhasReservasScreen';
import TermosScreen from '../screens/TermosScreen';
import PagamentoScreen from '../screens/PagamentoScreen';

import TermosAcademiaScreen from '../screens/TermosAcademiaScreen';
import PainelAcademiaScreen from '../screens/PainelAcademiaScreen';

import TermosProfessorScreen from '../screens/TermosProfessorScreen';
import PainelProfessorScreen from '../screens/PainelProfessorScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        usuario.tipo === 'equipe' ? (
          <>
            {!usuario.isHomologado && <Stack.Screen name="TermosAcademia" component={TermosAcademiaScreen} />}
            <Stack.Screen name="DashboardAcademia" component={PainelAcademiaScreen} />
          </>
        ) : usuario.tipo === 'professor' ? (
          <>
            {!usuario.isHomologado && <Stack.Screen name="TermosProfessor" component={TermosProfessorScreen} />}
            <Stack.Screen name="DashboardProfessor" component={PainelProfessorScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={FluxoLogadoTabs} />
            <Stack.Screen name="Termos" component={TermosScreen} />
            <Stack.Screen name="Pagamento" component={PagamentoScreen} />
          </>
        )
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