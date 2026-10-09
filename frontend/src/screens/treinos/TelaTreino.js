import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import GradientWrapper from '../../components/GradientWrapper';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import estilosGlobais from '../../styles/styles';
import api from '../../config/api';
import CORES from '../../styles/cores';

export default function TelaTreino({ route, navigation }) {
  const { semana } = route.params;

  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAulas();
  }, []);

  async function carregarAulas() {
    setCarregando(true);
    try {
      const resAulas = await api.get(`/aulas?semana=${semana}`);
      setAulas(resAulas.data);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar as aulas.');
    } finally {
      setCarregando(false);
    }
  }

  // A conclusão vem do backend (campo "conclusao", por jogador).
  // Cada aula é independente: marcar ou desmarcar uma não afeta as outras.
  function atualizarConclusaoLocal(idAula, concluida) {
    setAulas((atuais) =>
      atuais.map((a) => (a.id_aula === idAula ? { ...a, conclusao: concluida } : a))
    );
  }

  async function marcarAulaComoFeita(aula) {
    if (aula.conclusao) return;

    try {
      await api.post(`/aulas/${aula.id_aula}/concluir`);
      atualizarConclusaoLocal(aula.id_aula, true);
      Alert.alert('Boa! 🏀', 'Aula marcada como concluída!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o progresso.');
    }
  }

  async function desmarcarAula(aula) {
    if (!aula.conclusao) return;

    try {
      await api.delete(`/aulas/${aula.id_aula}/concluir`);
      atualizarConclusaoLocal(aula.id_aula, false);
      Alert.alert('Conclusão desfeita', 'A aula não está mais marcada como concluída.');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar o progresso.');
    }
  }

  const renderAula = useCallback(({ item }) => {
    const feita = item.conclusao;

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
            {!!item.gif_url && <Text style={estilos.iconeGif}>GIF</Text>}
            {!!feita && <Text style={estilos.iconeFeito}>✓</Text>}
            <Text style={estilos.setinha}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  // ── TELA DE DETALHE DA AULA ──────────────────────────────────────────────────
  if (aulaSelecionada) {
    const aulaAtual = aulas.find((a) => a.id_aula === aulaSelecionada.id_aula) || aulaSelecionada;
    const feita = aulaAtual.conclusao;
    const tituloTreino = `Treino Semana ${semana} - Aula ${aulaSelecionada.numero_aula}`;

    return (
      <GradientWrapper style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.detalheScroll}>

          <TouchableOpacity style={estilos.btnVoltar} onPress={() => setAulaSelecionada(null)}>
            <Text style={estilos.txtVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.detalheTitulo}>
            {aulaSelecionada.titulo || `Dia ${aulaSelecionada.dia} — Aula ${aulaSelecionada.numero_aula}`}
          </Text>

          <View style={estilos.badgePratica}>
            <Text style={estilos.textoBadge}>🏀 Aula prática</Text>
          </View>

          {aulaSelecionada.gif_url ? (
            <View style={estilos.gifContainer}>
              <Image
                source={{ uri: aulaSelecionada.gif_url }}
                style={estilos.gif}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={estilos.semConteudo}>
              <Text style={estilos.textoSemConteudo}>GIF em breve</Text>
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
          ) : null}

          {feita ? (
            <TouchableOpacity
              style={estilos.botaoDesmarcar}
              onPress={() => desmarcarAula(aulaAtual)}
            >
              <Text style={estilos.textoBotaoDesmarcar}>Desmarcar conclusão</Text>
            </TouchableOpacity>
          ) : (
            <View style={estilos.rowBotoes}>
              <TouchableOpacity
                style={[estilos.botao, estilos.botaoConcluir]}
                onPress={() => marcarAulaComoFeita(aulaAtual)}
              >
                <Text style={estilos.textoBotao}>Marcar como concluída</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[estilos.botao, estilos.botaoTreino]}
                onPress={() =>
                  navigation.navigate('TelaConfigurarTreino', {
                    tituloPreenchido: tituloTreino,
                    aoFinalizar: () => setAulaSelecionada(aulaSelecionada),
                  })
                }
              >
                <Text style={estilos.textoBotao}>Iniciar treino</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
        <NavegacaoInferior />
      </GradientWrapper>
    );
  }

  // ── LISTA DE AULAS DA SEMANA ─────────────────────────────────────────────────
  return (
    <GradientWrapper style={estilos.tela}>
      <View style={estilos.cabecalhoLista}>
        <TouchableOpacity
          style={estilos.btnVoltarLista}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 20 }}
        >
          <Text style={estilos.txtVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={estilosGlobais.titulo}>Semana {semana}</Text>
      </View>

      <View style={estilos.conteudo}>
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
  conteudo: { flex: 1, paddingHorizontal: 20 },
  loading: { marginTop: 40 },
  cabecalhoLista: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 20 },
  btnVoltarLista: { alignSelf: 'flex-start', paddingVertical: 10, marginBottom: 6 },
  listaConteudo: { paddingBottom: 20 },
  caixaDia: { backgroundColor: CORES.branco, padding: 20, borderRadius: 10, marginBottom: 10 },
  caixaFeita: { backgroundColor: CORES.sucessoFundo, borderLeftWidth: 4, borderLeftColor: CORES.sucesso },
  linhaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoContainer: { flex: 1 },
  textoDia: { fontSize: 16, fontWeight: 'bold' },
  tituloAula: { fontSize: 13, color: CORES.textoDesabilitado, marginTop: 3 },
  icones: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconeGif: { color: '#9C27B0', fontSize: 11, fontWeight: 'bold', backgroundColor: '#F3E5F5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  iconeFeito: { color: CORES.sucesso, fontSize: 16, fontWeight: 'bold' },
  setinha: { fontSize: 20, color: CORES.cinzaMedio, marginLeft: 4 },
  textoVazio: { color: CORES.branco, textAlign: 'center', marginTop: 40, fontSize: 16, fontStyle: 'italic' },
  detalheScroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 60 },
  btnVoltar: { marginBottom: 16 },
  txtVoltar: { color: CORES.branco, fontSize: 16, fontWeight: 'bold' },
  detalheTitulo: { fontSize: 22, color: CORES.branco, fontWeight: 'bold', marginBottom: 12 },
  badgePratica: { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14 },
  textoBadge: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  gifContainer: { backgroundColor: CORES.branco, borderRadius: 12, overflow: 'hidden', marginBottom: 20, alignItems: 'center', padding: 10 },
  gif: { width: '100%', height: 220 },
  semConteudo: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  textoSemConteudo: { color: CORES.branco, fontSize: 15 },
  descricaoContainer: { backgroundColor: CORES.branco, borderRadius: 12, padding: 18, marginBottom: 20 },
  labelDescricao: { fontSize: 14, fontWeight: 'bold', color: CORES.primaria, marginBottom: 8 },
  textoDescricao: { fontSize: 14, color: CORES.textoMedio, lineHeight: 22 },
  rowBotoes: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  botao: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  botaoConcluir: { backgroundColor: CORES.sucesso },
  botaoTreino: { backgroundColor: CORES.primaria },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 14 },
  concluidoContainer: { backgroundColor: CORES.sucessoFundo, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  botaoDesmarcar: { alignSelf: 'stretch', backgroundColor: CORES.branco, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  textoBotaoDesmarcar: { color: CORES.primaria, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  textoConcluido: { color: CORES.sucesso, fontWeight: 'bold', fontSize: 15 },
});