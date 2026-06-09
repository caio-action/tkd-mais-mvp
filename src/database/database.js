// src/database/database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tkd_mais_v5.db'); // Atualizado para v5

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      tipo TEXT NOT NULL, 
      data_cadastro TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS atletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      faixa TEXT,
      equipe_origem TEXT,
      termos_aceitos INTEGER DEFAULT 0,
      data_aceite TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS professores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      especialidade TEXT, 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER, 
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL, 
      endereco TEXT NOT NULL,
      telefone TEXT,
      ativa INTEGER DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS treinamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academia_id INTEGER NOT NULL,
      professor_id INTEGER, -- Mudado para opcional para treinos avulsos de equipes
      modalidade TEXT NOT NULL, 
      data TEXT NOT NULL, 
      horario TEXT NOT NULL, 
      duracao_min INTEGER NOT NULL,
      capacidade INTEGER NOT NULL,
      vagas_disponiveis INTEGER NOT NULL,
      endereco_treino TEXT, -- NOVO: guarda o endereço digitado no painel da equipe
      descricao TEXT,
      FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atleta_id INTEGER NOT NULL,
      treinamento_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente_pagamento', 
      data_reserva TEXT NOT NULL,
      FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE CASCADE,
      FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id) ON DELETE CASCADE
    );
  `);

  await popularDadosIniciais();
  console.log('[BD] Banco de dados v5 (Dinâmico) inicializado.');
};

const popularDadosIniciais = async () => {
  try {
    const totalAcademias = await db.getFirstAsync('SELECT COUNT(*) as total FROM academias;');
    if (totalAcademias.total === 0) {
      console.log('[BD] Populando as 2 Academias Base...');
      
      await db.runAsync(`INSERT INTO usuarios (nome, email, senha_hash, tipo, data_cadastro) VALUES 
        ('Mestre Kim', 'kim@tkd.com', '123', 'professor', '2026-01-01'),
        ('Mestre Silva', 'silva@tkd.com', '123', 'professor', '2026-01-02');`);
      
      await db.runAsync(`INSERT INTO professores (usuario_id, especialidade) VALUES (1, 'Kyorugi Competitivo'), (2, 'Poomsae Tradicional');`);

      await db.runAsync(`INSERT INTO academias (usuario_id, nome, tipo, endereco, telefone) VALUES 
        (null, 'Academia Liberdade (Sede Centro)', 'filiada', 'Av. da Liberdade, 450 - São Paulo', '(11) 99999-1111'),
        (null, 'Associação Dragões de Elite', 'associada', 'Rua das Palmeiras, 1200 - Bairro Alto', '(11) 98888-2222');`);

      await db.runAsync(`INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacidade, vagas_disponiveis, endereco_treino, descricao) VALUES 
        (1, 1, 'Kyorugi', '2026-06-20', '19:30', 90, 15, 12, 'Av. da Liberdade, 450 - São Paulo', 'Treino tático com foco em competições de alto rendimento.'),
        (2, 2, 'Poomsae', '2026-06-21', '18:00', 60, 20, 20, 'Rua das Palmeiras, 1200 - Bairro Alto', 'Correção postural e refinamento de Taegueks.');`);
    }
  } catch (error) {
    console.error('[BD] Erro ao popular dados:', error);
  }
};

export default db;