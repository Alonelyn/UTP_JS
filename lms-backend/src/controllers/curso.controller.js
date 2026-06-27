const Curso = require('../models/curso.model');

const listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.listar();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar cursos', error: error.message });
  }
};

const buscarCurso = async (req, res) => {
  try {
    const curso = await Curso.buscarPorId(req.params.id);

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    res.json(curso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar curso', error: error.message });
  }
};

const crearCurso = async (req, res) => {
  try {
    const curso = await Curso.crear(req.body);
    res.status(201).json(curso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear curso', error: error.message });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    const curso = await Curso.actualizar(req.params.id, req.body);

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    res.json(curso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar curso', error: error.message });
  }
};

const eliminarCurso = async (req, res) => {
  try {
    const curso = await Curso.eliminar(req.params.id);

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    res.json({ mensaje: 'Curso eliminado', curso });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar curso', error: error.message });
  }
};

module.exports = {
  listarCursos,
  buscarCurso,
  crearCurso,
  actualizarCurso,
  eliminarCurso
};