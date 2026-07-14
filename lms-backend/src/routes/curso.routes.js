const express = require('express');
const router = express.Router();

const {
  listarCursos,
  buscarCurso,
  crearCurso,
  actualizarCurso,
  eliminarCurso
} = require('../controllers/curso.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

// Lectura pública (catálogo de cursos visible sin login)
router.get('/',    listarCursos);
router.get('/:id', buscarCurso);

// Escritura — solo instructores o administradores
router.post('/',      verificarToken, requiereRol('instructor', 'admin'), crearCurso);
router.put('/:id',    verificarToken, requiereRol('instructor', 'admin'), actualizarCurso);
router.delete('/:id', verificarToken, requiereRol('admin'), eliminarCurso);

module.exports = router;