const express = require('express');
const router = express.Router();

const {
  buscarRecursos
} = require('../controllers/recursos.controller');

router.get('/externos', buscarRecursos);

module.exports = router;