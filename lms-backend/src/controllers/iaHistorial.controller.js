const IaHistorial = require('../models/iaHistorial.model');

const listarHistorial = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const cursoId = req.query.cursoId
      ? Number(req.query.cursoId)
      : null;
    const leccionId = req.query.leccionId
      ? Number(req.query.leccionId)
      : null;

    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({
        mensaje: 'El usuario indicado no es válido'
      });
    }

    const historial = await IaHistorial.obtenerHistorial({
      usuarioId,
      cursoId,
      leccionId,
      limite: 50
    });

    return res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial IA:', error);

    return res.status(500).json({
      mensaje: 'No se pudo obtener el historial',
      error: error.message
    });
  }
};

const borrarHistorial = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const cursoId = req.query.cursoId
      ? Number(req.query.cursoId)
      : null;
    const leccionId = req.query.leccionId
      ? Number(req.query.leccionId)
      : null;

    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({
        mensaje: 'El usuario indicado no es válido'
      });
    }

    const eliminados = await IaHistorial.eliminarHistorial({
      usuarioId,
      cursoId,
      leccionId
    });

    return res.json({
      mensaje: 'Historial eliminado correctamente',
      eliminados
    });
  } catch (error) {
    console.error('Error al eliminar historial IA:', error);

    return res.status(500).json({
      mensaje: 'No se pudo eliminar el historial',
      error: error.message
    });
  }
};

module.exports = {
  listarHistorial,
  borrarHistorial
};