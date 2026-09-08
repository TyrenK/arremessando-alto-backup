import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import GradientWrapper from '../../components/GradientWrapper';
import api from '../../config/api';
import { salvarToken, salvarJogador } from '../../config/storage';
import CORES from '../../styles/cores';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o email e a senha.');
      return;
    }

    if (!REGEX_EMAIL.test(email)) {
      Alert.alert('Atenção', 'Digite um email válido.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await api.post('/auth/login', { email, senha });

      await salvarToken(resposta.data.token);
      await salvarJogador(resposta.data.jogador);

      if (resposta.data.jogador.nome === 'Novo Jogador') {
        navigation.navigate('TelaFormulario');
      } else {
        navigation.navigate('TelaSemanas');
      }

    } catch (erro) {
      const msg = erro.response?.data?.mensagem || 'Erro ao conectar com o servidor.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <GradientWrapper style={estilos.container}>

      <View style={estilos.logoContainer}>
        <Image source={require('../../assets/basquete.png')} style={estilos.logo} />
        <Text style={estilos.tituloApp}>Arremessando Alto</Text>
      </View>

      <View style={estilos.card}>
        <Text style={estilos.label}>Email:</Text>
        <TextInput
          style={estilos.input}
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={estilos.label}>Senha:</Text>
        <TextInput
          style={estilos.input}
          secureTextEntry
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={[estilos.botao, carregando && estilos.botaoDesabilitado]}
          onPress={fazerLogin}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color={CORES.branco} />
            : <Text style={estilos.textoBotao}>Logar</Text>
          }
        </TouchableOpacity>

        <Text style={estilos.link}>
          Ainda não possui uma conta?{' '}
          <Text style={estilos.linkVermelho} onPress={() => navigation.navigate('TelaCadastro')}>
            Cadastre-se
          </Text>
        </Text>
      </View>
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 120 },
  logoContainer: { alignItems: 'center', marginBottom: 35 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  tituloApp: { color: CORES.branco, fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  card: { backgroundColor: '#E0E0E0', borderRadius: 20, padding: 25, width: '85%', alignItems: 'center' },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#CCCCCC', width: '100%', borderRadius: 5, padding: 10, marginBottom: 15 },
  botao: { backgroundColor: CORES.primaria, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 50, marginTop: 10 },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 15, fontSize: 12, textAlign: 'center' },
  linkVermelho: { color: '#8B0000', fontWeight: 'bold', textDecorationLine: 'underline' },
});