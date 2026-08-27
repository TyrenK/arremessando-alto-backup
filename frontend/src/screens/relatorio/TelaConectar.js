import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import GradientWrapper from '../../components/GradientWrapper';
import NavegacaoInferior from '../../components/NavegacaoInferior';
import MQTTService from '../../services/mqttService';
import StatusModal from '../../components/StatusModal';
import LightControl from '../../components/LightControl';
import Gauges from '../../components/Gauges';
import api from '../../config/api';

const mqtt = new MQTTService();

const { mqttHost, mqttPort, mqttPath, mqttUser, mqttPass } =
  Constants.expoConfig.extra;

export default function TelaConectar({ navigation, route }) {
  const { totalArremessos, totalTempo } = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSensorOn, setIsSensorOn] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(totalTempo * 60);
  const [treinoAtivo, setTreinoAtivo] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [motivoFim, setMotivoFim] = useState(null);

  const acertosRef = useRef(0);
  const treinoAtivoRef = useRef(true);

  const mqttConfig = {
    host: mqttHost,
    port: parseInt(mqttPort),
    path: mqttPath,
    user: mqttUser,
    pass: mqttPass,
    clientId: 'RN_App_' + Math.random(),
  };

  useEffect(() => {
    startConnection();
    return () => mqtt.client?.disconnect();
  }, []);

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'arremesso/acerto' && treinoAtivoRef.current) {
          if (message === '1') {
            setIsSensorOn(true);
            acertosRef.current += 1;
            setAcertos(acertosRef.current);
          }
        }
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('arremesso/acerto');
      },
      () => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  useEffect(() => {
    if (isSensorOn) {
      const timer = setTimeout(() => setIsSensorOn(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSensorOn]);

  useEffect(() => {
    if (!treinoAtivo) return;

    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setMotivoFim('tempo');
          encerrarTreino();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [treinoAtivo]);

  useEffect(() => {
    if (treinoAtivo && acertos > 0 && acertos >= totalArremessos) {
      setMotivoFim('completo');
      encerrarTreino();
    }
  }, [acertos]);

  const encerrarTreino = () => {
    treinoAtivoRef.current = false;
    setTreinoAtivo(false);
    setShowEndModal(true);
  };

  const salvarSessao = async (totalFinal) => {
    const aproveitamento = Math.round((acertosRef.current / totalFinal) * 100);
    const segundosUsados = totalTempo * 60 - tempoRestante;
    const minutos = Math.floor(segundosUsados / 60);
    const segundos = segundosUsados % 60;
    const tempo = `${minutos}:${String(segundos).padStart(2, '0')}`;

    try {
      await api.post('/aproveitamento', {
        tentativas: totalFinal,
        acertos: acertosRef.current,
        tempo,
      });
    } catch (erro) {
      console.error('Erro ao salvar sessão:', erro);
    }

    setShowEndModal(false);
    navigation.navigate('TelaPrincipalRelatorio');
  };

  const porcentagemAcertos = totalArremessos > 0
    ? Math.round((acertos / totalArremessos) * 100)
    : 0;

  const porcentagemTempo = Math.round((tempoRestante / (totalTempo * 60)) * 100);

  const formatarTempo = (seg) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <GradientWrapper style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.scroll}>

        <Text style={estilos.titulo}>Treino em Andamento</Text>
        <Text style={estilos.subtitulo}>
          {acertos} / {totalArremessos} acertos
        </Text>

        <LightControl isLightOn={isSensorOn} />

        <Gauges
          scores={porcentagemAcertos}
          tempoRestante={porcentagemTempo}
          tempoLabel={formatarTempo(tempoRestante)}
        />

        <TouchableOpacity
          style={estilos.btnEncerrar}
          onPress={() => {
            setMotivoFim('manual');
            encerrarTreino();
          }}
        >
          <Text style={estilos.textoBotao}>Encerrar Treino</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de fim de treino */}
      <Modal visible={showEndModal} transparent animationType="fade">
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <Text style={estilos.modalTitulo}>Treino Encerrado</Text>

            {motivoFim === 'completo' ? (
              <>
                <Text style={estilos.modalTexto}>
                  Parabéns! Você completou todos os {totalArremessos} arremessos com {acertos} acertos.
                </Text>
                <TouchableOpacity
                  style={estilos.btnConfirmar}
                  onPress={() => salvarSessao(totalArremessos)}
                >
                  <Text style={estilos.textoBotao}>Salvar e ver histórico</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={estilos.modalTexto}>
                  Você realizou todos os {totalArremessos} arremessos planejados?
                </Text>
                <TouchableOpacity
                  style={estilos.btnConfirmar}
                  onPress={() => salvarSessao(totalArremessos)}
                >
                  <Text style={estilos.textoBotao}>Sim, salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.btnAjustar}
                  onPress={() => salvarSessao(acertosRef.current)}
                >
                  <Text style={estilos.textoBotao}>
                    Não, arremessei apenas {acertos}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />

      <NavegacaoInferior />
    </GradientWrapper>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  scroll: { padding: 24, alignItems: 'center', paddingBottom: 100 },
  titulo: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 4 },
  subtitulo: { color: '#FFF', fontSize: 18, marginBottom: 30, opacity: 0.8 },
  btnEncerrar: {
    backgroundColor: '#700000', padding: 16,
    borderRadius: 12, width: '100%',
    alignItems: 'center', marginTop: 20,
  },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#3a0000', padding: 30,
    borderRadius: 20, width: '85%', alignItems: 'center',
    borderWidth: 1, borderColor: '#700000',
  },
  modalTitulo: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalTexto: { color: '#FFB3B3', textAlign: 'center', marginBottom: 24, fontSize: 15 },
  btnConfirmar: {
    backgroundColor: '#700000', padding: 14,
    borderRadius: 12, width: '100%', marginBottom: 12, alignItems: 'center',
  },
  btnAjustar: {
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 14,
    borderRadius: 12, width: '100%', alignItems: 'center',
  },
});