import db from '../database/database';

const AcademiaModel = {
  async cadastrarHomologacaoLocal(usuarioId, nome, tipo, cep, logradouro, numero, bairro, cidade, estado, telefone) {
    const query = `
      INSERT INTO academias (usuario_id, nome, tipo, cep, logradouro, numero, bairro, city_name, estado, telefone, ativa) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
    `.replace('city_name', 'cidade'); // Tratamento seguro de mapeamento de string
    
    return await db.runAsync(query, [usuarioId, nome, tipo, cep, logradouro, numero, bairro, cidade, estado, telefone]);
  },

  async registrarLogAtividade(usuarioId, tipo, descricao) {
    const query = `
      INSERT INTO atividades (usuario_id, tipo_atividade, descricao, data_hora)
      VALUES (?, ?, ?, ?);
    `;
    const dataHora = new Date().toLocaleString('pt-BR');
    return await db.runAsync(query, [usuarioId, tipo, descricao, dataHora]);
  }
};

export default AcademiaModel;