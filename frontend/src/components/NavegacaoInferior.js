import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CORES from '../styles/cores';

export default function NavegacaoInferior() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[estilos.areaNavegacao, { paddingBottom: insets.bottom + 10 }]}>
      <TouchableOpacity
        style={estilos.itemNavegacao}
        onPress={() => navigation.navigate('TelaSemanas')}
      >
        <Image source={require('../assets/treino.png')} style={estilos.icone} />
        <Text style={estilos.textoItem}>Treino</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={estilos.itemNavegacao}
        onPress={() => navigation.navigate('TelaHistoricoTreinos')}
      >
        <Image source={require('../assets/relatorio.png')} style={estilos.icone} />
        <Text style={estilos.textoItem}>Relatório</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={estilos.itemNavegacao}
        onPress={() => navigation.navigate('TelaPerfil')}
      >
        <Image source={require('../assets/perfil.png')} style={estilos.icone} />
        <Text style={estilos.textoItem}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  areaNavegacao: {
    flexDirection: 'row',
    backgroundColor: CORES.primariaNavegacao,
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  itemNavegacao: {
    alignItems: 'center',
  },
  icone: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  textoItem: {
    color: CORES.branco,
    fontWeight: 'bold',
    fontSize: 13,
  },
});