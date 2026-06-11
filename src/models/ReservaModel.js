import db from '../database/database';

const ReservaModel = {
  async verificarTermosAtleta(atletaId) {
    const query = 'SELECT termos_aceitos FROM atletas WHERE id = ?';
    return await db.getFirstAsync(query, [atletaId]);
  },

  async criarReserva(atletaId, idTreino) {
    const query = 'INSERT INTO reservas (atleta_id, treinamento_id, status, data_reserva) VALUES (?, ?, ?, ?)';
    return await db.runAsync(query, [atletaId, idTreino, 'pendente_pagamento', new Date().toISOString()]);
  },

  async buscarReservasAtleta(atletaId) {
    const query = `
      SELECT 
        r.id as reserva_id, r.status, r.data_reserva, t.modalidade,
        t.data as data_treino, t.horario, t.preco,
        COALESCE(a.nome, 'Prof. ' || u.nome) as local_ou_professor
      FROM reservas r
      JOIN treinamentos t    ON r.treinamento_id = t.id
      LEFT JOIN academias a  ON t.academia_id = a.id
      LEFT JOIN professores p ON t.professor_id = p.id
      LEFT JOIN usuarios u   ON p.usuario_id = u.id
      WHERE r.atleta_id = ?
      ORDER BY r.id DESC;
    `;
    return await db.getAllAsync(query, [atletaId]);
  },

  async buscarReservasProfessor(professorId) {
    const query = `
      SELECT u.nome as aluno_nome, a.faixa, t.modalidade, t.data, t.horario, t.preco, r.status
      FROM reservas r
      JOIN atletas a       ON r.atleta_id = a.id
      JOIN usuarios u       ON a.usuario_id = u.id
      JOIN treinamentos t   ON r.treinamento_id = t.id
      WHERE t.professor_id = ?
      ORDER BY t.data ASC;
    `;
    return await db.getAllAsync(query, [professorId]);
  },

  async buscarReservasGeraisAcademia() {
    const query = `
      SELECT u.nome as atleta_nome, a.faixa, t.modalidade, t.data, t.horario, r.status
      FROM reservas r
      JOIN atletas a       ON r.atleta_id = a.id
      JOIN usuarios u       ON a.usuario_id = u.id
      JOIN treinamentos t   ON r.treinamento_id = t.id
      WHERE r.status = 'pago_confirmado'
      ORDER BY t.data ASC;
    `;
    return await db.getAllAsync(query);
  },

  async buscarTodasPendentes() {
    return await db.getAllAsync("SELECT * FROM reservas WHERE status = 'pendente_pagamento';");
  },

  async cancelarReservaExpirada(reservaId) {
    return await db.runAsync("UPDATE reservas SET status = 'cancelada_expirada' WHERE id = ?;", [reservaId]);
  },

  async devolverVagaTreino(treinamentoId) {
    return await db.runAsync("UPDATE treinamentos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?;", [treinamentoId]);
  },

  async atualizarStatusPago(reservaId) {
    return await db.runAsync("UPDATE reservas SET status = 'pago_confirmado' WHERE id = ?;", [reservaId]);
  },

  async buscarTreinosConfirmadosAtleta(atletaId) {
    const query = `
      SELECT 
        r.id as reserva_id, t.modalidade, t.data as data_treino, 
        t.horario, t.duracao_min, t.endereco_treino, 
        COALESCE(a.nome, 'Prof. ' || u.nome) as academia_nome, 
        a.endereco as academia_endereco_base
      FROM reservas r
      JOIN treinamentos t    ON r.treinamento_id = t.id
      LEFT JOIN academias a  ON t.academia_id = a.id
      LEFT JOIN professores p ON t.professor_id = p.id
      LEFT JOIN usuarios u   ON p.usuario_id = u.id
      WHERE r.status = 'pago_confirmado' AND r.atleta_id = ?
      ORDER BY t.data ASC, t.horario ASC;
    `;
    return await db.getAllAsync(query, [atletaId]);
  }
};

export default ReservaModel;