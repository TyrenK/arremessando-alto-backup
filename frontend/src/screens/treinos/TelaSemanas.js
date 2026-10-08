import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GradientWrapper from '../../components/GradientWrapper';
import estilosGlobais from '../../styles/styles';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import api from '../../config/api';
import CORES from '../../styles/cores';

const MAXIMO_SEMANAS = 20;

export default function TelaSemanas({ navigation }) {
  const [semanas, setSemanas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    setCarregando(true);
    try {
      const listaSemanas = [];

      for (let semanaAtual = 1; semanaAtual <= MAXIMO_SEMANAS; semanaAtual++) {
        const res = await api.get(`/aulas?semana=${semanaAtual}`);
        if (res.data.length === 0) break;
        listaSemanas.push({
          id: semanaAtual,
          nome: `Semana ${semanaAtual}`,
          totalAulas: res.data.length,
          aulasConcluidas: res.data.filter((a) => a.conclusao).length,
        });
      }

      setSemanas(listaSemanas);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar os treinos.');
    } finally {
      setCarregando(false);
    }
  }

  // Semana completa = todas as aulas dela concluídas pelo jogador.
  function semanaCompleta(semana) {
    return semana.totalAulas > 0 && semana.aulasConcluidas === semana.totalAulas;
  }

  // Em andamento = semana com aulas feitas e outras pendentes, ou a primeira
  // semana ainda não completa (a próxima a fazer).
  function semanaAtiva(semana) {
    if (semanaCompleta(semana)) return false;
    const primeiraPendente = semanas.find((s) => !semanaCompleta(s));
    return semana.aulasConcluidas > 0 || semana.id === primeiraPendente?.id;
  }

  return (
    <GradientWrapper style={estilos.tela}>
      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Aulas</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={CORES.branco} style={estilos.loading} />
      ) : (
        <ScrollView style={estilos.listaSemanas}>
          {semanas.length === 0 ? (
            <Text style={estilos.textoVazio}>Nenhum treino disponível ainda.</Text>
          ) : (
            semanas.map((semana) => {
              const completa = semanaCompleta(semana);
              const ativa = semanaAtiva(semana);
              return (
                <TouchableOpacity
                  key={semana.id}
                  style={[estilos.caixaSemana, completa && estilos.caixaCompleta, ativa && estilos.caixaAtiva]}
                  onPress={() => navigation.navigate('TelaTreino', { semana: semana.id })}
                >
                  <View style={estilos.linhaHeader}>
                    <Text style={estilos.tituloSemana}>{semana.nome}</Text>
                    {completa && <Text style={estilos.badge}>✓ Concluída</Text>}
                    {ativa && <Text style={[estilos.badge, estilos.badgeAtiva]}>Em andamento</Text>}
                  </View>
                  <Text style={estilos.subtituloSemana}>
                    {semana.aulasConcluidas}/{semana.totalAulas} aulas concluídas
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  loading: { marginTop: 60 },
  listaSemanas: { flex: 1, paddingHorizontal: 20 },
  caixaSemana: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 18, marginBottom: 15 },
  caixaCompleta: { backgroundColor: CORES.sucessoFundo, borderLeftWidth: 4, borderLeftColor: CORES.sucesso },
  caixaAtiva: { backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: CORES.primaria },
  linhaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloSemana: { fontSize: 18, fontWeight: 'bold' },
  subtituloSemana: { fontSize: 14, color: CORES.textoDesabilitado, marginTop: 4 },
  badge: { fontSize: 11, color: CORES.sucesso, fontWeight: 'bold', backgroundColor: CORES.sucessoFundo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeAtiva: { color: CORES.primaria, backgroundColor: '#FFE0E0' },
  textoVazio: { color: CORES.branco, textAlign: 'center', marginTop: 40, fontSize: 16 },
});