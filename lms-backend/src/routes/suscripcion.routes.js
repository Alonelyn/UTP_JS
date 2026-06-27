const express = require('express');
const router = express.Router();

const {
  obtenerMiSuscripcion,
  comprarSuscripcion
} = require('../controllers/suscripcion.controller');

router.get('/:usuarioId', obtenerMiSuscripcion);
router.post('/', comprarSuscripcion);

module.exports = router;