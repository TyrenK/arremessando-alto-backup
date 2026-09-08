import React, { useEffect } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import GradientWrapper from '../../components/GradientWrapper';

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

    // Navega automaticamente após 2 segundos
    const temporizador = setTimeout(() => {
      navigation.navigate('TelaLogin');
    }, 2000);

    return () => clearTimeout(temporizador);
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