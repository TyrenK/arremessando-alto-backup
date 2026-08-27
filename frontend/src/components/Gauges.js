import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function Gauges({ scores, tempoRestante, tempoLabel }) {
  return (
    <View style={estilos.row}>
      <View style={estilos.gaugeBox}>
        <CircularProgress
          value={tempoRestante}
          radius={60}
          activeStrokeColor={'#700000'}
          inActiveStrokeColor={'rgba(255,255,255,0.1)'}
          textColor={'#FFF'}
          title={tempoLabel}
          titleColor={'#FFF'}
          titleStyle={{ fontSize: 14 }}
          showProgressValue={false}
        />
        <Text style={estilos.label}>Tempo Restante</Text>
      </View>

      <View style={estilos.gaugeBox}>
        <CircularProgress
          value={scores}
          radius={60}
          title={'%'}
          titleColor={'#FFF'}
          activeStrokeColor={'#2ECC71'}
          inActiveStrokeColor={'rgba(255,255,255,0.1)'}
          textColor={'#FFF'}
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
  label: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 14,
  },
});