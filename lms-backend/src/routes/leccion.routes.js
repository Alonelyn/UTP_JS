const express = require('express');
const router = express.Router();

const {
  listarLecciones,
  buscarLeccion,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion
} = require('../controllers/leccion.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

// Lectura pública (alumnos acceden sin token para ver el catálogo)
router.get('/',    listarLecciones);
router.get('/:id', buscarLeccion);

// Escritura — solo instructores o administradores
router.post('/',      verificarToken, requiereRol('instructor', 'admin'), crearLeccion);
router.put('/:id',    verificarToken, requiereRol('instructor', 'admin'), actualizarLeccion);
router.delete('/:id', verificarToken, requiereRol('instructor', 'admin'), eliminarLeccion);

module.exports = router;