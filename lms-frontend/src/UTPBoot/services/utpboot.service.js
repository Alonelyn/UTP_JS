import api from '../../api/axios';

const UTPBootService = {
  analizarLeccion: async (datos) => {
    const response = await api.post('/ia/analizar-leccion', datos);
    return response.data;
  },

  enviarMensaje: async (datos) => {
    const response = await api.post('/ia/chat', datos);
    return response.data;
  },

  /*
  obtenerHistorial: async (usuarioId, leccionId) => {
    const response = await api.get(
      `/ia/historial/${usuarioId}?leccion_id=${leccionId}`
    );

    return response.data;
  },

  eliminarHistorial: async (usuarioId, leccionId) => {
    const response = await api.delete(
      `/ia/historial/${usuarioId}?leccion_id=${leccionId}`
    );

    return response.data;
  }*/
};

export default UTPBootService;