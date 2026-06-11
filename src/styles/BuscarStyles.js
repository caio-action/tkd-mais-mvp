import { StyleSheet } from 'react-native';
import { CORES, FONTES, ESPACAMENTOS } from './tema';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo, paddingTop: ESPACAMENTOS.paddingTelaSuperior },
  titulo: { fontSize: 26, fontWeight: FONTES.pesoBold, color: CORES.primaria, paddingHorizontal: ESPACAMENTOS.medio },
  subtitulo: { fontSize: FONTES.subtitulo, color: '#595959', paddingHorizontal: ESPACAMENTOS.medio, marginBottom: ESPACAMENTOS.medio },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: ESPACAMENTOS.medio, marginBottom: 10, justifyContent: 'space-between' },
  chipFiltro: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1' },
  chipAtivo: { backgroundColor: CORES.primaria, borderColor: CORES.primaria },
  textChip: { color: '#475569', fontWeight: FONTES.pesoSemibold, fontSize: 13 },
  textChipAtivo: { color: '#ffffff' },
  listaContainer: { padding: ESPACAMENTOS.medio, paddingBottom: 30 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: ESPACAMENTOS.medio, marginBottom: ESPACAMENTOS.medio, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalidade: { fontSize: 18, fontWeight: FONTES.pesoBold, color: CORES.primaria },
  badge: { fontSize: 10, fontWeight: FONTES.pesoBold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  badgeFiliada: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgeIndep: { backgroundColor: '#fef3c7', color: '#92400e' },
  academiaNome: { fontSize: 15, fontWeight: FONTES.pesoSemibold, color: CORES.textoEscuro, marginBottom: 2 },
  endereco: { fontSize: 12, color: CORES.textoMutado, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  datetime: { fontSize: 13, fontWeight: '500', color: '#0f172a' },
  duracao: { fontSize: 13, color: CORES.textoMutado },
  descricao: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  vagas: { fontSize: 13, fontWeight: FONTES.pesoBold, color: '#e11d48' },
  botaoReservar: { backgroundColor: CORES.secundaria, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
  textoBotao: { color: '#ffffff', fontWeight: FONTES.pesoBold, fontSize: 14 },
  listaVazia: { textAlign: 'center', color: CORES.textoMutado, marginTop: 40, fontSize: 15 }
});