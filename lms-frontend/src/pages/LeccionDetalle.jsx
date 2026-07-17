import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import AreaPractica from '../components/AreaPractica';
import RecursosExternos from '../components/RecursosExternos';
import UTPBootPanel from '../UTPBoot';
import api from '../api/axios';
import '../styles/leccion-detalle.css';

/* ─── Utilidades ─────────────────────────────────────────────── */

/**
 * Calcula la duración mínima (en segundos) de forma automática
 * según el contenido, tipo de lección y si tiene video.
 */
function calcularDuracionMinima(leccion) {
  const contenido  = leccion.contenido_texto || '';
  const palabras   = contenido.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // Lectura técnica: ~180 palabras/min  →  (palabras/180)*60 segundos
  const tiempoLectura = Math.ceil((palabras / 180) * 60);

  // Bonus por video embebido
  const bonusVideo = leccion.video_url ? 180 : 0;

  // Bonus por tipo de lección
  const bonusTipo =
    leccion.tipo === 'interactivo' ? 300
    : leccion.tipo === 'examen'   ? 600
    : leccion.tipo === 'video'    ? 240
    : 90; // texto base

  const total = tiempoLectura + bonusVideo + bonusTipo;

  // Mínimo: 60 s · Máximo: 3600 s (1 h)
  return Math.max(60, Math.min(3600, total));
}

function formatTiempo(segundos) {
  const m = Math.floor(segundos / 60).toString().padStart(2, '0');
  const s = (segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function obtenerEmbedYoutube(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  return null;
}

/* ─── Componente ─────────────────────────────────────────────── */

function LeccionDetalle() {
  const { cursoSlug, leccionSlug } = useParams();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [curso,          setCurso]          = useState(null);
  const [leccion,        setLeccion]        = useState(null);
  const [completada,     setCompletada]     = useState(false);
  const [leccionesCurso, setLeccionesCurso] = useState([]);
  const [progreso,       setProgreso]       = useState(null);
  const [practicaValidada, setPracticaValidada] = useState(false);

  // ── Timer ────────────────────────────────────────────────────
  const [tiempoActivo,   setTiempoActivo]   = useState(0);   // segundos transcurridos
  const [duracionMinima, setDuracionMinima] = useState(0);   // calculada
  const [timerActivo,    setTimerActivo]    = useState(true); // pausa tab/blur
  const [tiempoError,    setTiempoError]    = useState(null); // mensaje si rechazado
  const intervalRef = useRef(null);

  // ── Reiniciar timer al cambiar de lección ──────────────────
  useEffect(() => {
    setTiempoActivo(0);
    setTimerActivo(true);
    setTiempoError(null);
    setPracticaValidada(false); // reiniciar validador de práctica
  }, [leccionSlug]);

  // ── Iniciar/detener interval ───────────────────────────────
  useEffect(() => {
    if (!timerActivo || completada) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTiempoActivo((t) => t + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timerActivo, completada]);

  // ── Pausar al cambiar de pestaña ──────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      setTimerActivo(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // ── Cargar datos ──────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    try {
      const [cursosRes, leccionesRes, modulosRes] = await Promise.all([
        api.get('/cursos'),
        api.get('/lecciones'),
        api.get('/modulos'),
      ]);

      const cursoActual = cursosRes.data.find((c) => c.slug === cursoSlug);
      if (!cursoActual) { console.error('Curso no encontrado:', cursoSlug); return; }

      const modulosCurso = modulosRes.data
        .filter((m) => m.curso_id === cursoActual.id)
        .sort((a, b) => a.orden - b.orden);

      const leccionesOrdenadas = modulosCurso.flatMap((modulo) =>
        leccionesRes.data
          .filter((l) => l.modulo_id === modulo.id)
          .sort((a, b) => a.orden - b.orden)
      );

      const leccionActual = leccionesOrdenadas.find((l) => l.slug === leccionSlug);
      if (!leccionActual) { console.error('Lección no encontrada:', leccionSlug); return; }

      setCurso(cursoActual);
      setLeccionesCurso(leccionesOrdenadas);
      setLeccion(leccionActual);

      // Calcular duración mínima: primero del campo DB, luego auto-calculada
      const durMin = leccionActual.duracion_minima
        ? parseInt(leccionActual.duracion_minima)
        : calcularDuracionMinima(leccionActual);
      setDuracionMinima(durMin);

      if (usuario?.rol === 'estudiante') {
        const progresoRes = await api.get(`/progreso/${usuario.id}/${cursoActual.id}`);
        setProgreso(progresoRes.data);
        const progresoLeccion = progresoRes.data.lecciones.find(
          (p) => p.leccion_id === leccionActual.id
        );
        setCompletada(progresoLeccion?.completado || false);
      }
    } catch (error) {
      console.error('Error al cargar lección:', error.response?.data || error.message);
    }
  }, [cursoSlug, leccionSlug]);

  const marcarCompletada = async () => {
    setTiempoError(null);

    if (tiempoActivo < duracionMinima) {
      setTiempoError('Todavía no cumples el tiempo mínimo requerido.');
      return;
    }

    const requierePracticaActual = ['interactivo', 'examen'].includes(leccion?.tipo);

    if (requierePracticaActual && !practicaValidada) {
      setTiempoError(
        'Debes modificar y ejecutar correctamente el código antes de completar la lección.'
      );
      return;
    }

    try {
      await api.post('/progreso', {
        usuario_id:       usuario.id,
        leccion_id:       leccion.id,
        tiempo_activo:    tiempoActivo,
        practica_validada: !requierePracticaActual || practicaValidada
      });

      setCompletada(true);
      clearInterval(intervalRef.current);

      const progresoRes = await api.get(`/progreso/${usuario.id}/${curso.id}`);
      setProgreso(progresoRes.data);

    } catch (error) {
      const data = error.response?.data;
      if (data?.faltante) {
        setTiempoError(
          `Necesitas ${Math.ceil(data.faltante / 60)} min más para completar esta lección.`
        );
      } else {
        setTiempoError('No se pudo marcar la lección. Intenta de nuevo.');
      }
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (!leccion || !curso) {
    return <div className="container mt-4">Cargando...</div>;
  }

  const indiceActual    = leccionesCurso.findIndex((l) => l.slug === leccionSlug);
  const siguienteLeccion = leccionesCurso[indiceActual + 1];
  const leccionAnterior  = leccionesCurso[indiceActual - 1];
  const videoEmbedUrl    = obtenerEmbedYoutube(leccion.video_url);

  // ── Variables del timer y validaciones ───────────────────
  const esEstudiante     = usuario?.rol === 'estudiante';
  const tiempoRestante   = Math.max(0, duracionMinima - tiempoActivo);
  const porcentajeTiempo = duracionMinima > 0
    ? Math.min(100, Math.round((tiempoActivo / duracionMinima) * 100))
    : 100;

  // Las lecciones interactivas/examen requieren tiempo y práctica validada.
  const requierePractica = ['interactivo', 'examen'].includes(leccion?.tipo);
  const tiempoCumplido = tiempoActivo >= duracionMinima;
  const practicaCumplida = !requierePractica || practicaValidada;
  const puedeCompletar = completada || (tiempoCumplido && practicaCumplida);

  // Texto del botón bloqueado según tipo de lección y qué falta
  const textoBloqueado = () => {
    if (tiempoActivo < duracionMinima) {
      const mensajes = {
        video:       'Termina de ver el video para continuar',
        interactivo: 'Completa el ejercicio práctico para continuar',
        examen:      'Completa el examen para continuar',
        texto:       'Termina de revisar el contenido para continuar'
      };
      return mensajes[leccion?.tipo] || 'Revisa el contenido para continuar';
    }
    if (requierePractica && !practicaValidada) {
      return 'Modifica y ejecuta correctamente el ejercicio para continuar';
    }
    return 'Revisa el contenido para continuar';
  };

  return (
    <div className="container mt-4 lesson-page" data-ai-context="true">
      <Link className="btn btn-outline-secondary mb-3" to={`/cursos/${curso.slug}`}>
        ← Volver al curso
      </Link>

      <div className="lesson-hero">
        <div>
          <p className="text-muted mb-1">{curso.titulo}</p>
          <h1>{leccion.titulo}</h1>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge bg-primary">{leccion.tipo}</span>
            <span className="badge bg-success">XP {leccion.xp_otorgada ?? 10}</span>
            <span className="badge bg-warning text-dark">{leccion.puntos_otorgados ?? 10} pts</span>
            <span className="badge bg-secondary">{leccion.dificultad || 'básico'}</span>
          </div>
        </div>
      </div>

      {/* ── Indicador de lectura (solo para estudiantes, sutil) ── */}
      {esEstudiante && !completada && (
        <div className={`lesson-reading-bar ${puedeCompletar ? 'reading-done' : timerActivo ? 'reading-active' : 'reading-paused'}`}>
          <div className="reading-bar-track">
            <div
              className="reading-bar-fill"
              style={{ width: `${porcentajeTiempo}%` }}
            />
          </div>
          <span className="reading-bar-label">
            {!timerActivo
              ? '⏸ Vuelve a esta pestaña para continuar'
              : puedeCompletar
                ? '✅ Ya puedes completar la lección'
                : tiempoCumplido && requierePractica && !practicaValidada
                  ? '🧪 Falta validar la práctica'
                  : '📖 Revisando contenido...'}
          </span>
        </div>
      )}

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
              <a href={leccion.video_url} target="_blank" rel="noreferrer" className="btn btn-light">
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

          <p><strong>Curso:</strong><br />{curso.titulo}</p>
          <p><strong>Tipo:</strong><br />{leccion.tipo}</p>
          <p>
            <strong>Recompensa:</strong><br />
            {leccion.xp_otorgada ?? 10} XP · {leccion.puntos_otorgados ?? 10} puntos
          </p>

          {esEstudiante && progreso && (
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

          {esEstudiante && !completada && (
            <div className="reading-side-indicator">
              <div className={`timer-dot ${timerActivo ? 'dot-active' : 'dot-paused'}`} />
              <span>{timerActivo ? 'Leyendo lección' : 'Pausado'}</span>
            </div>
          )}
        </aside>
      </div>

      {/* ── Imagen de portada de la lección ──────────────────── */}
      {leccion.imagen_url && (
        <section className="card p-0 mt-4 lesson-cover-img">
          <img src={leccion.imagen_url} alt={leccion.titulo} />
        </section>
      )}

      <section className="card p-4 mt-4">
        <h3>Contenido de la lección</h3>
        <div className="lesson-content">{leccion.contenido_texto}</div>
      </section>

      <section className="card p-4 mt-4">
        <h3>Reto práctico</h3>
        <div className="alert alert-primary">
          <strong>Objetivo:</strong>{' '}
          {leccion.reto_practico ||
            'Realiza un pequeño ejercicio práctico relacionado con esta lección.'}
        </div>
        <AreaPractica
          leccion={leccion}
          onPracticaValidada={setPracticaValidada}
        />
        {requierePractica && !practicaValidada && esEstudiante && !completada && (
          <div className="practice-required-notice">
            ⚠️ Esta lección requiere que ejecutes el ejercicio práctico antes de poder completarla.
          </div>
        )}
      </section>

      <RecursosExternos
        terminoInicial={`${curso.titulo} ${leccion.titulo}`}
        leccionId={leccion.id}
        autoBuscar={true}
      />

      {/* ── Navegación (solo estudiantes) ────────────────────── */}
      {esEstudiante && (
        <div className="lesson-nav mt-4 mb-5">
          {completada ? (
            <button className="btn btn-secondary" disabled>
              ✓ Lección completada
            </button>
          ) : (
            <div className="lesson-complete-block">
              {tiempoError && (
                <div className="lesson-timer-error">⚠️ {tiempoError}</div>
              )}
              <button
                className={`btn ${puedeCompletar ? 'btn-success lesson-btn-ready' : 'btn-secondary lesson-btn-locked'}`}
                onClick={puedeCompletar ? marcarCompletada : undefined}
                disabled={!puedeCompletar}
              >
                {puedeCompletar
                  ? 'Marcar como completada ✓'
                  : textoBloqueado()}
              </button>
            </div>
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

            {siguienteLeccion && completada && (
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

      {usuario?.rol === 'estudiante' && (
        <UTPBootPanel
          usuario={usuario}
          curso={curso}
          leccion={leccion}
          progreso={progreso}
        />
      )}
    </div>
  );
}

export default LeccionDetalle;