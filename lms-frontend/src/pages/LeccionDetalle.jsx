import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { Link, useParams } from 'react-router-dom';
import AreaPractica from '../components/AreaPractica';
import RecursosExternos from '../components/RecursosExternos';
import UTPBootPanel from '../UTPBoot';
import api from '../api/axios';
import '../styles/leccion-detalle.css';

/* ─── Utilidades ─────────────────────────────────────────────── */

/**
 * Calcula la duración mínima en segundos según:
 * - cantidad de contenido;
 * - tipo de lección;
 * - existencia de video.
 */
function calcularDuracionMinima(leccion) {
  const contenido = leccion.contenido_texto || '';

  const palabras = contenido
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 0)
    .length;

  /*
   * Lectura técnica aproximada:
   * 180 palabras por minuto.
   */
  const tiempoLectura = Math.ceil(
    (palabras / 180) * 60
  );

  const bonusVideo = leccion.video_url
    ? 180
    : 0;

  const bonusTipo =
    leccion.tipo === 'interactivo'
      ? 300
      : leccion.tipo === 'examen'
        ? 600
        : leccion.tipo === 'video'
          ? 240
          : 90;

  const total =
    tiempoLectura +
    bonusVideo +
    bonusTipo;

  /*
   * Mínimo de 60 segundos.
   * Máximo de 3600 segundos.
   */
  return Math.max(
    60,
    Math.min(3600, total)
  );
}

function formatTiempo(segundos = 0) {
  const total = Math.max(
    0,
    Number(segundos || 0)
  );

  const minutos = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');

  const segundosRestantes = Math.floor(total % 60)
    .toString()
    .padStart(2, '0');

  return `${minutos}:${segundosRestantes}`;
}

function obtenerEmbedYoutube(url) {
  if (!url) {
    return null;
  }

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url
      .split('v=')[1]
      ?.split('&')[0];

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  }

  if (url.includes('youtu.be/')) {
    const videoId = url
      .split('youtu.be/')[1]
      ?.split('?')[0];

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  }

  return null;
}

/* ─── Componente ─────────────────────────────────────────────── */

function LeccionDetalle() {
  const {
    cursoSlug,
    leccionSlug
  } = useParams();

  const usuarioGuardado =
    localStorage.getItem('usuario');

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  /*
   * Tiempo todavía no enviado al backend.
   */
  const tiempoPendienteRef = useRef(0);

  /*
   * Evita que se envíen dos peticiones simultáneas
   * con el mismo tiempo pendiente.
   */
  const guardandoTiempoRef = useRef(false);

  const intervalRef = useRef(null);

  const [
    curso,
    setCurso
  ] = useState(null);

  const [
    leccion,
    setLeccion
  ] = useState(null);

  const [
    completada,
    setCompletada
  ] = useState(false);

  const [
    leccionesCurso,
    setLeccionesCurso
  ] = useState([]);

  const [
    progreso,
    setProgreso
  ] = useState(null);

  const [
    practicaValidada,
    setPracticaValidada
  ] = useState(false);

  const [
    tiempoActivo,
    setTiempoActivo
  ] = useState(0);

  const [
    duracionMinima,
    setDuracionMinima
  ] = useState(0);

  const [
    timerActivo,
    setTimerActivo
  ] = useState(true);

  const [
    tiempoError,
    setTiempoError
  ] = useState(null);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    errorCarga,
    setErrorCarga
  ] = useState('');

  const esEstudiante =
    usuario?.rol === 'estudiante';

  /* ─── Cargar datos ───────────────────────────────────────── */

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga('');

      const [
        cursosRes,
        leccionesRes,
        modulosRes
      ] = await Promise.all([
        api.get('/cursos'),
        api.get('/lecciones'),
        api.get('/modulos')
      ]);

      const cursoActual =
        cursosRes.data.find(
          (cursoItem) =>
            cursoItem.slug === cursoSlug
        );

      if (!cursoActual) {
        setErrorCarga(
          'El curso no fue encontrado.'
        );

        setCurso(null);
        setLeccion(null);
        return;
      }

      const modulosCurso =
        modulosRes.data
          .filter(
            (modulo) =>
              String(modulo.curso_id) ===
              String(cursoActual.id)
          )
          .sort(
            (moduloA, moduloB) =>
              Number(moduloA.orden || 0) -
              Number(moduloB.orden || 0)
          );

      const leccionesOrdenadas =
        modulosCurso.flatMap(
          (modulo) =>
            leccionesRes.data
              .filter(
                (leccionItem) =>
                  String(
                    leccionItem.modulo_id
                  ) === String(modulo.id)
              )
              .sort(
                (leccionA, leccionB) =>
                  Number(
                    leccionA.orden || 0
                  ) -
                  Number(
                    leccionB.orden || 0
                  )
              )
        );

      const leccionActual =
        leccionesOrdenadas.find(
          (leccionItem) =>
            leccionItem.slug ===
            leccionSlug
        );

      if (!leccionActual) {
        setErrorCarga(
          'La lección no fue encontrada.'
        );

        setCurso(cursoActual);
        setLeccion(null);
        return;
      }

      setCurso(cursoActual);
      setLeccionesCurso(
        leccionesOrdenadas
      );
      setLeccion(leccionActual);

      const duracionGuardada =
        Number.parseInt(
          leccionActual.duracion_minima,
          10
        );

      const duracionCalculada =
        Number.isFinite(duracionGuardada) &&
        duracionGuardada > 0
          ? duracionGuardada
          : calcularDuracionMinima(
              leccionActual
            );

      setDuracionMinima(
        duracionCalculada
      );

      if (esEstudiante) {
        const progresoRes =
          await api.get(
            `/progreso/${usuario.id}/${cursoActual.id}`
          );

        setProgreso(
          progresoRes.data
        );

        const progresoLeccion =
          progresoRes.data.lecciones?.find(
            (progresoItem) =>
              String(
                progresoItem.leccion_id
              ) ===
              String(leccionActual.id)
          );

        setCompletada(
          Boolean(
            progresoLeccion?.completado
          )
        );
      } else {
        setProgreso(null);
        setCompletada(false);
      }
    } catch (error) {
      console.error(
        'Error al cargar la lección:',
        error.response?.data ||
          error.message
      );

      setErrorCarga(
        error.response?.data?.mensaje ||
          'No se pudo cargar la lección.'
      );
    } finally {
      setCargando(false);
    }
  }, [
    cursoSlug,
    leccionSlug,
    esEstudiante,
    usuario?.id
  ]);

  /* ─── Guardar tiempo pendiente ───────────────────────────── */

  const guardarTiempoPendiente =
    useCallback(async () => {
      if (
        !esEstudiante ||
        !leccion?.id ||
        guardandoTiempoRef.current
      ) {
        return;
      }

      const segundosPendientes =
        tiempoPendienteRef.current;

      if (segundosPendientes <= 0) {
        return;
      }

      guardandoTiempoRef.current = true;

      /*
       * Se coloca en cero antes de enviar para
       * impedir que el mismo bloque se duplique.
       */
      tiempoPendienteRef.current = 0;

      try {
        await api.post(
          '/progreso/tiempo',
          {
            leccion_id:
              leccion.id,

            segundos:
              segundosPendientes
          }
        );
      } catch (error) {
        /*
         * Si falla, recuperamos los segundos
         * para volver a intentarlo.
         */
        tiempoPendienteRef.current +=
          segundosPendientes;

        console.error(
          'No se pudo guardar el tiempo:',
          error.response?.data ||
            error.message
        );
      } finally {
        guardandoTiempoRef.current =
          false;
      }
    }, [
      esEstudiante,
      leccion?.id
    ]);

  /* ─── Reiniciar al cambiar de lección ────────────────────── */

  useEffect(() => {
    setTiempoActivo(0);
    setTimerActivo(true);
    setTiempoError(null);
    setPracticaValidada(false);
    setCompletada(false);

    tiempoPendienteRef.current = 0;
    guardandoTiempoRef.current = false;
  }, [leccionSlug]);

  /* ─── Temporizador principal ─────────────────────────────── */

  useEffect(() => {
    if (
      !esEstudiante ||
      !timerActivo ||
      completada ||
      !leccion?.id
    ) {
      clearInterval(
        intervalRef.current
      );

      return;
    }

    intervalRef.current =
      setInterval(() => {
        setTiempoActivo(
          (tiempoActual) =>
            tiempoActual + 1
        );

        tiempoPendienteRef.current += 1;
      }, 1000);

    return () => {
      clearInterval(
        intervalRef.current
      );
    };
  }, [
    esEstudiante,
    timerActivo,
    completada,
    leccion?.id
  ]);

  /* ─── Guardado periódico cada 30 segundos ───────────────── */

  useEffect(() => {
    if (
      !esEstudiante ||
      !leccion?.id ||
      completada
    ) {
      return;
    }

    const intervaloGuardado =
      setInterval(() => {
        guardarTiempoPendiente();
      }, 30000);

    return () => {
      clearInterval(
        intervaloGuardado
      );
    };
  }, [
    esEstudiante,
    leccion?.id,
    completada,
    guardarTiempoPendiente
  ]);

  /* ─── Pausar al cambiar de pestaña ──────────────────────── */

  useEffect(() => {
    const handleVisibility = () => {
      const visible =
        document.visibilityState ===
        'visible';

      setTimerActivo(visible);

      if (!visible) {
        guardarTiempoPendiente();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
    };
  }, [guardarTiempoPendiente]);

  /* ─── Guardar cuando la ventana pierde el foco ───────────── */

  useEffect(() => {
    const handleBlur = () => {
      setTimerActivo(false);
      guardarTiempoPendiente();
    };

    const handleFocus = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        setTimerActivo(true);
      }
    };

    window.addEventListener(
      'blur',
      handleBlur
    );

    window.addEventListener(
      'focus',
      handleFocus
    );

    return () => {
      window.removeEventListener(
        'blur',
        handleBlur
      );

      window.removeEventListener(
        'focus',
        handleFocus
      );
    };
  }, [guardarTiempoPendiente]);

  /* ─── Guardar al salir de la lección ─────────────────────── */

  useEffect(() => {
    return () => {
      guardarTiempoPendiente();
    };
  }, [
    leccion?.id,
    guardarTiempoPendiente
  ]);

  /* ─── Cargar contenido ───────────────────────────────────── */

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /* ─── Marcar lección como completada ─────────────────────── */

  const marcarCompletada = async () => {
    setTiempoError(null);

    if (
      tiempoActivo <
      duracionMinima
    ) {
      setTiempoError(
        'Todavía no cumples el tiempo mínimo requerido.'
      );

      return;
    }

    const requierePracticaActual =
      ['interactivo', 'examen'].includes(
        leccion?.tipo
      );

    if (
      requierePracticaActual &&
      !practicaValidada
    ) {
      setTiempoError(
        'Debes modificar y ejecutar correctamente el código antes de completar la lección.'
      );

      return;
    }

    try {
      /*
       * Primero enviamos los segundos pendientes.
       */
      await guardarTiempoPendiente();

      /*
       * tiempo_activo va en cero porque el tiempo
       * ya se registró mediante /progreso/tiempo.
       */
      await api.post('/progreso', {
        leccion_id:
          leccion.id,

        tiempo_activo:
          0,

        practica_validada:
          !requierePracticaActual ||
          practicaValidada
      });

      setCompletada(true);
      setTimerActivo(false);

      clearInterval(
        intervalRef.current
      );

      const progresoRes =
        await api.get(
          `/progreso/${usuario.id}/${curso.id}`
        );

      setProgreso(
        progresoRes.data
      );
    } catch (error) {
      const data =
        error.response?.data;

      console.error(
        'Error al completar lección:',
        data || error.message
      );

      if (data?.faltante) {
        setTiempoError(
          `Necesitas ${Math.ceil(
            Number(data.faltante) / 60
          )} min más para completar esta lección.`
        );
      } else {
        setTiempoError(
          data?.mensaje ||
            'No se pudo marcar la lección. Intenta de nuevo.'
        );
      }
    }
  };

  /* ─── Estados de carga ───────────────────────────────────── */

  if (cargando) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          Cargando lección...
        </div>
      </div>
    );
  }

  if (
    errorCarga &&
    (!leccion || !curso)
  ) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {errorCarga}
        </div>

        <Link
          className="btn btn-primary"
          to="/cursos"
        >
          Volver a cursos
        </Link>
      </div>
    );
  }

  if (!leccion || !curso) {
    return (
      <div className="container mt-4">
        Lección no encontrada.
      </div>
    );
  }

  /* ─── Variables visuales ─────────────────────────────────── */

  const indiceActual =
    leccionesCurso.findIndex(
      (leccionItem) =>
        leccionItem.slug ===
        leccionSlug
    );

  const siguienteLeccion =
    leccionesCurso[
      indiceActual + 1
    ];

  const leccionAnterior =
    leccionesCurso[
      indiceActual - 1
    ];

  const videoEmbedUrl =
    obtenerEmbedYoutube(
      leccion.video_url
    );

  const tiempoRestante =
    Math.max(
      0,
      duracionMinima -
        tiempoActivo
    );

  const porcentajeTiempo =
    duracionMinima > 0
      ? Math.min(
          100,
          Math.round(
            (
              tiempoActivo /
              duracionMinima
            ) * 100
          )
        )
      : 100;

  const requierePractica =
    ['interactivo', 'examen'].includes(
      leccion?.tipo
    );

  const tiempoCumplido =
    tiempoActivo >=
    duracionMinima;

  const practicaCumplida =
    !requierePractica ||
    practicaValidada;

  const puedeCompletar =
    completada ||
    (
      tiempoCumplido &&
      practicaCumplida
    );

  const textoBloqueado = () => {
    if (
      tiempoActivo <
      duracionMinima
    ) {
      const mensajes = {
        video:
          'Termina de ver el video para continuar',

        interactivo:
          'Completa el ejercicio práctico para continuar',

        examen:
          'Completa el examen para continuar',

        texto:
          'Termina de revisar el contenido para continuar'
      };

      return (
        mensajes[leccion?.tipo] ||
        'Revisa el contenido para continuar'
      );
    }

    if (
      requierePractica &&
      !practicaValidada
    ) {
      return 'Modifica y ejecuta correctamente el ejercicio para continuar';
    }

    return 'Revisa el contenido para continuar';
  };

  return (
    <div
      className="container mt-4 lesson-page"
      data-ai-context="true"
    >
      {errorCarga && (
        <div className="alert alert-danger">
          {errorCarga}
        </div>
      )}

      <Link
        className="btn btn-outline-secondary mb-3"
        to={`/cursos/${curso.slug}`}
        onClick={() => {
          guardarTiempoPendiente();
        }}
      >
        ← Volver al curso
      </Link>

      <div className="lesson-hero">
        <div>
          <p className="text-muted mb-1">
            {curso.titulo}
          </p>

          <h1>
            {leccion.titulo}
          </h1>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge bg-primary">
              {leccion.tipo}
            </span>

            <span className="badge bg-success">
              XP{' '}
              {leccion.xp_otorgada ??
                10}
            </span>

            <span className="badge bg-warning text-dark">
              {leccion.puntos_otorgados ??
                10}{' '}
              pts
            </span>

            <span className="badge bg-secondary">
              {leccion.dificultad ||
                'básico'}
            </span>
          </div>
        </div>
      </div>

      {esEstudiante &&
        !completada && (
          <div
            className={`lesson-reading-bar ${
              puedeCompletar
                ? 'reading-done'
                : timerActivo
                  ? 'reading-active'
                  : 'reading-paused'
            }`}
          >
            <div className="reading-bar-track">
              <div
                className="reading-bar-fill"
                style={{
                  width:
                    `${porcentajeTiempo}%`
                }}
              />
            </div>

            <span className="reading-bar-label">
              {!timerActivo
                ? '⏸ Vuelve a esta pestaña para continuar'
                : puedeCompletar
                  ? '✅ Ya puedes completar la lección'
                  : tiempoCumplido &&
                      requierePractica &&
                      !practicaValidada
                    ? '🧪 Falta validar la práctica'
                    : '📖 Revisando contenido...'}
            </span>
          </div>
        )}

      <div className="lesson-main-grid">
        <section className="card p-4 lesson-video-card">
          <h4>
            Video principal
          </h4>

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

              <p>
                Recurso externo disponible
              </p>

              <a
                href={leccion.video_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-light"
                onClick={() => {
                  guardarTiempoPendiente();
                }}
              >
                Abrir recurso
              </a>
            </div>
          ) : (
            <div className="lesson-video-placeholder">
              <h2>▶</h2>

              <p>
                Video pendiente de carga
              </p>

              <small>
                El instructor podrá asociar un
                video desde el editor visual.
              </small>
            </div>
          )}
        </section>

        <aside className="card p-4 lesson-side-card">
          <h4>
            Progreso de la lección
          </h4>

          {esEstudiante &&
          progreso ? (
            <>
              <p className="mb-2">
                <strong>
                  Avance del curso
                </strong>
              </p>

              <p className="text-muted mb-2">
                {progreso.completadas}{' '}
                de {progreso.total}{' '}
                lecciones completadas
              </p>

              <div className="progress mb-3">
                <div
                  className="progress-bar"
                  style={{
                    width:
                      `${Math.min(
                        100,
                        Number(
                          progreso.porcentaje ||
                            0
                        )
                      )}%`
                  }}
                >
                  {progreso.porcentaje ||
                    0}
                  %
                </div>
              </div>

              {!completada ? (
                <>
                  <div className="lesson-side-status">
                    <div
                      className={`timer-dot ${
                        timerActivo
                          ? 'dot-active'
                          : 'dot-paused'
                      }`}
                    />

                    <span>
                      {timerActivo
                        ? 'Revisando contenido'
                        : 'Lectura pausada'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      Progreso de esta lección
                    </small>

                    <div className="progress mt-1">
                      <div
                        className="progress-bar"
                        style={{
                          width:
                            `${porcentajeTiempo}%`
                        }}
                      >
                        {porcentajeTiempo}%
                      </div>
                    </div>
                  </div>

                  {tiempoRestante >
                    0 && (
                    <p className="small text-muted mt-2 mb-0">
                      Tiempo restante
                      aproximado:{' '}
                      {formatTiempo(
                        tiempoRestante
                      )}
                    </p>
                  )}

                  {tiempoCumplido &&
                    requierePractica &&
                    !practicaValidada && (
                      <div className="alert alert-warning py-2 mt-3 mb-0">
                        Falta completar la
                        práctica.
                      </div>
                    )}

                  {puedeCompletar && (
                    <div className="alert alert-success py-2 mt-3 mb-0">
                      Ya puedes completar la
                      lección.
                    </div>
                  )}
                </>
              ) : (
                <div className="alert alert-success mb-0">
                  ✅ Lección completada
                </div>
              )}
            </>
          ) : (
            <p className="text-muted mb-0">
              Vista de contenido de la lección.
            </p>
          )}
        </aside>
      </div>

      {leccion.imagen_url && (
        <section className="card p-0 mt-4 lesson-cover-img">
          <img
            src={leccion.imagen_url}
            alt={leccion.titulo}
          />
        </section>
      )}

      <section className="card p-4 mt-4">
        <h3>
          Contenido de la lección
        </h3>

        <div className="lesson-content">
          {leccion.contenido_texto}
        </div>
      </section>

      <section className="card p-4 mt-4">
        <h3>
          Reto práctico
        </h3>

        <div className="alert alert-primary">
          <strong>
            Objetivo:
          </strong>{' '}

          {leccion.reto_practico ||
            'Realiza un pequeño ejercicio práctico relacionado con esta lección.'}
        </div>

        <AreaPractica
          leccion={leccion}
          onPracticaValidada={
            setPracticaValidada
          }
        />

        {requierePractica &&
          !practicaValidada &&
          esEstudiante &&
          !completada && (
            <div className="practice-required-notice">
              ⚠️ Esta lección requiere que
              ejecutes el ejercicio práctico
              antes de poder completarla.
            </div>
          )}
      </section>

      <RecursosExternos
        terminoInicial={
          `${curso.titulo} ${leccion.titulo}`
        }
        leccionId={leccion.id}
        autoBuscar={true}
      />

      {esEstudiante && (
        <div className="lesson-nav mt-4 mb-5">
          {completada ? (
            <button
              className="btn btn-secondary"
              disabled
            >
              ✓ Lección completada
            </button>
          ) : (
            <div className="lesson-complete-block">
              {tiempoError && (
                <div className="lesson-timer-error">
                  ⚠️ {tiempoError}
                </div>
              )}

              <button
                type="button"
                className={`btn ${
                  puedeCompletar
                    ? 'btn-success lesson-btn-ready'
                    : 'btn-secondary lesson-btn-locked'
                }`}
                onClick={
                  puedeCompletar
                    ? marcarCompletada
                    : undefined
                }
                disabled={
                  !puedeCompletar
                }
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
                to={
                  `/cursos/${curso.slug}/lecciones/${leccionAnterior.slug}`
                }
                onClick={() => {
                  guardarTiempoPendiente();
                }}
              >
                ← Lección anterior
              </Link>
            )}

            {siguienteLeccion &&
              completada && (
                <Link
                  className="btn btn-primary"
                  to={
                    `/cursos/${curso.slug}/lecciones/${siguienteLeccion.slug}`
                  }
                >
                  Próxima lección →
                </Link>
              )}

            {!siguienteLeccion &&
              completada && (
                <Link
                  className="btn btn-dark"
                  to={
                    `/cursos/${curso.slug}`
                  }
                >
                  Finalizar curso
                </Link>
              )}
          </div>
        </div>
      )}

      {esEstudiante && (
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