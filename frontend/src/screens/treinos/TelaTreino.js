import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import GradientWrapper from '../../components/GradientWrapper';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import api from '../../config/api';

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
    if (aulaRealizada(aula.id_aula)) return;

    try {
      await api.put('/aulas/progresso', {
        semana_ult_aula: semana,
        dia_ult_aula: aula.dia,
        ult_aula_realizada: aula.id_aula,
      });

      setProgresso({
        semana_ult_aula: semana,
        dia_ult_aula: aula.dia,
        ult_aula_realizada: aula.id_aula,
      });

      Alert.alert('Boa! 🏀', 'Aula marcada como concluída!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o progresso.');
    }
  }

  // ── TELA DE DETALHE DA AULA ──────────────────────────────────────────────────
  if (aulaSelecionada) {
    const feita = aulaRealizada(aulaSelecionada.id_aula);

    return (
      <GradientWrapper style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.detalheScroll}>

          <TouchableOpacity style={estilos.btnVoltar} onPress={() => setAulaSelecionada(null)}>
            <Text style={estilos.txtVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.detalheTitulo}>
            {aulaSelecionada.titulo || `Dia ${aulaSelecionada.dia} — Aula ${aulaSelecionada.id_aula}`}
          </Text>

          {aulaSelecionada.pratica && (
            <View style={estilos.badgePratica}>
              <Text style={estilos.textoBadge}>🏀 Aula prática</Text>
            </View>
          )}

          {/* Player YouTube — só aparece se tiver youtube_id cadastrado */}
          {aulaSelecionada.youtube_id ? (
            <View style={estilos.playerContainer}>
              <YoutubePlayer
                height={220}
                videoId={aulaSelecionada.youtube_id}
                play={false}
              />
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
  function renderAula({ item }) {
  const feita = aulaRealizada(item.id_aula);

  return (
    <TouchableOpacity
      style={[estilos.caixaDia, feita && estilos.caixaFeita]}
      onPress={() => setAulaSelecionada(item)}
      activeOpacity={0.8}
    >
      <View style={estilos.linhaHeader}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.textoDia}>Dia {item.dia} — Aula {item.id_aula}</Text>
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
}

  return (
    <GradientWrapper style={estilos.tela}>
      <View style={estilos.conteudo}>
        <Text style={estilos.titulo}>Semana {semana}</Text>
        {carregando ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
        ) : aulas.length === 0 ? (
          <Text style={estilos.textoVazio}>Nenhuma aula cadastrada para esta semana.</Text>
        ) : (
          <FlatList
            data={aulas}
            keyExtractor={(item) => String(item.id_aula)}
            renderItem={renderAula}
            estimatedItemSize={80}
            contentContainerStyle={{ paddingBottom: 20 }}
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
  titulo: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  caixaDia: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 10 },
  caixaFeita: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  linhaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoDia: { fontSize: 16, fontWeight: 'bold' },
  tituloAula: { fontSize: 13, color: '#555', marginTop: 3 },
  icones: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconeVideo: { color: '#700000', fontSize: 14, fontWeight: 'bold' },
  iconeFeito: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold' },
  setinha: { fontSize: 20, color: '#aaa', marginLeft: 4 },
  textoVazio: { color: '#fff', textAlign: 'center', marginTop: 40, fontSize: 16, fontStyle: 'italic' },
  detalheScroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 60 },
  btnVoltar: { marginBottom: 16 },
  txtVoltar: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  detalheTitulo: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 12 },
  badgePratica: { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14 },
  textoBadge: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  playerContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  semVideo: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  textoSemVideo: { color: '#fff', fontSize: 15 },
  descricaoContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 20 },
  labelDescricao: { fontSize: 14, fontWeight: 'bold', color: '#700000', marginBottom: 8 },
  textoDescricao: { fontSize: 14, color: '#333', lineHeight: 22 },
  botaoConcluir: { backgroundColor: '#700000', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  concluidoContainer: { backgroundColor: '#E8F5E9', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  textoConcluido: { color: '#4CAF50', fontWeight: 'bold', fontSize: 15 },
});