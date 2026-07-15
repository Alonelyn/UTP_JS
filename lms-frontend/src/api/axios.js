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

// ── REQUEST: adjuntar token JWT en cada petición ──────────────
api.interceptors.request.use(
  (config) => {
    if (iniciarCargaGlobal) iniciarCargaGlobal();

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();
    return Promise.reject(error);
  }
);

// ── RESPONSE: manejar 401/403 (token expirado o inválido) ─────
api.interceptors.response.use(
  (response) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();
    return response;
  },
  (error) => {
    if (finalizarCargaGlobal) finalizarCargaGlobal();

    // Si el token expiró o es inválido, limpiar sesión y redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      const esTokenExpirado = error.response?.data?.mensaje?.includes('expirado') ||
                              error.response?.data?.mensaje?.includes('inválido');

      if (esTokenExpirado) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;