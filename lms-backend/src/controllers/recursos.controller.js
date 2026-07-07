const { buscarVideosYoutube } = require('../services/youtube.service');
const { buscarRepositoriosGithub } = require('../services/github.service');

const buscarVideos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        mensaje: 'El parámetro q es obligatorio'
      });
    }

    const videos = await buscarVideosYoutube(q);

    res.json({
      query: q,
      videos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al buscar videos externos',
      error: error.message
    });
  }
};

const buscarRepositorios = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        mensaje: 'El parámetro q es obligatorio'
      });
    }

    const repositorios = await buscarRepositoriosGithub(q);

    res.json({
      query: q,
      repositorios
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al buscar repositorios externos',
      error: error.message
    });
  }
};

const buscarRecursos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        mensaje: 'El parámetro q es obligatorio'
      });
    }

    const [videos, repositorios] = await Promise.all([
      buscarVideosYoutube(q),
      buscarRepositoriosGithub(q)
    ]);

    res.json({
      query: q,
      videos,
      repositorios
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar recursos externos',
      error: error.message
    });
  }
};

module.exports = {
  buscarVideos,
  buscarRepositorios,
  buscarRecursos
};