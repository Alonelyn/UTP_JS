const express = require('express');
const router = express.Router();

const {
  marcarLeccionCompletada,
  registrarTiempo,
  obtenerProgresoCurso,
  obtenerRutaCurso
} = require('../controllers/progreso.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

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

router.post(
  '/tiempo',
  verificarToken,
  requiereRol('estudiante'),
  registrarTiempo
);

module.exports = router;