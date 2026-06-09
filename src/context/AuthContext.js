// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../database/database'; // Importa nosso banco SQLite v3

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

  // LOGIN REAL NO SQLITE
  const login = async (email, senha) => {
    try {
      // Busca o usuário na tabela base
      const user = await db.getFirstAsync(
        'SELECT * FROM usuarios WHERE email = ? AND senha_hash = ?',
        [email, senha]
      );

      if (!user) {
        throw new Error('E-mail ou senha incorretos.');
      }

      // Descobre o ID específico da tabela filha (atleta ou professor)
      let idEspecifico = null;
      if (user.tipo === 'atleta') {
        const atleta = await db.getFirstAsync('SELECT id FROM atletas WHERE usuario_id = ?', [user.id]);
        idEspecifico = atleta ? atleta.id : null;
      } else if (user.tipo === 'professor') {
        const prof = await db.getFirstAsync('SELECT id FROM professores WHERE usuario_id = ?', [user.id]);
        idEspecifico = prof ? prof.id : null;
      }

      const userData = { 
        id: user.id, 
        nome: user.nome, 
        email: user.email, 
        tipo: user.tipo,
        idEspecifico: idEspecifico // Este ID vai substituir o número fixo 1 nas reservas!
      };

      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(userData));
      setUsuario(userData);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // CADASTRO REAL NO SQLITE
  const cadastro = async (dadosUsuario) => {
    try {
      // 1. Insere o usuário na tabela geral de credenciais
      const resultadoUser = await db.runAsync(
        'INSERT INTO usuarios (nome, email, senha_hash, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?);',
        [dadosUsuario.nome, dadosUsuario.email, dadosUsuario.senha, dadosUsuario.tipo, new Date().toISOString().split('T')[0]]
      );
      
      const usuarioId = resultadoUser.lastInsertRowId;
      let idEspecifico = null;

      // 2. Dependendo do perfil, insere os dados extras na tabela correta
      if (dadosUsuario.tipo === 'atleta') {
        const resAtleta = await db.runAsync(
          'INSERT INTO atletas (usuario_id, faixa, equipe_origem, termos_aceitos) VALUES (?, ?, ?, 0);',
          [usuarioId, dadosUsuario.faixa || 'Branca', dadosUsuario.equipeOrigem || 'Nenhuma']
        );
        idEspecifico = resAtleta.lastInsertRowId;
      } else if (dadosUsuario.tipo === 'professor') {
        const resProf = await db.runAsync(
          'INSERT INTO professores (usuario_id, especialidade) VALUES (?, ?);',
          [usuarioId, dadosUsuario.especialidade || 'Geral']
        );
        idEspecifico = resProf.lastInsertRowId;
      }

      const userData = {
        id: usuarioId,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        tipo: dadosUsuario.tipo,
        idEspecifico: idEspecifico
      };

      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(userData));
      setUsuario(userData);
      return true;
    } catch (err) {
      console.error(err);
      if (err.message.includes('UNIQUE')) {
        throw new Error('Este e-mail já está cadastrado no sistema.');
      }
      throw new Error('Falha ao salvar dados no banco local.');
    }
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