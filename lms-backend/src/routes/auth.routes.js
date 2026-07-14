const express = require('express');
const router  = express.Router();

const { login }                                      = require('../controllers/auth.controller');
const { solicitarRecuperacion, restablecerPassword } = require('../controllers/recuperacion.controller');

router.post('/login',           login);
router.post('/recuperar',       solicitarRecuperacion);
router.post('/nueva-password',  restablecerPassword);

module.exports = router;