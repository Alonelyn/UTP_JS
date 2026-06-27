const express = require('express');
const router = express.Router();

const {
  listarLecciones,
  buscarLeccion,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion
} = require('../controllers/leccion.controller');

router.get('/', listarLecciones);
router.get('/:id', buscarLeccion);
router.post('/', crearLeccion);
router.put('/:id', actualizarLeccion);
router.delete('/:id', eliminarLeccion);

module.exports = router;