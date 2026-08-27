import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import GradientWrapper from '../../components/GradientWrapper';
import estilosGlobais from '../../styles/styles';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import api from '../../config/api';

export default function TelaPrincipal({ navigation }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [])
  );

  async function carregarHistorico() {
    setCarregando(true);
    try {
      const resposta = await api.get('/aproveitamento/historico');
      setRegistros(resposta.data);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar os relatórios.');
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(dataStr) {
    if (!dataStr) return '—';
    const d = new Date(dataStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('pt-BR');
  }

  function corAproveitamento(valor) {
    if (valor >= 60) return '#4CAF50';
    if (valor >= 40) return '#FF9800';
    return '#E53935';
  }

  return (
    <GradientWrapper style={estilos.tela}>

      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Relatórios</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView style={estilos.conteudo} contentContainerStyle={estilos.scrollContainer}>
          {registros.length === 0 ? (
            <View style={estilos.vazioContainer}>
              <Text style={estilos.textoVazio}>Nenhum treino registrado ainda.</Text>
              <Text style={estilos.textoVazioSub}>Toque no + para começar!</Text>
            </View>
          ) : (
            registros.map((item) => (
              <TouchableOpacity
                key={item.id_reg_aprov}
                style={estilos.cardRelatorio}
                onPress={() => navigation.navigate('TelaDetalhesCard', { registro: item })}
              >
                <View style={estilos.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.textoCardPrincipal}>
                      {item.numero_aula
                        ? `Semana ${item.semana} — Aula ${item.numero_aula}`
                        : 'Treino livre'}
                    </Text>
                    <Text style={estilos.textoCardSecundario}>
                      {formatarData(item.data_registro)}
                    </Text>
                  </View>
                  <View style={[estilos.badge, { backgroundColor: corAproveitamento(item.aproveitamento) }]}>
                    <Text style={estilos.textoBadge}>{item.aproveitamento}%</Text>
                  </View>
                </View>

                <View style={estilos.cardStats}>
                  <Text style={estilos.statTexto}>🏀 {item.tentativas} arremessos</Text>
                  <Text style={estilos.statTexto}>✓ {item.acertos} acertos</Text>
                  {!!item.tempo && <Text style={estilos.statTexto}>⏱ {item.tempo}</Text>}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={estilos.fab}
        onPress={() => navigation.navigate('TelaFormularioRelatorio')}
      >
        <MaterialIcons name="add" size={35} color="#FFF" />
      </TouchableOpacity>

      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  conteudo: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 120, paddingTop: 10 },
  vazioContainer: { marginTop: 80, alignItems: 'center' },
  textoVazio: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  textoVazioSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8 },
  cardRelatorio: {
    backgroundColor: '#FFF', width: '90%', borderRadius: 15,
    padding: 20, marginVertical: 8, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  textoCardPrincipal: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  textoCardSecundario: { fontSize: 13, color: '#666', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 10 },
  textoBadge: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardStats: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  statTexto: { fontSize: 13, color: '#555' },
  fab: {
    position: 'absolute', width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
    right: 30, bottom: 110, backgroundColor: '#700000',
    borderRadius: 30, elevation: 8,
  },
});