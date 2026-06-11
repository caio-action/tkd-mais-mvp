// src/database/database.js
import * as SQLite from 'expo-sqlite';

// Forçamos a abertura e exportamos a instância direta para não dar erro de "undefined"
export const db = SQLite.openDatabaseSync('tkdmais_local_v3.db');

export const inicializarBanco = async () => {
  try {
    // Tabela de Usuários Mestra
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        tipo TEXT NOT NULL,
        data_cadastro TEXT NOT NULL
      );
    `);

    // Tabela de Perfil de Atletas
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS atletas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        faixa TEXT NOT NULL,
        equipe_origem TEXT NOT NULL,
        termos_aceitos INTEGER DEFAULT 0,
        data_aceite TEXT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      );
    `);

    // Tabela de Perfil de Professores
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        especialidade TEXT DEFAULT 'Pendente',
        telefone TEXT DEFAULT '',
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      );
    `);

    // Tabela de Academias
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS academias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        cep TEXT NOT NULL,
        logradouro TEXT NOT NULL,
        numero TEXT NOT NULL,
        bairro TEXT NOT NULL,
        cidade TEXT NOT NULL,
        estado TEXT NOT NULL,
        telefone TEXT NOT NULL,
        ativa INTEGER DEFAULT 1,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      );
    `);

    // Tabela de Treinamentos
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS treinamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        academia_id INTEGER NULLABLE,
        professor_id INTEGER NULLABLE,
        modalidade TEXT NOT NULL,
        data TEXT NOT NULL,
        horario TEXT NOT NULL,
        duracao_min INTEGER NOT NULL,
        capacidade INTEGER NOT NULL,
        vagas_disponiveis INTEGER NOT NULL,
        endereco_treino TEXT NOT NULL,
        preco REAL NOT NULL,
        descricao TEXT,
        FOREIGN KEY (academia_id) REFERENCES academias (id),
        FOREIGN KEY (professor_id) REFERENCES professores (id)
      );
    `);

    // Tabela de Reservas
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atleta_id INTEGER NOT NULL,
        treinamento_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        data_reserva TEXT NOT NULL,
        FOREIGN KEY (atleta_id) REFERENCES atletas (id),
        FOREIGN KEY (treinamento_id) REFERENCES treinamentos (id)
      );
    `);

    // Tabela de Atividades
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS atividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        tipo_atividade TEXT NOT NULL,
        descricao TEXT NOT NULL,
        data_hora TEXT NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      );
    `);

    console.log('[BD] Banco SQLite inicializado com a versão unificada v3.');
  } catch (error) {
    console.error('[BD] Erro crítico nas tabelas SQLite:', error);
  }
};

// ATENÇÃO: Exportação padrão alterada para sanar o erro de "db.default"
export default db;