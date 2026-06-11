import { db } from '../database/database'; // <-- ADICIONE ESSA LINHA AQUI NO TOPO!
import ReservaModel from '../models/ReservaModel';
import TreinamentoModel from '../models/TreinamentoModel';

const ReservaController = {
  async realizarReservaLocal(atletaId, idTreino) {
    try {
      const atleta = await ReservaModel.verificarTermosAtleta(atletaId);
      if (!atleta || atleta.termos_aceitos === 0) {
        return { sucesso: false, status: 'termos_pendentes' };
      }

      await TreinamentoModel.diminuirVaga(idTreino);
      await ReservaModel.criarReserva(atletaId, idTreino);
      return { sucesso: true };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async gerenciarFiltroECancelamentos(atletaId) {
    try {
      const pendentes = await ReservaModel.buscarTodasPendentes();
      const agora = new Date();

      for (const res of pendentes) {
        const dataCriacao = new Date(res.data_reserva);
        if (isNaN(dataCriacao.getTime())) {
          await ReservaModel.cancelarReservaExpirada(res.id);
          await ReservaModel.devolverVagaTreino(res.treinamento_id);
        } else {
          const diferencaMinutos = (agora - dataCriacao) / (1000 * 60);
          if (diferencaMinutos > 5) {
            await ReservaModel.cancelarReservaExpirada(res.id);
            await ReservaModel.devolverVagaTreino(res.treinamento_id);
          }
        }
      }

      return await ReservaModel.buscarReservasAtleta(atletaId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async obterAlunosEFinanceiro(professorId) {
    try {
      const resposta = await ReservaModel.buscarReservasProfessor(professorId);
      let totalBruto = 0;
      
      resposta.forEach(item => {
        if (item.status === 'pago_confirmado') {
          totalBruto += item.preco;
        }
      });
      
      const totalTaxa = totalBruto * 0.35; 
      const totalLiquido = totalBruto - totalTaxa;

      return {
        listaAlunos: resposta,
        financeiro: { bruto: totalBruto, taxa: totalTaxa, liquido: totalLiquido }
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

async obterFaturamentoAcademia(academiaId) {
  try {
    const queryAtletas = `
      SELECT 
        u.nome as atleta_nome,
        at.faixa,
        t.modalidade,
        strftime('%d/%m/%Y', t.data) as data,
        t.horario
      FROM reservas r
      JOIN atletas at       ON r.atleta_id = at.id
      JOIN usuarios u       ON at.usuario_id = u.id
      JOIN treinamentos t   ON r.treinamento_id = t.id
      WHERE r.status = 'pago_confirmado' AND t.academia_id = ?;
    `;
    
    const atletasInscritos = await db.getAllAsync(queryAtletas, [academiaId]);

    const queryFinanceiro = `
      SELECT COALESCE(SUM(t.preco), 0) as total_bruto
      FROM reservas r
      JOIN treinamentos t ON r.treinamento_id = t.id
      WHERE r.status = 'pago_confirmado' AND t.academia_id = ?;
    `;
    
    const resultadoFin = await db.getFirstAsync(queryFinanceiro, [academiaId]);
    const bruto = resultadoFin ? resultadoFin.total_bruto : 0;
    
    const taxa = bruto * 0.20;
    const liquido = bruto - taxa;

    return {
      atletasInscritos,
      financeiro: { bruto, taxa, liquido }
    };
  } catch (error) {
    console.error("Erro no obterFaturamentoAcademia:", error);
    throw error;
  }
},

  async quitarReserva(reservaId) {
    try {
      await ReservaModel.atualizarStatusPago(reservaId);
      return { sucesso: true };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async listarConfirmadosHome(atletaId) {
    try {
      return await ReservaModel.buscarTreinosConfirmadosAtleta(atletaId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

ReservaModel.buscarTracksGeraisAcademia = ReservaModel.buscarReservasGeraisAcademia;

export default ReservaController;