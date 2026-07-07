import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

function RecursosExternos({ terminoInicial = '', autoBuscar = false }) {
  const [query, setQuery] = useState(terminoInicial || '');
  const [videos, setVideos] = useState([]);
  const [repositorios, setRepositorios] = useState([]);
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const construirBusqueda = (texto) => {
    const base = (texto || '').toLowerCase();

    if (base.includes('java')) {
      return `${texto} java programación tutorial español ejercicios`;
    }

    if (base.includes('python')) {
      return `${texto} python tutorial español ejercicios`;
    }

    if (base.includes('machine learning')) {
      return `${texto} machine learning python español scikit learn`;
    }

    if (base.includes('base de datos') || base.includes('sql')) {
      return `${texto} sql mysql postgresql tutorial español`;
    }

    return `${texto} tutorial español programación`;
  };

  const buscar = async (consultaManual = null) => {
    const textoBase = consultaManual || query || terminoInicial;
    const termino = construirBusqueda(textoBase);

    if (!textoBase?.trim()) return;

    setCargando(true);

    try {
      const response = await api.get(
        `/recursos/externos?q=${encodeURIComponent(termino)}`
      );

      setVideos(response.data.videos || []);
      setRepositorios(response.data.repositorios || []);
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudieron cargar los recursos externos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (terminoInicial?.trim()) {
      setQuery(terminoInicial);
    }
  }, [terminoInicial]);

  useEffect(() => {
    if (autoBuscar && terminoInicial?.trim()) {
      buscar(terminoInicial);
    }
  }, [autoBuscar, terminoInicial]);

  const seleccionarVideo = (video) => {
    setVideoSeleccionado(video);

    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const cargarVideosRelacionados = () => {
    const nuevaBusqueda = videoSeleccionado
      ? `${videoSeleccionado.titulo} tutorial español`
      : query;

    setQuery(nuevaBusqueda);
    buscar(nuevaBusqueda);
  };

  useEffect(() => {
    if (!videoSeleccionado) return;

    const crearPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player('youtube-player-recursos', {
        videoId: videoSeleccionado.videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: 1
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              cargarVideosRelacionados();
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        crearPlayer();
      };
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
    <div className="card p-4 mt-4">
      <h4>Recursos externos recomendados</h4>

      <p className="text-muted">
        Selecciona un video para reproducirlo dentro de la lección sin salir del LMS.
      </p>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Ejemplo: Java arreglos, machine learning python..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="btn btn-primary" onClick={() => buscar()}>
          Buscar
        </button>
      </div>

      {cargando && <p>Consultando APIs externas...</p>}

      {videoSeleccionado && (
        <div ref={playerContainerRef} className="mb-4">
          <h5>Reproduciendo ahora</h5>

          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0f172a'
            }}
          >
            <div
              id="youtube-player-recursos"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>

          <div className="mt-2">
            <strong>{videoSeleccionado.titulo}</strong>
            <p className="text-muted mb-1">{videoSeleccionado.canal}</p>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={cargarVideosRelacionados}
            >
              Buscar videos relacionados
            </button>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <h5>Videos de YouTube</h5>

          {videos.length === 0 && (
            <p className="text-muted">Sin videos cargados.</p>
          )}

          {videos.map((video) => (
            <button
              type="button"
              key={video.videoId}
              className="border rounded p-2 mb-2 w-100 text-start bg-white"
              onClick={() => seleccionarVideo(video)}
            >
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.titulo}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    marginBottom: '8px'
                  }}
                />
              )}

              <strong>{video.titulo}</strong>
              <p className="mb-1">{video.canal}</p>

              <small className="text-muted">
                Clic para reproducir dentro del LMS
              </small>
            </button>
          ))}
        </div>

        <div className="col-md-6">
          <h5>Repositorios de GitHub</h5>

          {repositorios.length === 0 && (
            <p className="text-muted">Sin repositorios cargados.</p>
          )}

          {repositorios.map((repo) => (
            <div key={repo.url} className="border rounded p-2 mb-2">
              <strong>{repo.nombre}</strong>

              <p className="mb-1">
                {repo.descripcion || 'Sin descripción'}
              </p>

              <small>
                {repo.lenguaje || 'Sin lenguaje'} · ⭐ {repo.estrellas} · Forks {repo.forks}
              </small>

              <br />

              <a href={repo.url} target="_blank" rel="noreferrer">
                Ver repositorio
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecursosExternos;