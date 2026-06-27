import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

let iniciarCargaGlobal = null;
let finalizarCargaGlobal = null;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const conectarLoader = ({ iniciarCarga, finalizarCarga }) => {
  iniciarCargaGlobal = iniciarCarga;
  finalizarCargaGlobal = finalizarCarga;
};

api.interceptors.request.use(
  (config) => {
    if (iniciarCargaGlobal) iniciarCargaGlobal();
    return config;
  },
  (error) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();
    return response;
  },
  (error) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();
    return Promise.reject(error);
  }
);

export default api;