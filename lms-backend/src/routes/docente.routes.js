const express = require('express');

const {
  listarAlumnos
} = require('../controllers/docente.controller');

const {
  verificarToken,
  requiereRol
} = require('../middleware/auth');

const router = express.Router();

router.get(
  '/alumnos',
  verificarToken,
  requiereRol('instructor', 'admin'),
  listarAlumnos
);

module.exports = router;