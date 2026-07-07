const { buscarVideosYoutube } = require('../services/youtube.service');
const { buscarRepositoriosGithub } = require('../services/github.service');
const RecursoCache = require('../models/recursoExterno.model');

const normalizarVideos = (videos) => {
  return videos.map((video) => ({
    tipo: 'youtube',
    titulo: video.titulo,
    descripcion: video.descripcion,
    url: video.url,
    thumbnail: video.thumbnail,
    fuente: 'YouTube',
    metadata: {
      videoId: video.videoId,
      canal: video.canal,
      publicado: video.publicado,
      embedUrl: video.embedUrl
    }
  }));
};

const normalizarRepos = (repositorios) => {
  return repositorios.map((repo) => ({
    tipo: 'github',
    titulo: repo.nombre,
    descripcion: repo.descripcion,
    url: repo.url,
    thumbnail: null,
    fuente: 'GitHub',
    metadata: {
      lenguaje: repo.lenguaje,
      estrellas: repo.estrellas,
      forks: repo.forks,
      actualizado: repo.actualizado
    }
  }));
};

const buscarRecursos = async (req, res) => {
  try {
    const { q, leccion_id, refresh } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        mensaje: 'El parámetro q es obligatorio'
      });
    }

    if (!leccion_id?.trim()) {
      return res.status(400).json({
        mensaje: 'El parámetro leccion_id es obligatorio'
      });
    }

    if (refresh !== 'true') {
      const cache = await RecursoCache.obtenerPorLeccion(leccion_id);

      if (cache.length > 0) {
        return res.json({
          query: q,
          origen: 'cache',
          videos: cache
            .filter((r) => r.tipo === 'youtube')
            .map((r) => ({
              videoId: r.metadata?.videoId,
              titulo: r.titulo,
              descripcion: r.descripcion,
              canal: r.metadata?.canal,
              publicado: r.metadata?.publicado,
              thumbnail: r.thumbnail,
              url: r.url,
              embedUrl: r.metadata?.embedUrl
            })),
          repositorios: cache
            .filter((r) => r.tipo === 'github')
            .map((r) => ({
              nombre: r.titulo,
              descripcion: r.descripcion,
              lenguaje: r.metadata?.lenguaje,
              estrellas: r.metadata?.estrellas,
              forks: r.metadata?.forks,
              url: r.url,
              actualizado: r.metadata?.actualizado
            }))
        });
      }
    }

    if (refresh === 'true') {
      await RecursoCache.eliminarPorLeccion(leccion_id);
    }

    const [videos, repositorios] = await Promise.all([
      buscarVideosYoutube(q),
      buscarRepositoriosGithub(q)
    ]);

    const recursosNormalizados = [
      ...normalizarVideos(videos),
      ...normalizarRepos(repositorios)
    ];

    await RecursoCache.guardarRecursos(leccion_id, recursosNormalizados);

    res.json({
      query: q,
      origen: 'api',
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
  buscarRecursos
};