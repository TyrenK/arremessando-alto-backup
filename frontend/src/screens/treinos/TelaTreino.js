import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import GradientWrapper from '../../components/GradientWrapper';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import api from '../../config/api';
import CORES from '../../styles/cores';

export default function TelaTreino({ route }) {
  const { semana } = route.params;

  const [aulas, setAulas] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAulas();
  }, []);

  async function carregarAulas() {
    setCarregando(true);
    try {
      const [resAulas, resProgresso] = await Promise.all([
        api.get(`/aulas?semana=${semana}`),
        api.get('/aulas/progresso'),
      ]);
      setAulas(resAulas.data);
      setProgresso(resProgresso.data);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar as aulas.');
    } finally {
      setCarregando(false);
    }
  }

  function aulaRealizada(numeroAula) {
    if (!progresso) return false;
    if (progresso.semana_ult_aula > semana) return true;
    if (progresso.semana_ult_aula === semana) {
      return progresso.ult_aula_realizada >= numeroAula;
    }
    return false;
  }

  async function marcarAulaComoFeita(aula) {
    if (aulaRealizada(aula.numero_aula)) return;

    try {
      await api.put('/aulas/progresso', {
        semana_ult_aula: semana,
        dia_ult_aula: aula.dia,
        ult_aula_realizada: aula.numero_aula,
      });

      setProgresso({
        semana_ult_aula: semana,
        dia_ult_aula: aula.dia,
        ult_aula_realizada: aula.numero_aula,
      });

      Alert.alert('Boa! 🏀', 'Aula marcada como concluída!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o progresso.');
    }
  }

  // Definida fora do return para evitar recriação desnecessária
  const renderAula = useCallback(({ item }) => {
    const feita = aulaRealizada(item.numero_aula);

    return (

      <TouchableOpacity
        style={[estilos.caixaDia, feita && estilos.caixaFeita]}
        onPress={() => setAulaSelecionada(item)}
        activeOpacity={0.8}
      >
        <View style={estilos.linhaHeader}>
          <View style={estilos.textoContainer}>
            <Text style={estilos.textoDia}>Dia {item.dia} — Aula {item.numero_aula}</Text>
            {!!item.titulo && <Text style={estilos.tituloAula}>{item.titulo}</Text>}
          </View>
          <View style={estilos.icones}>
            {!!item.youtube_id && <Text style={estilos.iconeVideo}>▶</Text>}
            {!!feita && <Text style={estilos.iconeFeito}>✓</Text>}
            <Text style={estilos.setinha}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [progresso]);

  // ── TELA DE DETALHE DA AULA ──────────────────────────────────────────────────
  if (aulaSelecionada) {
    const feita = aulaRealizada(aulaSelecionada.numero_aula);

    return (
      <GradientWrapper style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.detalheScroll}>

          <TouchableOpacity style={estilos.btnVoltar} onPress={() => setAulaSelecionada(null)}>
            <Text style={estilos.txtVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.detalheTitulo}>
            {aulaSelecionada.titulo || `Dia ${aulaSelecionada.dia} — Aula ${aulaSelecionada.numero_aula}`}
          </Text>

          {!!aulaSelecionada.pratica && (
            <View style={estilos.badgePratica}>
              <Text style={estilos.textoBadge}>🏀 Aula prática</Text>
            </View>
          )}

          {aulaSelecionada.youtube_id ? (
            <View style={estilos.playerContainer}>
              <YoutubePlayer height={220} videoId={aulaSelecionada.youtube_id} play={false} />
            </View>
          ) : (
            <View style={estilos.semVideo}>
              <Text style={estilos.textoSemVideo}>📹 Vídeo em breve</Text>
            </View>
          )}

          <View style={estilos.descricaoContainer}>
            <Text style={estilos.labelDescricao}>Sobre esta aula</Text>
            <Text style={estilos.textoDescricao}>
              {aulaSelecionada.explicacao || 'Descrição não disponível.'}
            </Text>
          </View>

          {feita ? (
            <View style={estilos.concluidoContainer}>
              <Text style={estilos.textoConcluido}>✓ Aula concluída</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={estilos.botaoConcluir}
              onPress={() => marcarAulaComoFeita(aulaSelecionada)}
            >
              <Text style={estilos.textoBotao}>Marcar como concluída</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
        <NavegacaoInferior />
      </GradientWrapper>
    );
  }

  // ── LISTA DE AULAS DA SEMANA ─────────────────────────────────────────────────
  return (
    <GradientWrapper style={estilos.tela}>
      <View style={estilos.conteudo}>
        <Text style={estilos.titulo}>Semana {semana}</Text>
        {carregando ? (
          <ActivityIndicator size="large" color={CORES.branco} style={estilos.loading} />
        ) : aulas.length === 0 ? (
          <Text style={estilos.textoVazio}>Nenhuma aula cadastrada para esta semana.</Text>
        ) : (
          <FlatList
            data={aulas}
            keyExtractor={(item) => String(item.id_aula)}
            renderItem={renderAula}
            estimatedItemSize={80}
            contentContainerStyle={estilos.listaConteudo}
          />
        )}
      </View>
      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  loading: { marginTop: 40 },
  titulo: { fontSize: 24, color: CORES.branco, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  listaConteudo: { paddingBottom: 20 },
  caixaDia: { backgroundColor: CORES.branco, padding: 20, borderRadius: 10, marginBottom: 10 },
  caixaFeita: { backgroundColor: CORES.sucessoFundo, borderLeftWidth: 4, borderLeftColor: CORES.sucesso },
  linhaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoContainer: { flex: 1 },
  textoDia: { fontSize: 16, fontWeight: 'bold' },
  tituloAula: { fontSize: 13, color: CORES.textoDesabilitado, marginTop: 3 },
  icones: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconeVideo: { color: CORES.primaria, fontSize: 14, fontWeight: 'bold' },
  iconeFeito: { color: CORES.sucesso, fontSize: 16, fontWeight: 'bold' },
  setinha: { fontSize: 20, color: CORES.cinzaMedio, marginLeft: 4 },
  textoVazio: { color: CORES.branco, textAlign: 'center', marginTop: 40, fontSize: 16, fontStyle: 'italic' },
  detalheScroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 60 },
  btnVoltar: { marginBottom: 16 },
  txtVoltar: { color: CORES.branco, fontSize: 16, fontWeight: 'bold' },
  detalheTitulo: { fontSize: 22, color: CORES.branco, fontWeight: 'bold', marginBottom: 12 },
  badgePratica: { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14 },
  textoBadge: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  playerContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  semVideo: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  textoSemVideo: { color: CORES.branco, fontSize: 15 },
  descricaoContainer: { backgroundColor: CORES.branco, borderRadius: 12, padding: 18, marginBottom: 20 },
  labelDescricao: { fontSize: 14, fontWeight: 'bold', color: CORES.primaria, marginBottom: 8 },
  textoDescricao: { fontSize: 14, color: CORES.textoMedio, lineHeight: 22 },
  botaoConcluir: { backgroundColor: CORES.primaria, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 15 },
  concluidoContainer: { backgroundColor: CORES.sucessoFundo, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  textoConcluido: { color: CORES.sucesso, fontWeight: 'bold', fontSize: 15 },
});