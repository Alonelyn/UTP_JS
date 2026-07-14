const express = require('express');
const router = express.Router();

const {
  listarModulos,
  buscarModulo,
  crearModulo,
  actualizarModulo,
  eliminarModulo
} = require('../controllers/modulo.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

// Lectura pública
router.get('/',    listarModulos);
router.get('/:id', buscarModulo);

// Escritura — solo instructores o administradores
router.post('/',      verificarToken, requiereRol('instructor', 'admin'), crearModulo);
router.put('/:id',    verificarToken, requiereRol('instructor', 'admin'), actualizarModulo);
router.delete('/:id', verificarToken, requiereRol('instructor', 'admin'), eliminarModulo);

module.exports = router;