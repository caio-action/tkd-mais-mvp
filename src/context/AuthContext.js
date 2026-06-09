// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../database/database';

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
    try {
      const user = await db.getFirstAsync('SELECT * FROM usuarios WHERE email = ? AND senha_hash = ?', [email, senha]);
      if (!user) throw new Error('E-mail ou senha incorretos.');

      let idEspecifico = null;
      let isHomologado = false; // NOVO: Flag de controle para a equipe

      if (user.tipo === 'atleta') {
        const atleta = await db.getFirstAsync('SELECT id FROM atletas WHERE usuario_id = ?', [user.id]);
        idEspecifico = atleta ? atleta.id : null;
      } else if (user.tipo === 'professor') {
        const prof = await db.getFirstAsync('SELECT id FROM professores WHERE usuario_id = ?', [user.id]);
        idEspecifico = prof ? prof.id : null;
      } else if (user.tipo === 'equipe') {
        const academia = await db.getFirstAsync('SELECT id FROM academias WHERE usuario_id = ?', [user.id]);
        if (academia) {
          idEspecifico = academia.id;
          isHomologado = true; 
        }
      }

      const userData = { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, idEspecifico, isHomologado };
      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(userData));
      setUsuario(userData);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const cadastro = async (dadosUsuario) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO usuarios (nome, email, senha_hash, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?);',
        [dadosUsuario.nome, dadosUsuario.email, dadosUsuario.senha, dadosUsuario.tipo, new Date().toISOString().split('T')[0]]
      );
      
      const usuarioId = result.lastInsertRowId;
      let idEspecifico = null;

      if (dadosUsuario.tipo === 'atleta') {
        const res = await db.runAsync('INSERT INTO atletas (usuario_id, faixa, equipe_origem, termos_aceitos) VALUES (?, ?, ?, 0);', [usuarioId, dadosUsuario.faixa, dadosUsuario.equipeOrigem]);
        idEspecifico = res.lastInsertRowId;
      }

      const userData = { id: usuarioId, nome: dadosUsuario.nome, email: dadosUsuario.email, tipo: dadosUsuario.tipo, idEspecifico, isHomologado: false };
      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(userData));
      setUsuario(userData);
      return true;
    } catch (err) {
      throw new Error('Este e-mail já está cadastrado ou erro local.');
    }
  };

  const registrarHomologacao = async (idAcademia) => {
    const updatedUser = { ...usuario, idEspecifico: idAcademia, isHomologado: true };
    await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(updatedUser));
    setUsuario(updatedUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@tkdtime:usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cadastro, registrarHomologacao, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);