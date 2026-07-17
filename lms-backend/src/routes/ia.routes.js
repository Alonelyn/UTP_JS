const express = require('express');
const router = express.Router();

const {
  chatIA,
  analizarLeccion
} = require('../controllers/ia.controller');

const {
  verificarToken
} = require('../middleware/auth');

router.post('/chat', verificarToken, chatIA);

router.post(
  '/analizar-leccion',
  verificarToken,
  analizarLeccion
);

module.exports = router;