// src/database/database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tkd_mais_v3.db');
export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- 1. TABELA DE USUÁRIOS BASE
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      tipo TEXT NOT NULL, -- 'atleta', 'professor', 'equipe'
      data_cadastro TEXT NOT NULL
    );

    -- 2. TABELA DE ATLETAS (EXTENSÃO)
    CREATE TABLE IF NOT EXISTS atletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      faixa TEXT,
      equipe_origem TEXT,
      termos_aceitos INTEGER DEFAULT 0,
      data_aceite TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- 3. TABELA DE PROFESSORES (EXTENSÃO)
    CREATE TABLE IF NOT EXISTS professores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      especialidade TEXT, -- Kyorugi, Poomsae, Freestyle
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- 4. TABELA DE ACADEMIAS / EQUIPES ANFITRIÃS
    CREATE TABLE IF NOT EXISTS academias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL, -- 'filiada' ou 'independente'
      endereco TEXT NOT NULL,
      telefone TEXT,
      latitude REAL,
      longitude REAL,
      ativa INTEGER DEFAULT 1
    );

    -- 5. TABELA DE TREINAMENTOS DISPONÍVEIS
    CREATE TABLE IF NOT EXISTS treinamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academia_id INTEGER NOT NULL,
      professor_id INTEGER NOT NULL,
      modalidade TEXT NOT NULL, -- 'Kyorugi', 'Poomsae', 'Freestyle'
      data TEXT NOT NULL, -- AAAA-MM-DD
      horario TEXT NOT NULL, -- HH:MM
      duracao_min INTEGER NOT NULL,
      capacidade INTEGER NOT NULL,
      vagas_disponiveis INTEGER NOT NULL,
      descricao TEXT,
      FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE,
      FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
    );

    -- 6. TABELA DE RESERVAS de treinos
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atleta_id INTEGER NOT NULL,
      treinamento_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmada', -- 'confirmada', 'cancelada', 'concluida'
      data_reserva TEXT NOT NULL,
      FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE CASCADE,
      FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id) ON DELETE CASCADE
    );
  `);

  await popularDadosIniciais();

  console.log('[BD] Banco de dados do TKD+MAIS inicializado e sincronizado.');
};

const popularDadosIniciais = async () => {
  try {
    const totalAcademias = await db.getFirstAsync('SELECT COUNT(*) as total FROM academias;');
    
    if (totalAcademias.total === 0) {
      console.log('[BD] Populando dados fictícios para teste do MVP...');
      
      await db.runAsync(`INSERT INTO academias (nome, tipo, endereco, telefone) VALUES 
        ('Dojang Liberdade - Centro de Treinamento', 'filiada', 'Rua dos Atletas, 450 - Bairro Central', '(11) 99999-1111'),
        ('Academia Dragões Unidos - Taekwondo Recreativo', 'independente', 'Av. das Faixas, 1200 - Setor Norte', '(11) 98888-2222');`);

      await db.runAsync(`INSERT INTO usuarios (nome, email, senha_hash, tipo, data_cadastro) VALUES 
        ('Mestre Kim', 'kim@tkd.com', '123', 'professor', '2026-01-01'),
        ('Professor Silva', 'silva@tkd.com', '123', 'professor', '2026-01-02'),
        ('Atleta Visitante', 'atleta@tkd.com', '123', 'atleta', '2026-06-01');`);
        
      await db.runAsync(`INSERT INTO professores (usuario_id, especialidade) VALUES 
        (1, 'Kyorugi e Freestyle'),
        (2, 'Poomsae e Defesa Pessoal');`);

      await db.runAsync(`INSERT INTO atletas (usuario_id, faixa, equipe_origem, termos_aceitos) VALUES 
        (3, 'Vermelha', 'Equipa Dragão', 1);`);

      await db.runAsync(`INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacidade, vagas_disponiveis, descricao) VALUES 
        (1, 1, 'Kyorugi', '2026-06-15', '19:30', 90, 15, 12, 'Treinamento focado em combate tático, contra-ataques de Bandal Chagi e simulação de rounds eletrónicos.'),
        (1, 2, 'Poomsae', '2026-06-16', '18:00', 60, 20, 20, 'Aprimoramento de Taegueks básicos e formas avançadas para exames de graduação.'),
        (2, 1, 'Freestyle', '2026-06-15', '20:00', 90, 10, 7, 'Treino dinâmico mesclando acrobacias, pontapés múltiplos com salto e sincronia musical.'),
        (2, 2, 'Kyorugi', '2026-06-17', '20:30', 90, 12, 12, 'Combate recreativo e condicionamento físico de alta intensidade voltado à manutenção do desporto.');`);
        
      console.log('[BD] Carga de dados iniciais injetada com sucesso.');
    }
  } catch (error) {
    console.error('[BD] Erro ao popular dados de teste:', error);
  }
};

export default db; 