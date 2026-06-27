const express = require('express');
const router = express.Router();

const {
  listarModulos,
  buscarModulo,
  crearModulo,
  actualizarModulo,
  eliminarModulo
} = require('../controllers/modulo.controller');

router.get('/', listarModulos);
router.get('/:id', buscarModulo);
router.post('/', crearModulo);
router.put('/:id', actualizarModulo);
router.delete('/:id', eliminarModulo);

module.exports = router;