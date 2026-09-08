import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import GradientWrapper from '../../components/GradientWrapper';
import estilosGlobais from '../../styles/styles';
import NavegacaoInferior from '../../components/NavegacaoInferior';

export default function TelaDetalhesTreino({ route, navigation }) {
  const { registro } = route.params;

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

  const tituloTreino = registro.titulo || (registro.numero_aula
    ? `Semana ${registro.semana} — Aula ${registro.numero_aula}`
    : 'Treino livre');

  return (
    <GradientWrapper style={estilos.tela}>

      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Relatórios</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      <ScrollView contentContainerStyle={estilos.scrollContent}>
        <View style={estilos.card}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.btnVoltar}>
            <Text style={estilos.txtVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.treinoTitulo}>{tituloTreino}</Text>
          <Text style={estilos.dataTexto}>{formatarData(registro.data_registro)}</Text>

          <View style={[estilos.badgeGrande, { backgroundColor: corAproveitamento(registro.aproveitamento) }]}>
            <Text style={estilos.badgeTexto}>{registro.aproveitamento}%</Text>
            <Text style={estilos.badgeSubtexto}>aproveitamento</Text>
          </View>

          <View style={estilos.divisor} />

          <View style={estilos.statsContainer}>
            <View style={estilos.linhaEstat}>
              <Text style={estilos.label}>Arremessos:</Text>
              <Text style={estilos.valor}>{registro.tentativas}</Text>
            </View>
            <View style={estilos.linhaEstat}>
              <Text style={estilos.label}>Acertos:</Text>
              <Text style={estilos.valor}>{registro.acertos}</Text>
            </View>
            <View style={estilos.linhaEstat}>
              <Text style={estilos.label}>Erros:</Text>
              <Text style={estilos.valor}>{registro.tentativas - registro.acertos}</Text>
            </View>
            {!!registro.tempo && (
              <View style={estilos.linhaEstat}>
                <Text style={estilos.label}>Duração:</Text>
                <Text style={estilos.valor}>{registro.tempo}</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  scrollContent: { alignItems: 'center', paddingTop: 10, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', width: '90%', borderRadius: 20, padding: 25, elevation: 5 },
  btnVoltar: { marginBottom: 16 },
  txtVoltar: { color: '#700000', fontSize: 15, fontWeight: 'bold' },
  treinoTitulo: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  dataTexto: { fontSize: 15, color: '#666', marginBottom: 20 },
  badgeGrande: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  badgeTexto: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  badgeSubtexto: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  divisor: { height: 1, backgroundColor: '#EEE', marginBottom: 16 },
  statsContainer: { width: '100%' },
  linhaEstat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label: { fontSize: 17, fontWeight: 'bold', color: '#000' },
  valor: { fontSize: 17, fontWeight: 'bold', color: '#700000' },
});