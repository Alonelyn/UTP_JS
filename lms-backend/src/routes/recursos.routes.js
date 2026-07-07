const express = require('express');
const router = express.Router();

const {
  buscarVideos,
  buscarRepositorios,
  buscarRecursos
} = require('../controllers/recursos.controller');

router.get('/youtube', buscarVideos);
router.get('/github', buscarRepositorios);
router.get('/externos', buscarRecursos);

module.exports = router;