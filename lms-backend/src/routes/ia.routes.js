const express = require('express');
const router = express.Router();

const {
  chatIA,
  analizarLeccion
} = require('../controllers/ia.controller');

const {
  listarHistorial,
  borrarHistorial
} = require('../controllers/iaHistorial.controller');

router.post('/chat', chatIA);

router.post(
  '/analizar-leccion',
  analizarLeccion
);

router.get(
  '/historial/:usuarioId',
  listarHistorial
);

router.delete(
  '/historial/:usuarioId',
  borrarHistorial
);

module.exports = router;