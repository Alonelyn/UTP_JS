const express = require('express');
const router = express.Router();

const {
  marcarLeccionCompletada,
  obtenerProgresoCurso
} = require('../controllers/progreso.controller');

router.post('/', marcarLeccionCompletada);
router.get('/:usuarioId/:cursoId', obtenerProgresoCurso);

module.exports = router;