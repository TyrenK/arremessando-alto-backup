import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import CORES from '../styles/cores';

export default function Gauges({ scores, tempoRestante, tempoLabel }) {
  return (
    <View style={estilos.row}>
      <View style={estilos.gaugeBox}>
        <CircularProgress
          value={tempoRestante}
          radius={60}
          activeStrokeColor={CORES.primaria}
          inActiveStrokeColor={'rgba(255,255,255,0.1)'}
          textColor={CORES.branco}
          title={tempoLabel}
          titleColor={CORES.branco}
          titleStyle={estilos.tituloGauge}
          showProgressValue={false}
        />
        <Text style={estilos.label}>Tempo Restante</Text>
      </View>

      <View style={estilos.gaugeBox}>
        <CircularProgress
          value={scores}
          radius={60}
          title={'%'}
          titleColor={CORES.branco}
          activeStrokeColor={CORES.sucesso}
          inActiveStrokeColor={'rgba(255,255,255,0.1)'}
          textColor={CORES.branco}
        />
        <Text style={estilos.label}>Aproveitamento</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gaugeBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '48%',
  },
  tituloGauge: {
    fontSize: 14,
  },
  label: {
    color: CORES.branco,
    marginTop: 10,
    fontSize: 14,
  },
});