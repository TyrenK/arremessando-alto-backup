import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import MaskInput from 'react-native-mask-input';
import GradientWrapper from '../../components/GradientWrapper';
import estilosGlobais from '../../styles/styles';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import CORES from '../../styles/cores';

export default function TelaConfigurarTreino({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [arremessos, setArremessos] = useState('');
  const [tempo, setTempo] = useState('');

  const podeIniciar = titulo !== '' && arremessos !== '' && tempo !== '';

  const iniciar = () => {
    navigation.navigate('TelaTreinoAtivo', {
      titulo,
      totalArremessos: parseInt(arremessos),
      totalTempo: parseInt(tempo),
    });
  };

  return (
    <GradientWrapper style={estilos.tela}>

      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Novo Treino</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      <View style={estilos.conteudo}>
        <View style={estilos.card}>

          <Text style={estilos.label}>Título do treino</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: Treino de lance livre"
            placeholderTextColor={CORES.textoDesabilitado}
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={estilos.label}>Quantidade de arremessos</Text>
          <MaskInput
            style={estilos.input}
            placeholder="Ex: 30"
            placeholderTextColor={CORES.textoDesabilitado}
            value={arremessos}
            onChangeText={(masked) => setArremessos(masked)}
            mask={[/\d/, /\d/, /\d/]}
            keyboardType="numeric"
          />

          <Text style={estilos.label}>Tempo de treino (minutos)</Text>
          <MaskInput
            style={estilos.input}
            placeholder="Ex: 5"
            placeholderTextColor={CORES.textoDesabilitado}
            value={tempo}
            onChangeText={(masked) => setTempo(masked)}
            mask={[/\d/, /\d/]}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[estilos.botao, !podeIniciar && estilos.botaoDesabilitado]}
            onPress={iniciar}
            disabled={!podeIniciar}
          >
            <Text style={estilos.textoBotao}>Iniciar Treino</Text>
          </TouchableOpacity>

        </View>
      </View>

      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  conteudo: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: CORES.branco, width: '100%', borderRadius: 20, padding: 24, elevation: 5 },
  label: { fontSize: 16, fontWeight: 'bold', color: CORES.textoMedio, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: CORES.cinzaClaro, borderRadius: 10, padding: 14, fontSize: 16, color: CORES.textoEscuro },
  botao: { backgroundColor: CORES.primaria, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  botaoDesabilitado: { backgroundColor: CORES.cinzaMedio },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 16 },
});