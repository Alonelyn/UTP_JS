const express = require('express');
const router = express.Router();

const {
  listarInscripciones,
  listarMisInscripciones,
  verificarAccesoCurso,
  buscarInscripcion,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
} = require('../controllers/inscripcion.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

// Todas las operaciones de inscripción requieren autenticación
router.get('/',       verificarToken, listarInscripciones);
router.get('/mis-cursos',verificarToken,listarMisInscripciones);
router.get('/verificar/:cursoId',verificarToken,verificarAccesoCurso);
router.get('/:id',    verificarToken, buscarInscripcion);
router.post('/',      verificarToken, crearInscripcion);
router.put('/:id',    verificarToken, requiereRol('admin'), actualizarInscripcion);
router.delete('/:id', verificarToken, requiereRol('admin'), eliminarInscripcion);

module.exports = router;