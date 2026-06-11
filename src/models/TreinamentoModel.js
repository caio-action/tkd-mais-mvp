import db from '../database/database';

const TreinamentoModel = {
  async buscarTodosDisponiveis(modalidade) {
    let query = `
      SELECT 
        t.id, t.modalidade, 
        strftime('%d/%m/%Y', t.data) as data, 
        t.horario, t.duracao_min,
        t.vagas_disponiveis, t.preco, t.endereco_treino, t.descricao,
        a.tipo as academia_tipo,
        COALESCE(a.nome, 'Prof. ' || u.nome) as instrutor_nome
      FROM treinamentos t
      LEFT JOIN academias a ON t.academia_id = a.id
      LEFT JOIN professores p ON t.professor_id = p.id
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE t.vagas_disponiveis > 0
    `;

    const params = [];
    if (modalidade && modalidade !== 'Todos') {
      query += ` AND (t.modalidade = ? OR t.modalidade = ?)`;
      params.push(modalidade);
      params.push(`Personal: ${modalidade}`);
    }

    query += ' ORDER BY t.data ASC, t.horario ASC;';
    return await db.getAllAsync(query, params);
  },

  async inserirAulaParticular(professorId, modalidade, data, horario, endereco, preco, descricao) {
    const query = `
      INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacity_vaga, vagas_disponiveis, endereco_treino, preco, descricao) 
      VALUES (null, ?, ?, ?, ?, 60, 1, 1, ?, ?, ?);
    `.replace('capacity_vaga', 'capacidade');
    return await db.runAsync(query, [professorId, modalidade, data, horario, endereco, preco, descricao]);
  },

  async inserirAulaAcademia(academiaId, modalidade, data, horario, vagas, endereco, preco, descricao) {
    const query = `
      INSERT INTO treinamentos (academia_id, professor_id, modalidade, data, horario, duracao_min, capacity_vaga, vagas_disponiveis, endereco_treino, preco, descricao) 
      VALUES (?, null, ?, ?, ?, 90, ?, ?, ?, ?, ?);
    `.replace('capacity_vaga', 'capacidade');
    return await db.runAsync(query, [academiaId, modalidade, data, horario, vagas, vagas, endereco, preco, descricao]);
  },

  async diminuirVaga(idTreino) {
    return await db.runAsync('UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?', [idTreino]);
  }
};

export default TreinamentoModel;