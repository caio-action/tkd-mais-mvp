import TreinamentoModel from '../models/TreinamentoModel';

const TreinamentoController = {
  async listarTreinos(modalidadeFiltro) {
    try {
      return await TreinamentoModel.buscarTodosDisponiveis(modalidadeFiltro);
    } catch (error) {
      console.error('[Controller Treino]:', error);
      throw error;
    }
  },

  async publicarAgendaParticular(professorId, professorNome, modalidade, data, horario, endereco, precoInput) {
    if (!horario.trim() || !data.trim() || !endereco.trim() || !precoInput.trim()) {
      throw new Error('Preencha todos os campos obrigatórios da agenda.');
    }

    try {
      const modalidadeComPrefixo = `Personal: ${modalidade}`;
      const precoFinal = parseFloat(precoInput.replace(',', '.'));
      const descricao = `Atendimento individualizado de alta performance com o Personal Trainer ${professorNome}.`;

      await TreinamentoModel.inserirAulaParticular(professorId, modalidadeComPrefixo, data, horario, endereco, precoFinal, descricao);
      return { modalidadeComPrefixo, precoFinal };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async publicarGradeAcademia(academiaId, modalidade, data, horario, vagas, endereco, precoInput) {
    if (!horario.trim() || !data.trim() || !endereco.trim() || !vagas.trim()) {
      throw new Error('Todos os campos da grade do Dojang são obrigatórios.');
    }
    try {
      const precoFinal = parseFloat(precoInput.replace(',', '.'));
      const descricao = `Atividade aberta organizada e hospedada diretamente em nossa sede parceira.`;
      
      return await TreinamentoModel.inserirAulaAcademia(academiaId, modalidade, data, horario, parseInt(vagas), endereco, precoFinal, descricao);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export default TreinamentoController;