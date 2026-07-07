require('dotenv').config();
const pool = require('../config/db');

const buscarVideoYoutube = async (query) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');

  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', `${query} tutorial español programación`);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('relevanceLanguage', 'es');
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  const video = data.items?.[0];

  if (!video) return null;

  return `https://www.youtube.com/embed/${video.id.videoId}`;
};

const actualizarVideos = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id,
        l.titulo AS leccion,
        m.titulo AS modulo,
        c.titulo AS curso
      FROM "Leccion" l
      INNER JOIN "Modulo" m ON l.modulo_id = m.id
      INNER JOIN "Curso" c ON m.curso_id = c.id
      ORDER BY c.titulo, m.orden, l.orden
    `);

    for (const item of result.rows) {
      const query = `${item.curso} ${item.modulo} ${item.leccion}`;
      console.log('Buscando video para:', query);

      const videoUrl = await buscarVideoYoutube(query);

      if (videoUrl) {
        await pool.query(
          `UPDATE "Leccion" SET video_url = $1 WHERE id = $2`,
          [videoUrl, item.id]
        );

        console.log('Video actualizado:', videoUrl);
      } else {
        console.log('Sin video encontrado');
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    console.log('Actualización finalizada.');
    process.exit(0);
  } catch (error) {
    console.error('Error actualizando videos:', error.message);
    process.exit(1);
  }
};

actualizarVideos();