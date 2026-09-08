import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientWrapper from '../../components/GradientWrapper';
import estilosGlobais from '../../styles/styles';
import api from '../../config/api';
import CORES from '../../styles/cores';

export default function TelaPerfilEdicao({ navigation, route }) {
  const jogadorAtual = route.params?.jogador || {};

  function dataParaInput(data) {
    if (!data) return '';
    const partes = data.split('T')[0].split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  const [nome, setNome] = useState(jogadorAtual.nome || '');
  const [email, setEmail] = useState(jogadorAtual.email || '');
  const [dataNascimento, setDataNascimento] = useState(dataParaInput(jogadorAtual.data_nascimento));
  const [fotoUri, setFotoUri] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function formatarData(data) {
    const partes = data.split('/');
    if (partes.length === 3 && partes[2].length === 4) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return null;
  }

  function mascaraData(texto) {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0,2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0,2)}/${numeros.slice(2,4)}/${numeros.slice(4,8)}`;
  }

  async function escolherFoto() {
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

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('fotoPerfil', uri);
      setFotoUri(uri);
    }
  }

  async function salvarAlteracoes() {
    if (!nome || !email) {
      Alert.alert('Atenção', 'Nome e email são obrigatórios.');
      return;
    }

    setCarregando(true);
    try {
      await api.put('/jogador/perfil', {
        nome,
        email,
        data_nascimento: dataNascimento ? formatarData(dataNascimento) : null,
      });

      Alert.alert('Sucesso!', 'Perfil atualizado!', [
        { text: 'OK', onPress: () => navigation.navigate('TelaPerfil') }
      ]);

    } catch (erro) {
      const msg = erro.response?.data?.mensagem || 'Erro ao salvar alterações.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <GradientWrapper style={estilos.tela}>

      <View style={estilosGlobais.cabecalho}>
        <Text style={estilosGlobais.titulo}>Editar Perfil</Text>
        <Image source={require('../../assets/basquete.png')} style={estilosGlobais.icone} />
      </View>

      <ScrollView contentContainerStyle={estilos.scrollContent}>
        <View style={estilos.card}>

          <View style={estilos.avatarContainer}>
            <View style={estilos.avatarPlaceholder}>
              <Ionicons name="person" size={80} color={CORES.branco} />
            </View>
            <TouchableOpacity style={estilos.editIconBtn} onPress={escolherFoto}>
              <MaterialIcons name="camera-alt" size={20} color={CORES.branco} />
            </TouchableOpacity>
          </View>

          <View style={estilos.infoSection}>
            <Text style={estilos.label}>Nome</Text>
            <TextInput style={estilos.input} value={nome} onChangeText={setNome} />

            <Text style={estilos.label}>Data de nascimento</Text>
            <TextInput
              style={estilos.input}
              value={dataNascimento}
              onChangeText={(texto) => setDataNascimento(mascaraData(texto))}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={estilos.label}>Email</Text>
            <TextInput
              style={estilos.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={estilos.containerBotoes}>
            <TouchableOpacity
              style={[estilos.botao, estilos.botaoCancelar]}
              onPress={() => navigation.navigate('TelaPerfil')}
            >
              <Text style={estilos.textoBotao}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.botao, estilos.botaoSalvar, carregando && estilos.botaoDesabilitado]}
              onPress={salvarAlteracoes}
              disabled={carregando}
            >
              {carregando
                ? <ActivityIndicator color={CORES.branco} />
                : <Text style={estilos.textoBotao}>Salvar</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, paddingTop: 50 },
  scrollContent: { alignItems: 'center', paddingBottom: 30 },
  card: { backgroundColor: CORES.branco, width: '90%', borderRadius: 20, padding: 15, alignItems: 'center', elevation: 5 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  editIconBtn: { backgroundColor: CORES.primaria, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 5, right: 5, borderWidth: 3, borderColor: CORES.branco },
  infoSection: { width: '100%', paddingHorizontal: 10 },
  label: { fontWeight: 'bold', fontSize: 16, color: CORES.textoMedio, marginTop: 10 },
  input: { backgroundColor: CORES.cinzaClaro, borderRadius: 8, padding: 12, marginTop: 3, color: CORES.textoEscuro, fontSize: 15 },
  containerBotoes: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25, marginBottom: 10, paddingHorizontal: 5 },
  botao: { flex: 1, borderRadius: 15, paddingVertical: 12, alignItems: 'center', marginHorizontal: 5 },
  botaoCancelar: { backgroundColor: CORES.cinzaMedio },
  botaoSalvar: { backgroundColor: CORES.primaria },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 16 },
});