const express = require('express');
const router = express.Router();

const {
  listarCursos,
  buscarCurso,
  crearCurso,
  actualizarCurso,
  eliminarCurso
} = require('../controllers/curso.controller');

router.get('/', listarCursos);
router.get('/:id', buscarCurso);
router.post('/', crearCurso);
router.put('/:id', actualizarCurso);
router.delete('/:id', eliminarCurso);

module.exports = router;