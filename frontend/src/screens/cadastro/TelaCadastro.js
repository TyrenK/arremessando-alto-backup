import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import GradientWrapper from '../../components/GradientWrapper';
import api from '../../config/api';
import { salvarToken, salvarJogador } from '../../config/storage';
import CORES from '../../styles/cores';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TelaCadastro({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function fazerCadastro() {
    if (!email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!REGEX_EMAIL.test(email)) {
      Alert.alert('Atenção', 'Digite um email válido.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/auth/cadastro', { email, senha });

      const resLogin = await api.post('/auth/login', { email, senha });

      await salvarToken(resLogin.data.token);
      await salvarJogador(resLogin.data.jogador);

      navigation.navigate('TelaFormulario');

    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao conectar com o servidor.';
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
          placeholder="Escreva seu email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={estilos.label}>Senha:</Text>
        <TextInput
          style={estilos.input}
          secureTextEntry
          placeholder="Escreva sua senha"
          placeholderTextColor="#666"
          value={senha}
          onChangeText={setSenha}
        />

        <Text style={estilos.label}>Confirmar senha:</Text>
        <TextInput
          style={estilos.input}
          secureTextEntry
          placeholder="Confirme sua senha"
          placeholderTextColor="#666"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <TouchableOpacity
          style={[estilos.botao, carregando && estilos.botaoDesabilitado]}
          onPress={fazerCadastro}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color={CORES.branco} />
            : <Text style={estilos.textoBotao}>Cadastrar</Text>
          }
        </TouchableOpacity>

        <Text style={estilos.link}>
          Já possui uma conta?{' '}
          <Text style={estilos.linkVermelho} onPress={() => navigation.navigate('TelaLogin')}>
            Entre
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
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 5, color: CORES.textoEscuro },
  input: { backgroundColor: '#CCCCCC', width: '100%', borderRadius: 5, padding: 10, marginBottom: 15, color: CORES.textoEscuro },
  botao: { backgroundColor: CORES.primaria, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 35, marginTop: 10 },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 15, fontSize: 12, textAlign: 'center', color: CORES.textoEscuro },
  linkVermelho: { color: '#8B0000', fontWeight: 'bold', textDecorationLine: 'underline' },
});