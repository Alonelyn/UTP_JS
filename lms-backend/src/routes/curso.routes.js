const express = require('express');
const router = express.Router();

const {
  listarCursosPublicados,
  listarTodosLosCursos,
  listarMisCursos,
  buscarCurso,
  crearCurso,
  actualizarCurso,
  eliminarCurso
} = require('../controllers/curso.controller');

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

/**
 * Catálogo para estudiantes.
 * Solo muestra cursos publicados.
 */
router.get(
  '/',
  verificarToken,
  listarCursosPublicados
);

/**
 * Todos los cursos.
 * Solo administrador.
 */
router.get(
  '/todos',
  verificarToken,
  requiereRol('admin'),
  listarTodosLosCursos
);

/**
 * Cursos creados por el instructor autenticado.
 *
 * Esta ruta debe ir antes de /:id.
 */
router.get(
  '/mis-cursos',
  verificarToken,
  requiereRol('instructor'),
  listarMisCursos
);

/**
 * Buscar curso por ID.
 */
router.get(
  '/:id',
  verificarToken,
  buscarCurso
);

/**
 * Crear curso.
 */
router.post(
  '/',
  verificarToken,
  requiereRol('instructor', 'admin'),
  crearCurso
);

/**
 * Actualizar curso.
 */
router.put(
  '/:id',
  verificarToken,
  requiereRol('instructor', 'admin'),
  actualizarCurso
);

/**
 * Eliminar curso.
 */
router.delete(
  '/:id',
  verificarToken,
  requiereRol('instructor', 'admin'),
  eliminarCurso
);

module.exports = router;