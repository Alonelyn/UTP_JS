import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import '../styles/resource-hub.css';

function RecursosExternos({ terminoInicial = '', leccionId, autoBuscar = false }) {
  const [query, setQuery] = useState(terminoInicial || '');
  const [videos, setVideos] = useState([]);
  const [repositorios, setRepositorios] = useState([]);
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [tab, setTab] = useState('videos');
  const [origen, setOrigen] = useState('');
  const [cargando, setCargando] = useState(false);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const construirBusqueda = (texto) => {
    const base = (texto || '').toLowerCase();

    if (base.includes('java')) return `${texto} java programación tutorial español ejercicios`;
    if (base.includes('javascript')) return `${texto} javascript tutorial español ejercicios`;
    if (base.includes('python')) return `${texto} python tutorial español ejercicios`;
    if (base.includes('machine learning')) return `${texto} machine learning python español scikit learn`;
    if (base.includes('base de datos') || base.includes('sql')) return `${texto} sql mysql postgresql tutorial español`;
    if (base.includes('redes')) return `${texto} redes comunicaciones cisco packet tracer español`;
    if (base.includes('ciberseguridad')) return `${texto} ciberseguridad defensiva tutorial español`;

    return `${texto} tutorial español programación`;
  };

  const buscar = async (consultaManual = null, refresh = false) => {
    const textoBase = consultaManual || query || terminoInicial;

    if (!textoBase?.trim()) return;

    if (!leccionId) {
      console.warn('No se puede buscar recursos: falta leccionId');
      return;
    }

    const termino = construirBusqueda(textoBase);

    setCargando(true);

    try {
      const response = await api.get('/recursos/externos', {
        params: {
          q: termino,
          leccion_id: leccionId,
          refresh
        }
      });

      setVideos(response.data.videos || []);
      setRepositorios(response.data.repositorios || []);
      setOrigen(response.data.origen || '');
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudieron cargar los recursos externos');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarVideo = (video) => {
    setVideoSeleccionado(video);

    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const cargarRelacionados = () => {
    if (!videoSeleccionado) return;

    const nuevaBusqueda = `${videoSeleccionado.titulo} tutorial español`;
    setQuery(nuevaBusqueda);
    buscar(nuevaBusqueda, true);
  };

  const documentacion = [
    {
      titulo: 'Oracle Java Docs',
      descripcion: 'Documentación oficial de Java.',
      url: 'https://docs.oracle.com/en/java/'
    },
    {
      titulo: 'MDN JavaScript',
      descripcion: 'Guía oficial de JavaScript, HTML y CSS.',
      url: 'https://developer.mozilla.org/es/'
    },
    {
      titulo: 'Python Docs',
      descripcion: 'Documentación oficial de Python.',
      url: 'https://docs.python.org/es/3/'
    },
    {
      titulo: 'PostgreSQL Docs',
      descripcion: 'Documentación oficial de PostgreSQL.',
      url: 'https://www.postgresql.org/docs/'
    }
  ];

  useEffect(() => {
    if (terminoInicial?.trim()) {
      setQuery(terminoInicial);
    }
  }, [terminoInicial]);

  useEffect(() => {
    if (autoBuscar && terminoInicial?.trim() && leccionId) {
      buscar(terminoInicial);
    }
  }, [autoBuscar, terminoInicial, leccionId]);

  useEffect(() => {
    if (!videoSeleccionado) return;

    const crearPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player('resource-hub-player', {
        videoId: videoSeleccionado.videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: 1
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              cargarRelacionados();
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = crearPlayer;
    } else {
      crearPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoSeleccionado]);

  return (
    <section className="resource-hub card p-4 mt-4">
      <div className="resource-head">
        <div>
          <p className="resource-eyebrow">UTP-BOOT Resource Hub</p>
          <h3>Recursos inteligentes para esta lección</h3>
          <p className="text-muted">
            Videos, repositorios, documentación y material externo sin salir del LMS.
          </p>
        </div>

        {origen && (
          <span className={`resource-origin ${origen === 'cache' ? 'cache' : 'api'}`}>
            {origen === 'cache' ? 'Cache PostgreSQL' : 'API externa'}
          </span>
        )}
      </div>

      <div className="resource-search">
        <input
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recursos..."
        />

        <button className="btn btn-primary" onClick={() => buscar()}>
          Buscar
        </button>

        <button className="btn btn-outline-secondary" onClick={() => buscar(query, true)}>
          Actualizar
        </button>
      </div>

      {cargando && <p className="text-muted mt-3">Consultando recursos externos...</p>}

      {videoSeleccionado && (
        <div ref={playerContainerRef} className="resource-player">
          <div className="resource-player-frame">
            <div id="resource-hub-player" />
          </div>

          <div className="resource-player-info">
            <h5>{videoSeleccionado.titulo}</h5>
            <p>{videoSeleccionado.canal}</p>

            <button className="btn btn-outline-primary btn-sm" onClick={cargarRelacionados}>
              Buscar relacionados
            </button>
          </div>
        </div>
      )}

      <div className="resource-tabs">
        <button
          className={tab === 'videos' ? 'active' : ''}
          onClick={() => setTab('videos')}
        >
          🎥 Videos
        </button>

        <button
          className={tab === 'github' ? 'active' : ''}
          onClick={() => setTab('github')}
        >
          💻 GitHub
        </button>

        <button
          className={tab === 'docs' ? 'active' : ''}
          onClick={() => setTab('docs')}
        >
          📘 Documentación
        </button>

        <button
          className={tab === 'boot' ? 'active' : ''}
          onClick={() => setTab('boot')}
        >
          🤖 UTP-BOOT
        </button>
      </div>

      {tab === 'videos' && (
        <div className="resource-grid">
          {videos.length === 0 ? (
            <p className="text-muted">Sin videos cargados.</p>
          ) : (
            videos.map((video) => (
              <button
                key={video.videoId}
                type="button"
                className="resource-video-card"
                onClick={() => seleccionarVideo(video)}
              >
                <img src={video.thumbnail} alt={video.titulo} />

                <div>
                  <h5>{video.titulo}</h5>
                  <p>{video.canal}</p>
                  <small>Reproducir dentro del LMS</small>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'github' && (
        <>
          <div className="mb-3">
            <h4>💻 Repositorios recomendados</h4>

            <p className="text-muted">
              Estos proyectos reales de GitHub fueron seleccionados para ayudarte
              a entender cómo se implementa este tema en aplicaciones profesionales.
            </p>
          </div>

          <div className="resource-list">
            {repositorios.length === 0 ? (
              <p className="text-muted">
                No se encontraron repositorios relacionados.
              </p>
            ) : (
              repositorios.map((repo) => (
                <div key={repo.url} className="resource-repo-card">

                  <div>

                    <h5>
                      {repo.nombre}
                    </h5>

                    <p>
                      {repo.descripcion || 'Repositorio sin descripción.'}
                    </p>

                    <div className="d-flex gap-3 flex-wrap mt-2">

                      <span className="badge bg-primary">
                        {repo.lenguaje || 'Sin lenguaje'}
                      </span>

                      <span className="badge bg-warning text-dark">
                        ⭐ {repo.estrellas}
                      </span>

                      <span className="badge bg-secondary">
                        🍴 {repo.forks}
                      </span>

                    </div>

                  </div>

                  <div className="text-end">

                    <a
                      className="btn btn-success btn-sm"
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver código
                    </a>

                  </div>

                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'docs' && (
        <div className="resource-list">
          {documentacion.map((doc) => (
            <div key={doc.url} className="resource-doc-card">
              <div>
                <h5>{doc.titulo}</h5>
                <p>{doc.descripcion}</p>
              </div>

              <a
                className="btn btn-outline-primary btn-sm"
                href={doc.url}
                target="_blank"
                rel="noreferrer"
              >
                Abrir
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === 'boot' && (
        <div className="resource-boot-card">
          <h4>Preguntas sugeridas para UTP-BOOT</h4>

          <ul>
            <li>Explícame esta lección con un ejemplo práctico.</li>
            <li>Dame un ejercicio parecido al de clase.</li>
            <li>Hazme preguntas tipo examen.</li>
            <li>Recomiéndame una ruta para dominar este tema.</li>
            <li>Revisa mi código y dime qué mejorar.</li>
          </ul>

          <p className="text-muted">
            Estas preguntas están pensadas para que el estudiante no dependa de saber preguntar perfecto.
          </p>
        </div>
      )}
    </section>
  );
}

export default RecursosExternos;