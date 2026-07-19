const Leccion = require('../models/leccion.model');

const listarLecciones = async (req, res) => {
  try {
    const lecciones = await Leccion.listar();
    res.json(lecciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar lecciones', error: error.message });
  }
};

const buscarLeccion = async (req, res) => {
  try {
    const leccion = await Leccion.buscarPorId(req.params.id);

    if (!leccion) {
      return res.status(404).json({
        mensaje: 'Lección no encontrada'
      });
    }

    if (req.usuario.rol === 'estudiante') {
      const acceso = await Progreso.verificarAccesoLeccion(
        req.usuario.id,
        leccion.id
      );

      if (!acceso.permitido) {
        return res.status(403).json({
          mensaje: acceso.motivo ||
            'Esta lección todavía está bloqueada',
          bloqueada: true,
          leccion_anterior: acceso.leccionAnterior || null
        });
      }
    }

    res.json(leccion);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al buscar lección',
      error: error.message
    });
  }
};

const crearLeccion = async (req, res) => {
  try {
    const leccion = await Leccion.crear(req.body);
    res.status(201).json(leccion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear lección', error: error.message });
  }
};

const actualizarLeccion = async (req, res) => {
  try {
    const leccion = await Leccion.actualizar(req.params.id, req.body);

    if (!leccion) {
      return res.status(404).json({ mensaje: 'Lección no encontrada' });
    }

    res.json(leccion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar lección', error: error.message });
  }
};

const eliminarLeccion = async (req, res) => {
  try {
    const leccion = await Leccion.eliminar(req.params.id);

    if (!leccion) {
      return res.status(404).json({ mensaje: 'Lección no encontrada' });
    }

    res.json({ mensaje: 'Lección eliminada', leccion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar lección', error: error.message });
  }
};

module.exports = {
  listarLecciones,
  buscarLeccion,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion
};