import React, { useEffect } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import GradientWrapper from '../../components/GradientWrapper';
import api from '../../config/api';
import { pegarToken, limparSessao } from '../../config/storage';

// Descobre para onde ir ao abrir o app (ou dar F5):
// sem token ou token recusado pelo servidor -> login; senão, direto para dentro do app.
async function descobrirTelaInicial() {
  const token = await pegarToken();
  if (!token) return 'TelaLogin';

  try {
    // Valida o token no servidor e já traz o nome atualizado
    const { data } = await api.get('/jogador/perfil');
    return data.nome === 'Novo Jogador' ? 'TelaFormulario' : 'TelaSemanas';
  } catch (erro) {
    if (erro.response?.status === 401 || erro.response?.status === 404) {
      // Token expirado/inválido ou jogador não existe mais: limpa e pede login
      await limparSessao();
      return 'TelaLogin';
    }
    // Sem conexão / servidor fora: mantém a sessão e entra no app
    return 'TelaSemanas';
  }
}

// Tela de animação de entrada do app
export default function TelaAnimacao({ navigation }) {
  
  const opacidade = useSharedValue(0);
  const escala = useSharedValue(0.5);

  useEffect(() => {
    // Anima opacidade
    opacidade.value = withTiming(1, {
      duration: 3000,
      easing: Easing.out(Easing.exp),
    });

    // Anima escala
    escala.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });

    // Espera a animação (2s) e a verificação da sessão terminarem, então navega
    let cancelado = false;
    const espera = new Promise((resolve) => setTimeout(resolve, 2000));

    Promise.all([descobrirTelaInicial(), espera]).then(([tela]) => {
      if (!cancelado) navigation.reset({ index: 0, routes: [{ name: tela }] });
    });

    return () => { cancelado = true; };
  }, [navigation]);

  const estiloAnimado = useAnimatedStyle(() => ({
    opacity: opacidade.value,
    transform: [{ scale: escala.value }],
  }));

  return (
    <GradientWrapper style={estilos.container}>
      <Animated.View style={[estiloAnimado, estilos.center]}>
        <Image
          source={require('../../assets/basquete.png')}
          style={estilos.imagem}
        />
        <Text style={estilos.titulo}>Arremessando Alto</Text>
      </Animated.View>
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  imagem: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
});