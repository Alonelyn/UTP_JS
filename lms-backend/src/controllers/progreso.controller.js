const Progreso = require('../models/progreso.model');

const marcarLeccionCompletada = async (req, res) => {
  try {
    const { usuario_id, leccion_id } = req.body;

    if (!usuario_id || !leccion_id) {
      return res.status(400).json({
        mensaje: 'usuario_id y leccion_id son obligatorios'
      });
    }

    const progreso = await Progreso.marcarCompletada({
      usuario_id,
      leccion_id
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

module.exports = {
  marcarLeccionCompletada,
  obtenerProgresoCurso
};