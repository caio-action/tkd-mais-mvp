import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// COLOQUE AS CHAVES { db } AQUI NO IMPORT PARA ENCONTRAR OS MÉTODOS DIRETOS:
import { db } from '../database/database';
import { firestore } from '../database/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Garantimos que ele começa estritamente limpo como null para forçar a rota de login
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarSessao = async () => {
      try {
        const userData = await AsyncStorage.getItem('@tkdtime:usuario');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser && parsedUser.id) {
            const sistemaUser = await db.getFirstAsync('SELECT tipo FROM usuarios WHERE id = ?', [parsedUser.id]);
            
            if (!sistemaUser) {
              await AsyncStorage.removeItem('@tkdtime:usuario');
              setUsuario(null);
            } else {
              if (parsedUser.tipo === 'professor') {
                const prof = await db.getFirstAsync('SELECT especialidade FROM professores WHERE usuario_id = ?', [parsedUser.id]);
                parsedUser.isHomologado = !!(prof && prof.especialidade && prof.especialidade.trim().toLowerCase() === 'personal trainer');
              } else if (parsedUser.tipo === 'equipe') {
                const aca = await db.getFirstAsync('SELECT id, ativa FROM academias WHERE usuario_id = ?', [parsedUser.id]);
                parsedUser.isHomologado = !!(aca && aca.ativa === 1);
                if (aca) parsedUser.idEspecifico = aca.id;
              }
              setUsuario(parsedUser);
            }
          } else {
            await AsyncStorage.removeItem('@tkdtime:usuario');
            setUsuario(null);
          }
        }
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
      let isHomologado = false; 

      if (user.tipo === 'atleta') {
        const atleta = await db.getFirstAsync('SELECT id FROM atletas WHERE usuario_id = ?', [user.id]);
        idEspecifico = atleta ? atleta.id : null;
      } else if (user.tipo === 'professor') {
        const prof = await db.getFirstAsync('SELECT id, especialidade FROM professores WHERE usuario_id = ?', [user.id]);
        if (prof) {
          idEspecifico = prof.id;
          isHomologado = !!(prof.especialidade && prof.especialidade.trim().toLowerCase() === 'personal trainer');
        }
      } else if (user.tipo === 'equipe') {
        const academia = await db.getFirstAsync('SELECT id, ativa FROM academias WHERE usuario_id = ?', [user.id]);
        if (academia) {
          idEspecifico = academia.id;
          isHomologado = !!(academia.ativa === 1); 
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
      } else if (dadosUsuario.tipo === 'professor') {
        const res = await db.runAsync('INSERT INTO professores (usuario_id, especialidade) VALUES (?, \'Pendente\');', [usuarioId]);
        idEspecifico = res.lastInsertRowId;
      }

      const userData = { id: usuarioId, nome: dadosUsuario.nome, email: dadosUsuario.email, tipo: dadosUsuario.tipo, idEspecifico, isHomologado: false };
      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(userData));
      setUsuario(userData);

      await addDoc(collection(firestore, "auditoria_cadastros"), {
        usuarioId: usuarioId,
        tipo: dadosUsuario.tipo,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err) {
      throw new Error('Este e-mail já está cadastrado.');
    }
  };

  const registrarHomologacao = async (idReg) => {
    try {
      const usuarioAtualizado = {
        ...usuario,
        idEspecifico: idReg,
        isHomologado: true
      };

      await AsyncStorage.setItem('@tkdtime:usuario', JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);

      await addDoc(collection(firestore, "auditoria_homologacoes"), {
        usuarioId: usuario.id,
        nomeEmpreendimento: usuario.nome,
        registroReferencia: idReg,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao registrar homologação no contexto:', error);
    }
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