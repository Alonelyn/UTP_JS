const Inscripcion = require('../models/inscripcion.model');

const listarInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.listar();
    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar inscripciones', error: error.message });
  }
};

const buscarInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.buscarPorId(req.params.id);

    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
    }

    res.json(inscripcion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar inscripción', error: error.message });
  }
};

const crearInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.crear(req.body);
    res.status(201).json(inscripcion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear inscripción', error: error.message });
  }
};

const actualizarInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.actualizar(req.params.id, req.body);

    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
    }

    res.json(inscripcion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar inscripción', error: error.message });
  }
};

const eliminarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    await Inscripcion.eliminar(id);

    res.json({ mensaje: 'Inscripción revocada correctamente' });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al revocar inscripción',
      error: error.message
    });
  }
};

module.exports = {
  listarInscripciones,
  buscarInscripcion,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
};