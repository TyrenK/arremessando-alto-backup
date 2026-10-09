import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import GradientWrapper from '../../components/GradientWrapper';
import api from '../../config/api';
import { pegarJogador } from '../../config/storage';
import CORES from '../../styles/cores';
import { dataValida } from '../../utils/ValidarData';

const schema = yup.object({
  nome: yup
    .string()
    .min(2, 'Nome muito curto.')
    .required('Nome obrigatório.'),
  dataNascimento: yup
    .string()
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA.')
    .test('data-valida', 'Data de nascimento inválida.', (valor) => !valor || dataValida(valor))
    .nullable(),
  experiencia: yup
    .string()
    .oneOf(['iniciante', 'intermediario', 'experiente', 'profissional'])
    .required('Selecione uma experiência.'),
});

const opcoes = [
  { label: 'Iniciante',     valor: 'iniciante' },
  { label: 'Intermediário', valor: 'intermediario' },
  { label: 'Experiente',    valor: 'experiente' },
  { label: 'Profissional',  valor: 'profissional' },
];

function mascaraData(texto) {
  const n = texto.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0,2)}/${n.slice(2)}`;
  return `${n.slice(0,2)}/${n.slice(2,4)}/${n.slice(4,8)}`;
}

export default function TelaFormulario({ navigation }) {
  const [aberto, setAberto] = useState(false);

  async function enviarFormulario(valores) {
    try {
      const jogadorSalvo = await pegarJogador();

      let dataFormatada = null;
      if (valores.dataNascimento && valores.dataNascimento.length === 10) {
        const partes = valores.dataNascimento.split('/');
        dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }

      await api.put('/jogador/perfil', {
        nome: valores.nome,
        email: jogadorSalvo?.email || '',
        data_nascimento: dataFormatada,
      });

      await api.put('/jogador/experiencia', { exp_basq: valores.experiencia });

      navigation.navigate('TelaSemanas');
    } catch (erro) {
      Alert.alert('Erro', erro.response?.data?.mensagem || 'Não foi possível salvar o formulário.');
    }
  }

  return (
    <GradientWrapper style={estilos.container}>
      <ScrollView contentContainerStyle={estilos.scroll}>
        <View style={estilos.card}>
          <View style={estilos.headerForm}>
            <Text style={estilos.tituloForm}>Formulário</Text>
            <Image source={require('../../assets/basquete.png')} style={estilos.miniLogo} />
          </View>

          <Text style={estilos.subtitulo}>
            Responda esse formulário para preencher seus dados pessoais e para reconhecermos seu nível de experiência no esporte
          </Text>

          <Formik
            initialValues={{ nome: '', dataNascimento: '', experiencia: 'iniciante' }}
            validationSchema={schema}
            onSubmit={enviarFormulario}
          >
            {({ handleSubmit, handleBlur, setFieldValue, values, errors, touched, isSubmitting }) => (
              <View>
                <Text style={estilos.label}>Nome</Text>
                <TextInput
                  style={[estilos.input, touched.nome && errors.nome && estilos.inputErro]}
                  placeholder="Digite seu nome"
                  value={values.nome}
                  onChangeText={(texto) => setFieldValue('nome', texto)}
                  onBlur={handleBlur('nome')}
                />
                {touched.nome && errors.nome && (
                  <Text style={estilos.textoErro}>{errors.nome}</Text>
                )}

                <Text style={estilos.label}>Data de nascimento</Text>
                <TextInput
                  style={[estilos.input, touched.dataNascimento && errors.dataNascimento && estilos.inputErro]}
                  placeholder="DD/MM/AAAA"
                  value={values.dataNascimento}
                  onChangeText={(texto) => setFieldValue('dataNascimento', mascaraData(texto))}
                  onBlur={handleBlur('dataNascimento')}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {touched.dataNascimento && errors.dataNascimento && (
                  <Text style={estilos.textoErro}>{errors.dataNascimento}</Text>
                )}

                <Text style={estilos.label}>Experiência</Text>
                <TouchableOpacity
                  style={estilos.dropdown}
                  onPress={() => setAberto(!aberto)}
                  activeOpacity={0.7}
                >
                  <Text style={estilos.textoDropdown}>
                    {opcoes.find(o => o.valor === values.experiencia)?.label || 'Iniciante'}
                  </Text>
                  <Text style={estilos.setinha}>▼</Text>
                </TouchableOpacity>

                {aberto && (
                  <View style={estilos.listaOpcoes}>
                    {opcoes.map((item) => (
                      <TouchableOpacity
                        key={item.valor}
                        style={estilos.opcaoItem}
                        onPress={() => {
                          setFieldValue('experiencia', item.valor);
                          setAberto(false);
                        }}
                      >
                        <Text style={estilos.textoOpcao}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[estilos.botao, isSubmitting && estilos.botaoDesabilitado]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <ActivityIndicator color={CORES.branco} />
                    : <Text style={estilos.textoBotao}>Enviar</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  card: { backgroundColor: CORES.branco, borderRadius: 20, padding: 20, width: '90%' },
  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloForm: { fontSize: 28, fontWeight: 'bold' },
  miniLogo: { width: 50, height: 50 },
  subtitulo: { fontSize: 13, marginVertical: 15, textAlign: 'justify' },
  label: { fontWeight: 'bold', marginTop: 15 },
  input: { backgroundColor: CORES.cinzaClaro, borderRadius: 5, padding: 12, marginTop: 5 },
  inputErro: { borderWidth: 1, borderColor: CORES.erro },
  textoErro: { color: CORES.erro, fontSize: 12, marginTop: 4 },
  dropdown: { backgroundColor: CORES.cinzaClaro, borderRadius: 5, padding: 12, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoDropdown: { fontSize: 14, color: CORES.textoEscuro },
  setinha: { fontSize: 12, color: CORES.textoDesabilitado },
  listaOpcoes: { backgroundColor: '#EBEBEB', borderBottomLeftRadius: 5, borderBottomRightRadius: 5, marginTop: -2, borderWidth: 1, borderColor: CORES.cinzaClaro },
  opcaoItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: CORES.cinzaClaro },
  textoOpcao: { fontSize: 14 },
  botao: { backgroundColor: CORES.primaria, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 50, alignItems: 'center', alignSelf: 'center', marginTop: 30, marginBottom: 10 },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { color: CORES.branco, fontWeight: 'bold', fontSize: 18 },
});