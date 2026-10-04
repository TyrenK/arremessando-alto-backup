import init from 'react_native_mqtt';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

export default class MQTTService {
  constructor() {
    this.client = null;
    this.topics = [];
  }

  connect(config, onMessage, onConnect, onFailure) {
    const { host, port, path, user, pass, clientId } = config;

    this.client = new Paho.MQTT.Client(host, port, path, clientId);

    this.client.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    // Sem isso, uma queda de conexão passa despercebida: o cliente não
    // reconecta e não reassina os tópicos sozinho.
    this.client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('Conexão MQTT perdida:', responseObject.errorMessage);
      }
      onFailure(responseObject);

      // Tenta reconectar depois de um tempo
      setTimeout(() => {
        this.connect(config, onMessage, onConnect, onFailure);
      }, 3000);
    };

    const options = {
      userName: user,
      password: pass,
      useSSL: true,
      onSuccess: () => {
        // Reassina automaticamente tudo que já foi inscrito antes,
        // incluindo depois de uma reconexão.
        this.topics.forEach((topic) => this.client.subscribe(topic));
        onConnect();
      },
      onFailure: onFailure,
      timeout: 3,
      keepAliveInterval: 60,
    };

    this.client.connect(options);
  }

  subscribe(topic) {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic);
    }
    if (this.client?.isConnected()) {
      this.client.subscribe(topic);
    }
  }

  publish(topic, message) {
    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    this.client.send(msg);
  }
}