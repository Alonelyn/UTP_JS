const express = require('express');
const router = express.Router();

const {
  marcarLeccionCompletada,
  obtenerProgresoCurso
} = require('../controllers/progreso.controller');

const { verificarToken } = require('../middleware/auth');

// Leer progreso — requiere autenticación
router.get('/:usuarioId/:cursoId', verificarToken, obtenerProgresoCurso);

// Marcar completada — requiere autenticación (validación principal anti-fraude)
router.post('/', verificarToken, marcarLeccionCompletada);

module.exports = router;