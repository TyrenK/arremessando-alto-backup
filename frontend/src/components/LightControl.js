import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LightControl({ isLightOn }) {
  return (
    <View style={estilos.card}>
      <View style={[estilos.circulo, { backgroundColor: isLightOn ? '#2ECC71' : '#3a0000' }]} />
      <Text style={estilos.label}>
        {isLightOn ? 'Acerto! 🏀' : 'Aguardando arremesso...'}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  circulo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  label: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});