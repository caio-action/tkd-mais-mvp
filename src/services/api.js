// src/services/api.js
import axios from 'axios';

// Configuração do cliente HTTP Axios
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // API pública de testes estável para o MVP
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const simularPagamentoRemoto = async (reservaId, valor) => {
  console.log(`[AXIOS] Disparando requisição POST para processar pagamento da reserva: ${reservaId}`);
  
  // O Axios faz a chamada de rede real aqui
  const resposta = await api.post('/posts', {
    reservaId: reservaId,
    statusGateway: 'PAID',
    valorProcessado: valor,
    dataTransacao: new Date().toISOString()
  });

  return resposta.data; // Retorna os dados que o servidor devolveu
};

export default api;