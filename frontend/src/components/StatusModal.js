import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function StatusModal({ visible, onRetry, onLater }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={estilos.modalContainer}>
        <View style={estilos.modalContent}>
          <Text style={estilos.modalTitulo}>Erro de Conexão</Text>
          <Text style={estilos.modalTexto}>
            Não foi possível conectar ao sensor.{'\n'}
            Verifique sua conexão e tente novamente.
          </Text>

          <TouchableOpacity style={estilos.btnTentar} onPress={onRetry}>
            <Text style={estilos.textoBotao}>Tentar Novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.btnDepois} onPress={onLater}>
            <Text style={estilos.textoBotao}>Tentar Mais Tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#3a0000',
    padding: 30,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#700000',
  },
  modalTitulo: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalTexto: {
    color: '#FFB3B3',
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 15,
    lineHeight: 22,
  },
  btnTentar: {
    backgroundColor: '#700000',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  btnDepois: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});