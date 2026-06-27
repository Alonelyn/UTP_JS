const express = require('express');
const router = express.Router();

const {
  listarInscripciones,
  buscarInscripcion,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
} = require('../controllers/inscripcion.controller');

router.get('/', listarInscripciones);
router.get('/:id', buscarInscripcion);
router.post('/', crearInscripcion);
router.put('/:id', actualizarInscripcion);
router.delete('/:id', eliminarInscripcion);

module.exports = router;