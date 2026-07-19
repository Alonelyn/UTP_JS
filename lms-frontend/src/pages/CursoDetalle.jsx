import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

function CursoDetalle() {
  const { cursoSlug } = useParams();

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

const cargarDatos = async () => {
  try {
    setCargando(true);
    setError('');

    const cursosRes = await api.get('/cursos');

    const cursoActual = cursosRes.data.find(
      (cursoItem) => cursoItem.slug === cursoSlug
    );

    if (!cursoActual) {
      setCurso(null);
      setError('Curso no encontrado o no disponible.');
      return;
    }

    setCurso(cursoActual);

    let acceso = false;

    if (usuario?.rol === 'admin') {
      acceso = true;
    } else if (
      usuario?.rol === 'instructor' &&
      String(cursoActual.instructor_id) === String(usuario.id)
    ) {
      acceso = true;
    } else if (usuario?.rol === 'estudiante') {
      const accesoRes = await api.get(
        `/inscripciones/verificar/${cursoActual.id}`
      );

      acceso = accesoRes.data.tieneAcceso === true;
    }

    setTieneAcceso(acceso);

    if (!acceso) {
      return;
    }

    const modulosRes = await api.get('/modulos');

    const modulosDelCurso = modulosRes.data
      .filter(
        (modulo) =>
          String(modulo.curso_id) === String(cursoActual.id)
      )
      .sort(
        (moduloA, moduloB) =>
          Number(moduloA.orden) - Number(moduloB.orden)
      );

    setModulos(modulosDelCurso);

    if (usuario?.rol === 'estudiante') {
      const [progresoRes, rutaRes] = await Promise.all([
        api.get(`/progreso/${usuario.id}/${cursoActual.id}`),
        api.get(`/progreso/ruta/${cursoActual.id}`)
      ]);

      setProgreso(progresoRes.data);

      const leccionesConBloqueo =
        rutaRes.data.lecciones.map((leccion) => ({
          ...leccion,

          id: leccion.leccion_id,
          modulo_id: leccion.modulo_id,

          completado: Boolean(leccion.completado),
          bloqueada: Boolean(leccion.bloqueada)
        }));

      setLecciones(leccionesConBloqueo);
    } else {
      const leccionesRes = await api.get('/lecciones');

      const idsModulos = modulosDelCurso.map(
        (modulo) => String(modulo.id)
      );

      const leccionesDelCurso = leccionesRes.data
        .filter((leccion) =>
          idsModulos.includes(String(leccion.modulo_id))
        )
        .sort(
          (leccionA, leccionB) =>
            Number(leccionA.orden) - Number(leccionB.orden)
        )
        .map((leccion) => ({
          ...leccion,
          bloqueada: false,
          completado: false
        }));

      setLecciones(leccionesDelCurso);
    }
  } catch (errorPeticion) {
    console.error(
      'Error al cargar detalle del curso:',
      errorPeticion.response?.data || errorPeticion.message
    );

    setError(
      errorPeticion.response?.data?.mensaje ||
        'No se pudo cargar el detalle del curso.'
    );
  } finally {
    setCargando(false);
  }
};

  useEffect(() => {
    cargarDatos();
  }, [cursoSlug]);

  if (cargando) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          Cargando curso...
        </div>
      </div>
    );
  }

  if (error && !curso) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link className="btn btn-primary" to="/cursos">
          Volver a cursos
        </Link>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container mt-4">
        Curso no encontrado.
      </div>
    );
  }

  if (!tieneAcceso) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          No tienes acceso a este curso. Primero debes inscribirte.
        </div>

        <Link className="btn btn-primary" to="/cursos">
          Volver a cursos
        </Link>
      </div>
    );
  }

  return (
    <div
      className="container mt-4"
      data-ai-context="true"
    >
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card p-4 mb-4">
        <h1>{curso.titulo}</h1>

        <p>{curso.descripcion}</p>

        <p>
          <strong>Nivel:</strong> {curso.nivel}
          {' | '}

          <strong>Estado:</strong> {curso.estado}
          {' | '}

          <strong>Precio:</strong> S/ {curso.precio}
        </p>
      </div>

      {usuario?.rol === 'estudiante' && progreso && (
        <div className="card p-3 mb-4">
          <h4>Tu progreso</h4>

          <p>
            {progreso.completadas} de {progreso.total}{' '}
            lecciones completadas
          </p>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${progreso.porcentaje || 0}%`
              }}
            >
              {progreso.porcentaje || 0}%
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Contenido del curso</h2>

        <span className="badge bg-secondary">
          {modulos.length} tema(s)
        </span>
      </div>

      {modulos.length === 0 && (
        <p>
          Este curso todavía no tiene temas registrados.
        </p>
      )}

      <div
        className="accordion"
        id="accordionTemas"
      >
        {modulos.map((modulo, moduloIndex) => {
          const leccionesDelModulo = lecciones
          .filter(
            (leccion) =>
              String(leccion.modulo_id) === String(modulo.id)
          )
          .sort(
            (leccionA, leccionB) =>
              Number(leccionA.orden_leccion ?? leccionA.orden ?? 0) -
              Number(leccionB.orden_leccion ?? leccionB.orden ?? 0)
          );

          const completadasModulo =
            leccionesDelModulo.filter(
              (leccion) => leccion.completado
            ).length;

          /*
           * Un módulo se considera bloqueado cuando todas sus
           * lecciones están bloqueadas.
           */
          const moduloBloqueado =
            usuario?.rol === 'estudiante' &&
            leccionesDelModulo.length > 0 &&
            leccionesDelModulo.every(
              (leccion) => leccion.bloqueada
            );

          return (
            <div
              key={modulo.id}
              className="accordion-item mb-3"
            >
              <h2
                className="accordion-header"
                id={`heading-${modulo.id}`}
              >
                <button
                  className={`accordion-button ${
                    moduloIndex !== 0 ? 'collapsed' : ''
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${modulo.id}`}
                  aria-expanded={
                    moduloIndex === 0 ? 'true' : 'false'
                  }
                  aria-controls={`collapse-${modulo.id}`}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center pe-3">
                    <span>
                      <h3 className="mb-0">
                        {moduloBloqueado && '🔒 '}
                        {modulo.titulo}
                      </h3>
                    </span>

                    <small className="text-muted">
                      {completadasModulo}/
                      {leccionesDelModulo.length} lecciones
                    </small>
                  </div>
                </button>
              </h2>

              <div
                id={`collapse-${modulo.id}`}
                className={`accordion-collapse collapse ${
                  moduloIndex === 0 ? 'show' : ''
                }`}
                aria-labelledby={`heading-${modulo.id}`}
                data-bs-parent="#accordionTemas"
              >
                <div className="accordion-body">
                  {modulo.descripcion && (
                    <p className="text-muted">
                      {modulo.descripcion}
                    </p>
                  )}

                  {leccionesDelModulo.length === 0 ? (
                    <p>
                      No hay lecciones registradas en este tema.
                    </p>
                  ) : (
                    leccionesDelModulo.map(
                      (leccion, index) => {
                        const estaCompletada =
                          leccion.completado === true;

                        const estaBloqueada =
                          usuario?.rol === 'estudiante' &&
                          leccion.bloqueada === true;

                        return (
                          <div
                            key={leccion.id}
                            className={`border rounded p-3 mb-2 ${
                              estaBloqueada
                                ? 'bg-light opacity-75'
                                : ''
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                              <div>
                                <h5>
                                  {estaBloqueada
                                    ? '🔒 '
                                    : estaCompletada
                                      ? '✅ '
                                      : '▶️ '}

                                  Lección {index + 1}:{' '}
                                  {leccion.titulo}

                                  {estaCompletada && (
                                    <span className="badge bg-success ms-2">
                                      Completada
                                    </span>
                                  )}

                                  {estaBloqueada && (
                                    <span className="badge bg-secondary ms-2">
                                      Bloqueada
                                    </span>
                                  )}
                                </h5>

                                <p className="mb-1">
                                  <strong>Tipo:</strong>{' '}
                                  {leccion.tipo}
                                  {' | '}

                                  <strong>Puntos:</strong>{' '}
                                  {leccion.puntos_otorgados || 0}
                                  {' | '}

                                  <strong>XP:</strong>{' '}
                                  {leccion.xp_otorgada ??
                                    leccion.puntos_otorgados ??
                                    10}
                                </p>

                                {estaBloqueada && (
                                  <small className="text-muted">
                                    Completa la lección anterior
                                    para desbloquear esta lección.
                                  </small>
                                )}

                                {!estaBloqueada &&
                                  leccion.video_url && (
                                    <small className="text-muted">
                                      Recurso de video disponible
                                    </small>
                                  )}
                              </div>

                              {estaBloqueada ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  disabled
                                >
                                  🔒 Lección bloqueada
                                </button>
                              ) : (
                                <Link
                                  className={`btn btn-sm ${
                                    estaCompletada
                                      ? 'btn-outline-success'
                                      : 'btn-success'
                                  }`}
                                  to={`/cursos/${curso.slug}/lecciones/${leccion.slug}`}
                                >
                                  {estaCompletada
                                    ? 'Revisar lección'
                                    : 'Abrir lección'}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CursoDetalle;