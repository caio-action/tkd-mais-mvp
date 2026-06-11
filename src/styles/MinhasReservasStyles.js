import { StyleSheet } from 'react-native';
import { CORES, FONTES, ESPACAMENTOS } from './tema';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo, paddingTop: ESPACAMENTOS.paddingTelaSuperior },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: ESPACAMENTOS.medio },
  titulo: { fontSize: FONTES.titulo, fontWeight: FONTES.pesoBold, color: CORES.primaria },
  btnAtualizar: { backgroundColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  txtBtn: { fontSize: 12, fontWeight: FONTES.pesoBold, color: CORES.primaria },
  subtitulo: { fontSize: 13, color: '#595959', paddingHorizontal: ESPACAMENTOS.medio, marginBottom: ESPACAMENTOS.medio },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: ESPACAMENTOS.medio, marginBottom: 14, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  modalidade: { fontSize: 17, fontWeight: FONTES.pesoBold, color: CORES.primaria },
  statusText: { fontSize: 12, fontWeight: FONTES.pesoBold },
  academia: { fontSize: 14, color: '#475569', marginBottom: 2 },
  data: { fontSize: 13, color: CORES.textoMutado, marginBottom: 12 },
  botaoPagar: { backgroundColor: CORES.sucesso, padding: ESPACAMENTOS.medio, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  textoBotaoPagar: { color: '#fff', fontWeight: FONTES.pesoBold, fontSize: 14 },
  vazio: { textAlign: 'center', color: CORES.textoMutado, marginTop: 40 }
});