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
    const cursoId = Number(req.body.curso_id);

    if (!cursoId) {
      return res.status(400).json({
        mensaje: 'El curso es obligatorio'
      });
    }

    const usuarioId =
      req.usuario.rol === 'admin' &&
      req.body.usuario_id
        ? Number(req.body.usuario_id)
        : Number(req.usuario.id);

    const existente =
      await Inscripcion.buscarPorUsuarioYCurso(
        usuarioId,
        cursoId
      );

    if (existente) {
      return res.status(409).json({
        mensaje: 'El usuario ya está inscrito en este curso',
        inscripcion: existente
      });
    }

    const inscripcion = await Inscripcion.crear({
      usuario_id: usuarioId,
      curso_id: cursoId
    });

    res.status(201).json(inscripcion);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear inscripción',
      error: error.message
    });
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

const verificarAccesoCurso = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const cursoId = req.params.cursoId;

    if (!cursoId?.trim()) {
      return res.status(400).json({
        mensaje: 'ID de curso inválido',
        tieneAcceso: false
      });
    }

    if (req.usuario.rol === 'admin') {
      return res.json({
        tieneAcceso: true,
        motivo: 'administrador'
      });
    }

    if (req.usuario.rol === 'estudiante') {
      const inscripcion =
        await Inscripcion.buscarPorUsuarioYCurso(
          usuarioId,
          cursoId
        );

      return res.json({
        tieneAcceso: Boolean(inscripcion),
        motivo: inscripcion
          ? 'inscrito'
          : 'sin_inscripcion',
        inscripcion: inscripcion || null
      });
    }

    return res.json({
      tieneAcceso: false,
      motivo: 'rol_no_autorizado'
    });
  } catch (error) {
    console.error(
      'Error al verificar acceso al curso:',
      error
    );

    res.status(500).json({
      mensaje: 'Error al verificar acceso al curso',
      tieneAcceso: false,
      error: error.message
    });
  }
};

const listarMisInscripciones = async (req, res) => {
  try {
    const inscripciones =
      await Inscripcion.listarPorUsuario(req.usuario.id);

    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar tus cursos',
      error: error.message
    });
  }
};

module.exports = {
  listarInscripciones,
  listarMisInscripciones,
  verificarAccesoCurso,
  buscarInscripcion,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
};