const Progreso = require('../models/progreso.model');

const marcarLeccionCompletada = async (req, res) => {
  try {
    const { usuario_id, leccion_id, tiempo_activo } = req.body;

    if (!usuario_id || !leccion_id) {
      return res.status(400).json({
        mensaje: 'usuario_id y leccion_id son obligatorios'
      });
    }

    // Validar tiempo mínimo contra lo almacenado en la lección
    const duracionMinima = await Progreso.obtenerDuracionMinima(leccion_id);

    if (duracionMinima !== null && duracionMinima > 0) {
      const tiempoEnviado = parseInt(tiempo_activo) || 0;
      if (tiempoEnviado < duracionMinima) {
        return res.status(400).json({
          mensaje: 'Tiempo insuficiente para completar la lección',
          tiempo_activo: tiempoEnviado,
          duracion_minima: duracionMinima,
          faltante: duracionMinima - tiempoEnviado
        });
      }
    }

    const progreso = await Progreso.marcarCompletada({
      usuario_id,
      leccion_id,
      tiempo_activo: parseInt(tiempo_activo) || 0
    });

    res.status(201).json(progreso);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al marcar progreso',
      error: error.message
    });
  }
};

const obtenerProgresoCurso = async (req, res) => {
  try {
    const { usuarioId, cursoId } = req.params;

    const progreso = await Progreso.obtenerProgresoCurso(usuarioId, cursoId);

    const total = progreso.length;
    const completadas = progreso.filter((p) => p.completado).length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

    res.json({
      total,
      completadas,
      porcentaje,
      lecciones: progreso
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener progreso',
      error: error.message
    });
  }
};

const obtenerRutaCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const ruta = await Progreso.obtenerRutaConBloqueos(
      req.usuario.id,
      cursoId
    );

    res.json({
      curso_id: Number(cursoId),
      lecciones: ruta
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener la ruta del curso',
      error: error.message
    });
  }
};

module.exports = {
  marcarLeccionCompletada,
  obtenerProgresoCurso,
  obtenerRutaCurso
};