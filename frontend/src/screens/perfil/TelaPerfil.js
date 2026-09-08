import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientWrapper from '../../components/GradientWrapper';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import estilosGlobais from '../../styles/styles';
import api from '../../config/api';
import { limparSessao } from '../../config/storage';

export default function TelaPerfil({ navigation }) {
  const [jogador, setJogador] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoUri, setFotoUri] = useState(null);
  const [modalFoto, setModalFoto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
      carregarFoto();
    }, [])
  );

  async function carregarPerfil() {
    setCarregando(true);
    try {
      const resposta = await api.get('/jogador/perfil');
      setJogador(resposta.data);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarFoto() {
    const uri = await AsyncStorage.getItem('fotoPerfil');
    if (uri) setFotoUri(uri);
  }

  async function tirarFoto() {
    setModalFoto(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Permissão para acessar a câmera foi negada.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    await AsyncStorage.setItem('fotoPerfil', uri);
    setFotoUri(uri);
  }

  async function escolherDaGaleria() {
    setModalFoto(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Permissão para acessar a galeria foi negada.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    await AsyncStorage.setItem('fotoPerfil', uri);
    setFotoUri(uri);
  }

  async function sair() {
    await limparSessao();
    navigation.reset({ index: 0, routes: [{ name: 'TelaLogin' }] });
  }

  function formatarData(data) {
    if (!data) return '—';
    const partes = data.split('T')[0].split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarExperiencia(exp) {
    const mapa = {
      iniciante: 'Iniciante',
      intermediario: 'Intermediário',
      experiente: 'Experiente',
      profissional: 'Profissional',
    };
    return mapa[exp] || exp || '—';
  }

  return (
    <GradientWrapper style={estilos.tela}>

      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Perfil</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      <ScrollView contentContainerStyle={estilos.scrollContent}>
        <View style={estilos.card}>

          <TouchableOpacity style={estilos.configBtn} onPress={sair}>
            <Ionicons name="log-out-outline" size={24} color="#A9A9A9" />
          </TouchableOpacity>

          <View style={estilos.avatarContainer}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={estilos.avatarImagem} />
            ) : (
              <View style={estilos.avatarPlaceholder}>
                <Ionicons name="person" size={80} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={estilos.editIconBtn} onPress={() => setModalFoto(true)}>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {carregando ? (
            <ActivityIndicator size="large" color="#700000" style={{ marginVertical: 30 }} />
          ) : (
            <View style={estilos.infoSection}>
              <Text style={estilos.label}>Nome</Text>
              <View style={estilos.campoDado}>
                <Text style={estilos.textoDado}>{jogador?.nome || '—'}</Text>
              </View>

              <Text style={estilos.label}>Data de nascimento</Text>
              <View style={estilos.campoDado}>
                <Text style={estilos.textoDado}>{formatarData(jogador?.data_nascimento)}</Text>
              </View>

              <Text style={estilos.label}>Experiência</Text>
              <View style={estilos.campoDado}>
                <Text style={estilos.textoDado}>{formatarExperiencia(jogador?.exp_basq)}</Text>
              </View>

              <Text style={estilos.label}>Email</Text>
              <View style={estilos.campoDado}>
                <Text style={estilos.textoDado}>{jogador?.email || '—'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={estilos.botaoEditar}
            onPress={() => navigation.navigate('TelaPerfilEdicao', { jogador })}
          >
            <Text style={estilos.textoBotao}>Editar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalFoto} transparent animationType="fade" onRequestClose={() => setModalFoto(false)}>
        <TouchableOpacity style={estilos.modalOverlay} activeOpacity={1} onPress={() => setModalFoto(false)}>
          <View style={estilos.modalSheet}>
            <Text style={estilos.modalTitulo}>Foto de perfil</Text>

            <TouchableOpacity style={estilos.modalOpcao} onPress={tirarFoto}>
              <View style={estilos.modalIconCircle}>
                <FontAwesome name="camera" size={16} color="#700000" />
              </View>
              <Text style={estilos.modalOpcaoTexto}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.modalOpcao} onPress={escolherDaGaleria}>
              <View style={estilos.modalIconCircle}>
                <FontAwesome name="picture-o" size={16} color="#700000" />
              </View>
              <Text style={estilos.modalOpcaoTexto}>Escolher da Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.modalCancelar} onPress={() => setModalFoto(false)}>
              <Text style={estilos.modalCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  scrollContent: { alignItems: 'center' },
  card: { backgroundColor: '#FFF', width: '90%', borderRadius: 20, padding: 15, alignItems: 'center', elevation: 5 },
  configBtn: { alignSelf: 'flex-end' },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  avatarImagem: { width: 120, height: 120, borderRadius: 60 },
  editIconBtn: { backgroundColor: '#700000', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 5, right: 5, borderWidth: 3, borderColor: '#FFF' },
  infoSection: { width: '100%', paddingHorizontal: 10 },
  label: { fontWeight: 'bold', fontSize: 16, color: '#000', marginTop: 10 },
  campoDado: { backgroundColor: '#D9D9D9', borderRadius: 8, padding: 12, marginTop: 3 },
  textoDado: { color: '#777', fontSize: 15 },
  botaoEditar: { backgroundColor: '#700000', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 50, alignItems: 'center', alignSelf: 'center', marginTop: 25, marginBottom: 10 },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  modalTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalOpcao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  modalOpcaoTexto: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  modalCancelar: { marginTop: 8, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  modalCancelarTexto: { fontSize: 15, color: '#700000', fontWeight: '600' },
});