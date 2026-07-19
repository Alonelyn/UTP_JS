const express = require('express');
const router = express.Router();

const {
  listarLecciones,
  buscarLeccion,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion
} = require('../controllers/leccion.controller');

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

router.get(
  '/',
  verificarToken,
  listarLecciones
);

router.get(
  '/:id',
  verificarToken,
  buscarLeccion
);

router.post(
  '/',
  verificarToken,
  requiereRol('instructor', 'admin'),
  crearLeccion
);

router.put(
  '/:id',
  verificarToken,
  requiereRol('instructor', 'admin'),
  actualizarLeccion
);

router.delete(
  '/:id',
  verificarToken,
  requiereRol('instructor', 'admin'),
  eliminarLeccion
);

module.exports = router;