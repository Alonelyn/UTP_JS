const Curso = require('../models/curso.model');

/**
 * Catálogo del estudiante.
 * Solo devuelve cursos publicados.
 */
const listarCursosPublicados = async (req, res) => {
  try {
    const cursos = await Curso.listarPublicados();

    res.json(cursos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar cursos publicados',
      error: error.message
    });
  }
};

/**
 * Lista completa para administradores.
 */
const listarTodosLosCursos = async (req, res) => {
  try {
    const cursos = await Curso.listarTodos();

    res.json(cursos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar todos los cursos',
      error: error.message
    });
  }
};

/**
 * Cursos pertenecientes al instructor autenticado.
 */
const listarMisCursos = async (req, res) => {
  try {
    const cursos = await Curso.listarPorInstructor(req.usuario.id);

    res.json(cursos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar los cursos del instructor',
      error: error.message
    });
  }
};

/**
 * Obtiene un curso por ID.
 */
const buscarCurso = async (req, res) => {
  try {
    const curso = await Curso.buscarPorId(req.params.id);

    if (!curso) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado'
      });
    }

    res.json(curso);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al buscar curso',
      error: error.message
    });
  }
};

/**
 * Crea un curso usando el ID obtenido del token.
 */
const crearCurso = async (req, res) => {
  try {
    const {
      titulo,
      slug,
      descripcion,
      precio,
      nivel,
      estado
    } = req.body;

    if (!titulo?.trim() || !slug?.trim()) {
      return res.status(400).json({
        mensaje: 'El título y el slug son obligatorios'
      });
    }

    const estadosPermitidos = [
      'borrador',
      'publicado',
      'archivado'
    ];

    if (estado && !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado de curso inválido'
      });
    }

    const datosCurso = {
      titulo: titulo.trim(),
      slug: slug.trim(),
      descripcion: descripcion?.trim() || '',
      precio: Number(precio) || 0,
      nivel: nivel || 'principiante',
      estado: estado || 'borrador',

      // Este ID viene del JWT, no del frontend.
      instructor_id: req.usuario.id
    };

    const curso = await Curso.crear(datosCurso);

    res.status(201).json(curso);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Ya existe un curso con ese slug'
      });
    }

    res.status(500).json({
      mensaje: 'Error al crear curso',
      error: error.message
    });
  }
};

/**
 * Actualiza un curso validando propiedad.
 */
const actualizarCurso = async (req, res) => {
  try {
    const cursoActual = await Curso.buscarPorId(req.params.id);

    if (!cursoActual) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado'
      });
    }

    const instructorId = Number(cursoActual.instructor_id);
    const usuarioId = Number(req.usuario.id);

    const esPropietario = instructorId === usuarioId;
    const esAdmin = req.usuario.rol === 'admin';

    if (!esPropietario && !esAdmin) {
      return res.status(403).json({
        mensaje: 'No tienes permiso para modificar este curso'
      });
    }

    const datosActualizados = {
      titulo: req.body.titulo ?? cursoActual.titulo,
      slug: req.body.slug ?? cursoActual.slug,
      descripcion:
        req.body.descripcion ?? cursoActual.descripcion,
      precio:
        req.body.precio ?? cursoActual.precio,
      nivel:
        req.body.nivel ?? cursoActual.nivel,
      estado:
        req.body.estado ?? cursoActual.estado
    };

    const curso = await Curso.actualizar(
      req.params.id,
      datosActualizados
    );

    res.json(curso);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Ya existe otro curso con ese slug'
      });
    }

    res.status(500).json({
      mensaje: 'Error al actualizar curso',
      error: error.message
    });
  }
};

/**
 * Elimina un curso validando propiedad.
 */
const eliminarCurso = async (req, res) => {
  try {
    const cursoActual = await Curso.buscarPorId(req.params.id);

    if (!cursoActual) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado'
      });
    }

    const instructorId = Number(cursoActual.instructor_id);
    const usuarioId = Number(req.usuario.id);

    const esPropietario = instructorId === usuarioId;
    const esAdmin = req.usuario.rol === 'admin';

    if (!esPropietario && !esAdmin) {
      return res.status(403).json({
        mensaje: 'No tienes permiso para eliminar este curso'
      });
    }

    const curso = await Curso.eliminar(req.params.id);

    res.json({
      mensaje: 'Curso eliminado correctamente',
      curso
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar curso',
      error: error.message
    });
  }
};

module.exports = {
  listarCursosPublicados,
  listarTodosLosCursos,
  listarMisCursos,
  buscarCurso,
  crearCurso,
  actualizarCurso,
  eliminarCurso
};