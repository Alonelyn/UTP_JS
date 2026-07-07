import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AreaPractica from '../components/AreaPractica';
import RecursosExternos from '../components/RecursosExternos';
import api from '../api/axios';
import '../styles/leccion-detalle.css';

function LeccionDetalle() {
  const { cursoSlug, leccionSlug } = useParams();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [curso, setCurso] = useState(null);
  const [leccion, setLeccion] = useState(null);
  const [completada, setCompletada] = useState(false);
  const [leccionesCurso, setLeccionesCurso] = useState([]);
  const [progreso, setProgreso] = useState(null);

  const obtenerEmbedYoutube = (url) => {
    if (!url) return null;

    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return null;
  };

  const cargarDatos = async () => {
    try {
      const cursosRes = await api.get('/cursos');
      const leccionesRes = await api.get('/lecciones');
      const modulosRes = await api.get('/modulos');

      const cursoActual = cursosRes.data.find((c) => c.slug === cursoSlug);

      if (!cursoActual) {
        console.error('Curso no encontrado con slug:', cursoSlug);
        return;
      }

      const modulosCurso = modulosRes.data
        .filter((m) => m.curso_id === cursoActual.id)
        .sort((a, b) => a.orden - b.orden);

      const leccionesOrdenadas = modulosCurso.flatMap((modulo) =>
        leccionesRes.data
          .filter((l) => l.modulo_id === modulo.id)
          .sort((a, b) => a.orden - b.orden)
      );

      const leccionActual = leccionesOrdenadas.find(
        (l) => l.slug === leccionSlug
      );

      if (!leccionActual) {
        console.error('Lección no encontrada con slug:', leccionSlug);
        return;
      }

      setCurso(cursoActual);
      setLeccionesCurso(leccionesOrdenadas);
      setLeccion(leccionActual);

      if (usuario?.rol === 'estudiante') {
        const progresoRes = await api.get(
          `/progreso/${usuario.id}/${cursoActual.id}`
        );

        setProgreso(progresoRes.data);

        const progresoLeccion = progresoRes.data.lecciones.find(
          (p) => p.leccion_id === leccionActual.id
        );

        setCompletada(progresoLeccion?.completado || false);
      }
    } catch (error) {
      console.error(
        'Error al cargar lección:',
        error.response?.data || error.message
      );
    }
  };

  const marcarCompletada = async () => {
    try {
      await api.post('/progreso', {
        usuario_id: usuario.id,
        leccion_id: leccion.id
      });

      setCompletada(true);

      const progresoRes = await api.get(`/progreso/${usuario.id}/${curso.id}`);
      setProgreso(progresoRes.data);

      alert('Lección marcada como completada');
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo marcar la lección');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cursoSlug, leccionSlug]);

  if (!leccion || !curso) {
    return <div className="container mt-4">Cargando...</div>;
  }

  const indiceActual = leccionesCurso.findIndex((l) => l.slug === leccionSlug);
  const siguienteLeccion = leccionesCurso[indiceActual + 1];
  const leccionAnterior = leccionesCurso[indiceActual - 1];
  const videoEmbedUrl = obtenerEmbedYoutube(leccion.video_url);

  return (
    <div className="container mt-4 lesson-page" data-ai-context="true">
      <Link
        className="btn btn-outline-secondary mb-3"
        to={`/cursos/${curso.slug}`}
      >
        ← Volver al curso
      </Link>

      <div className="lesson-hero">
        <div>
          <p className="text-muted mb-1">{curso.titulo}</p>
          <h1>{leccion.titulo}</h1>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge bg-primary">{leccion.tipo}</span>
            <span className="badge bg-success">XP {leccion.xp_otorgada ?? 10}</span>
            <span className="badge bg-warning text-dark">
              {leccion.puntos_otorgados ?? 10} pts
            </span>
            <span className="badge bg-secondary">
              {leccion.dificultad || 'básico'}
            </span>
          </div>
        </div>
      </div>

      <div className="lesson-main-grid">
        <section className="card p-4 lesson-video-card">
          <h4>Video principal</h4>

          {videoEmbedUrl ? (
            <div className="lesson-video-frame">
              <iframe
                src={videoEmbedUrl}
                title={leccion.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : leccion.video_url ? (
            <div className="lesson-resource-box">
              <h2>🔗</h2>
              <p>Recurso externo disponible</p>
              <a
                href={leccion.video_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-light"
              >
                Abrir recurso
              </a>
            </div>
          ) : (
            <div className="lesson-video-placeholder">
              <h2>▶</h2>
              <p>Video pendiente de carga</p>
              <small>El instructor podrá asociar un video desde el editor visual.</small>
            </div>
          )}
        </section>

        <aside className="card p-4 lesson-side-card">
          <h4>Resumen de la lección</h4>

          <p>
            <strong>Curso:</strong><br />
            {curso.titulo}
          </p>

          <p>
            <strong>Tipo:</strong><br />
            {leccion.tipo}
          </p>

          <p>
            <strong>Duración estimada:</strong><br />
            {leccion.duracion_estimada || '15 min'}
          </p>

          <p>
            <strong>Recompensa:</strong><br />
            {leccion.xp_otorgada ?? 10} XP · {leccion.puntos_otorgados ?? 10} puntos
          </p>

          {usuario?.rol === 'estudiante' && progreso && (
            <>
              <hr />
              <p>
                <strong>Tu avance:</strong><br />
                {progreso.completadas} de {progreso.total} lecciones
              </p>

              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progreso.porcentaje}%` }}
                >
                  {progreso.porcentaje}%
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <section className="card p-4 mt-4">
        <h3>Contenido de la lección</h3>

        <div className="lesson-content">
          {leccion.contenido_texto}
        </div>
      </section>

      <section className="card p-4 mt-4">
        <h3>Reto práctico</h3>

        <div className="alert alert-primary">
          <strong>Objetivo:</strong>{' '}
          {leccion.reto_practico ||
            'Realiza un pequeño ejercicio práctico relacionado con esta lección.'}
        </div>

        <AreaPractica leccion={leccion} />
      </section>

      <RecursosExternos
        terminoInicial={`${curso.titulo} ${leccion.titulo}`}
        leccionId={leccion.id}
        autoBuscar={true}
      />

      {usuario?.rol === 'estudiante' && (
        <div className="lesson-nav mt-4 mb-5">
          {completada ? (
            <button className="btn btn-secondary" disabled>
              Lección completada
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={marcarCompletada}
            >
              Marcar como completada
            </button>
          )}

          <div className="d-flex gap-2 flex-wrap">
            {leccionAnterior && (
              <Link
                className="btn btn-outline-primary"
                to={`/cursos/${curso.slug}/lecciones/${leccionAnterior.slug}`}
              >
                ← Lección anterior
              </Link>
            )}

            {siguienteLeccion && (
              <Link
                className="btn btn-primary"
                to={`/cursos/${curso.slug}/lecciones/${siguienteLeccion.slug}`}
              >
                Próxima lección →
              </Link>
            )}

            {!siguienteLeccion && completada && (
              <Link className="btn btn-dark" to={`/cursos/${curso.slug}`}>
                Finalizar curso
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LeccionDetalle;