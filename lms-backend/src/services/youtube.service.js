const buscarVideosYoutube = async (query) => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('Falta configurar YOUTUBE_API_KEY en .env');
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');

  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '6');
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('relevanceLanguage', 'es');
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error YouTube API: ${error}`);
  }

  const data = await response.json();

  return data.items.map((item) => ({
    videoId: item.id.videoId,
    titulo: item.snippet.title,
    descripcion: item.snippet.description,
    canal: item.snippet.channelTitle,
    publicado: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
  }));
};

module.exports = {
  buscarVideosYoutube
};