import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.tkdmais.com.br/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  if (config.url === '/checkout/pagamento') {
    console.log('[API REST] Simulando validação de antifraude e CPF junto ao Gateway externo...');
  }
  return config;
}, (error) => {
    return Promise.reject(error);
});

export const ejecutarPagamentoRemoto = async (reservaId, cpfComprador, formaPagamento, valor) => {
  try {
    return {
      status: 200,
      data: {
        sucesso: true,
        transacaoId: `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
        mensagem: 'Pagamento aprovado e registrado na rede de adquirentes.'
      }
    };
  } catch (error) {
    throw new Error('Falha de comunicação com o gateway externo.');
  }
};

export default api;