const buscarRepositoriosGithub = async (query) => {
  const url = new URL('https://api.github.com/search/repositories');

  url.searchParams.set(
    'q',
    `${query} tutorial example course exercise in:name,description,readme`
  );
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '6');

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'LMS-Academy'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error GitHub API: ${error}`);
  }

  const data = await response.json();

  return data.items.map((repo) => ({
    nombre: repo.full_name,
    descripcion: repo.description,
    lenguaje: repo.language,
    estrellas: repo.stargazers_count,
    forks: repo.forks_count,
    url: repo.html_url,
    actualizado: repo.updated_at
  }));
};

module.exports = {
  buscarRepositoriosGithub
};