const express = require('express');
const router = express.Router();

const {
  marcarLeccionCompletada,
  obtenerProgresoCurso,
  obtenerRutaCurso
} = require('../controllers/progreso.controller');

const { verificarToken } = require('../middleware/auth');

router.get(
  '/ruta/:cursoId',
  verificarToken,
  obtenerRutaCurso
);

router.get(
  '/:usuarioId/:cursoId',
  verificarToken,
  obtenerProgresoCurso
);

router.post(
  '/',
  verificarToken,
  marcarLeccionCompletada
);

module.exports = router;