const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  buscarUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuario.controller');

const { verificarToken, requiereRol } = require('../middleware/auth');

// Rutas públicas (registro no requiere token)
router.post('/', crearUsuario);

// Rutas protegidas — requieren autenticación
router.get('/',      verificarToken, requiereRol('admin'), listarUsuarios);
router.get('/:id',   verificarToken, buscarUsuario);
router.put('/:id',   verificarToken, actualizarUsuario);
router.delete('/:id',verificarToken, requiereRol('admin'), eliminarUsuario);

module.exports = router;