import axios from 'axios';
import { pegarToken } from './storage';

const api = axios.create({
  baseURL: 'http://172.17.1.197:3000',
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await pegarToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;