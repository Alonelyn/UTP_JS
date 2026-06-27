const express = require('express');
const router = express.Router();

const {
  reenviarCodigoVerificacion,
  verificarCorreo
} = require('../controllers/verificacion.controller');

router.post('/reenviar', reenviarCodigoVerificacion);
router.post('/confirmar', verificarCorreo);

module.exports = router;