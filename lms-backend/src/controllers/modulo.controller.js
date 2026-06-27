const Modulo = require('../models/modulo.model');

const listarModulos = async (req, res) => {
  try {
    const modulos = await Modulo.listar();
    res.json(modulos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar módulos', error: error.message });
  }
};

const buscarModulo = async (req, res) => {
  try {
    const modulo = await Modulo.buscarPorId(req.params.id);

    if (!modulo) {
      return res.status(404).json({ mensaje: 'Módulo no encontrado' });
    }

    res.json(modulo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar módulo', error: error.message });
  }
};

const crearModulo = async (req, res) => {
  try {
    const modulo = await Modulo.crear(req.body);
    res.status(201).json(modulo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear módulo', error: error.message });
  }
};

const actualizarModulo = async (req, res) => {
  try {
    const modulo = await Modulo.actualizar(req.params.id, req.body);

    if (!modulo) {
      return res.status(404).json({ mensaje: 'Módulo no encontrado' });
    }

    res.json(modulo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar módulo', error: error.message });
  }
};

const eliminarModulo = async (req, res) => {
  try {
    const modulo = await Modulo.eliminar(req.params.id);

    if (!modulo) {
      return res.status(404).json({ mensaje: 'Módulo no encontrado' });
    }

    res.json({ mensaje: 'Módulo eliminado', modulo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar módulo', error: error.message });
  }
};

module.exports = {
  listarModulos,
  buscarModulo,
  crearModulo,
  actualizarModulo,
  eliminarModulo
};