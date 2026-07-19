import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import './gestion-alumnos.css';

function GestionAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('todos');
  const [dificultadFiltro, setDificultadFiltro] = useState('todas');

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  const obtenerClaseDificultad = (dificultad) => {
    switch (dificultad) {
      case 'alta':
        return 'bg-danger';

      case 'media':
        return 'bg-warning text-dark';

      case 'sin datos':
        return 'bg-secondary';

      default:
        return 'bg-success';
    }
  };

  const obtenerTextoEstado = (alumno) => {
    const progreso = Number(
      alumno.progreso_porcentaje || 0
    );

    if (Number(alumno.total_lecciones || 0) === 0) {
      return 'Sin contenido';
    }

    if (progreso === 100) {
      return 'Completado';
    }

    if (progreso === 0) {
      return 'Sin iniciar';
    }

    return 'En progreso';
  };

  const obtenerClaseEstado = (alumno) => {
    const estado = obtenerTextoEstado(alumno);

    switch (estado) {
      case 'Completado':
        return 'bg-success';

      case 'En progreso':
        return 'bg-primary';

      case 'Sin iniciar':
        return 'bg-warning text-dark';

      default:
        return 'bg-secondary';
    }
  };

  const formatearTiempo = (segundos = 0) => {
    const total = Number(segundos || 0);

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);

    if (horas > 0) {
      return `${horas} h ${minutos} min`;
    }

    return `${minutos} min`;
  };

  const cerrarDetalle = () => {
    setAlumnoSeleccionado(null);
  };

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        setCargando(true);
        setError('');

        const response = await api.get('/docente/alumnos');

        const alumnosRecibidos =
          Array.isArray(response.data)
            ? response.data
            : response.data.alumnos || [];

        setAlumnos(alumnosRecibidos);
      } catch (errorPeticion) {
        console.error(
          'Error al cargar alumnos:',
          errorPeticion.response?.data ||
            errorPeticion.message
        );

        setError(
          errorPeticion.response?.data?.mensaje ||
            'No se pudieron cargar los alumnos.'
        );
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, []);

  useEffect(() => {
    if (alumnoSeleccionado) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [alumnoSeleccionado]);

  useEffect(() => {
    const cerrarConEscape = (event) => {
      if (
        event.key === 'Escape' &&
        alumnoSeleccionado
      ) {
        cerrarDetalle();
      }
    };

    window.addEventListener('keydown', cerrarConEscape);

    return () => {
      window.removeEventListener(
        'keydown',
        cerrarConEscape
      );
    };
  }, [alumnoSeleccionado]);

  const cursosDisponibles = useMemo(() => {
    const mapa = new Map();

    alumnos.forEach((alumno) => {
      if (
        alumno.curso_id &&
        alumno.curso_titulo
      ) {
        mapa.set(
          String(alumno.curso_id),
          alumno.curso_titulo
        );
      }
    });

    return Array.from(mapa.entries()).map(
      ([id, titulo]) => ({
        id,
        titulo
      })
    );
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const termino = busqueda
      .trim()
      .toLowerCase();

    return alumnos.filter((alumno) => {
      const nombreCompleto = `
        ${alumno.nombre || ''}
        ${alumno.apellido || ''}
        ${alumno.email || ''}
      `.toLowerCase();

      const coincideBusqueda =
        !termino ||
        nombreCompleto.includes(termino);

      const coincideCurso =
        cursoFiltro === 'todos' ||
        String(alumno.curso_id) === cursoFiltro;

      const coincideDificultad =
        dificultadFiltro === 'todas' ||
        alumno.dificultad === dificultadFiltro;

      return (
        coincideBusqueda &&
        coincideCurso &&
        coincideDificultad
      );
    });
  }, [
    alumnos,
    busqueda,
    cursoFiltro,
    dificultadFiltro
  ]);

  const totalInscripciones = alumnos.length;

  const alumnosUnicos = new Set(
    alumnos.map((alumno) =>
      String(alumno.usuario_id)
    )
  ).size;

  const alumnosRiesgo = alumnos.filter(
    (alumno) =>
      alumno.dificultad === 'alta'
  ).length;

  const promedioGeneral =
    alumnos.length > 0
      ? Math.round(
          alumnos.reduce(
            (acumulado, alumno) =>
              acumulado +
              Number(
                alumno.progreso_porcentaje || 0
              ),
            0
          ) / alumnos.length
        )
      : 0;

  return (
    <>
      <div className="container mt-4 mb-5">
        <div className="mb-4">
          <p className="text-muted mb-1">
            Panel docente
          </p>

          <h1>Gestión de alumnos</h1>

          <p className="text-muted">
            Revisa el progreso de los estudiantes
            inscritos en tus cursos.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card p-3 h-100">
              <small className="text-muted">
                Alumnos únicos
              </small>

              <h3 className="mb-0">
                {alumnosUnicos}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <small className="text-muted">
                Inscripciones
              </small>

              <h3 className="mb-0">
                {totalInscripciones}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <small className="text-muted">
                Progreso promedio
              </small>

              <h3 className="mb-0">
                {promedioGeneral}%
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 h-100">
              <small className="text-muted">
                En dificultad alta
              </small>

              <h3 className="mb-0 text-danger">
                {alumnosRiesgo}
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-3 mb-4">
          <div className="row g-3">
            <div className="col-lg-5">
              <label className="form-label">
                Buscar alumno
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Nombre o correo"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
              />
            </div>

            <div className="col-lg-4">
              <label className="form-label">
                Curso
              </label>

              <select
                className="form-select"
                value={cursoFiltro}
                onChange={(event) =>
                  setCursoFiltro(
                    event.target.value
                  )
                }
              >
                <option value="todos">
                  Todos los cursos
                </option>

                {cursosDisponibles.map((curso) => (
                  <option
                    key={curso.id}
                    value={curso.id}
                  >
                    {curso.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-3">
              <label className="form-label">
                Dificultad
              </label>

              <select
                className="form-select"
                value={dificultadFiltro}
                onChange={(event) =>
                  setDificultadFiltro(
                    event.target.value
                  )
                }
              >
                <option value="todas">
                  Todas
                </option>

                <option value="baja">
                  Baja
                </option>

                <option value="media">
                  Media
                </option>

                <option value="alta">
                  Alta
                </option>

                <option value="sin datos">
                  Sin datos
                </option>
              </select>
            </div>
          </div>
        </div>

        {cargando && (
          <div className="alert alert-info">
            Cargando alumnos...
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!cargando &&
          !error &&
          alumnosFiltrados.length === 0 && (
            <div className="alert alert-secondary">
              No se encontraron alumnos con los filtros
              seleccionados.
            </div>
          )}

        {!cargando &&
          !error &&
          alumnosFiltrados.length > 0 && (
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  Alumnos inscritos
                </h4>

                <span className="badge bg-secondary">
                  {alumnosFiltrados.length} resultado(s)
                </span>
              </div>

              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Curso</th>
                      <th>Progreso</th>
                      <th>Estado</th>
                      <th>Dificultad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {alumnosFiltrados.map(
                      (alumno) => {
                        const porcentaje = Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              alumno.progreso_porcentaje ||
                                0
                            )
                          )
                        );

                        const dificultad =
                          alumno.dificultad ||
                          'baja';

                        return (
                          <tr
                            key={`${alumno.usuario_id}-${alumno.curso_id}`}
                          >
                            <td>
                              <strong>
                                {alumno.nombre}{' '}
                                {alumno.apellido}
                              </strong>

                              <div className="text-muted small">
                                {alumno.email}
                              </div>
                            </td>

                            <td>
                              {alumno.curso_titulo}
                            </td>

                            <td
                              style={{
                                minWidth: '180px'
                              }}
                            >
                              <div className="d-flex justify-content-between mb-1">
                                <small>
                                  {
                                    alumno.lecciones_completadas
                                  }
                                  /
                                  {
                                    alumno.total_lecciones
                                  }{' '}
                                  lecciones
                                </small>

                                <small>
                                  {porcentaje}%
                                </small>
                              </div>

                              <div className="progress">
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${porcentaje}%`
                                  }}
                                />
                              </div>
                            </td>

                            <td>
                              <span
                                className={`badge ${obtenerClaseEstado(
                                  alumno
                                )}`}
                              >
                                {obtenerTextoEstado(
                                  alumno
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge ${obtenerClaseDificultad(
                                  dificultad
                                )}`}
                              >
                                {dificultad}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  setAlumnoSeleccionado(
                                    alumno
                                  )
                                }
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {alumnoSeleccionado && (
        <div
          className="student-modal-overlay"
          onMouseDown={cerrarDetalle}
        >
          <div
            className="student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="student-modal-header">
              <div>
                <p className="student-modal-eyebrow">
                  Detalle académico
                </p>

                <h2 id="student-modal-title">
                  {alumnoSeleccionado.nombre}{' '}
                  {alumnoSeleccionado.apellido}
                </h2>

                <p className="text-muted mb-0">
                  {alumnoSeleccionado.email}
                </p>
              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={cerrarDetalle}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="student-modal-body">
              <section className="student-detail-hero">
                <div>
                  <small className="text-muted">
                    Curso
                  </small>

                  <h4>
                    {alumnoSeleccionado.curso_titulo}
                  </h4>
                </div>

                <span
                  className={`badge ${obtenerClaseDificultad(
                    alumnoSeleccionado.dificultad
                  )}`}
                >
                  Dificultad{' '}
                  {alumnoSeleccionado.dificultad ||
                    'baja'}
                </span>
              </section>

              <div className="student-detail-grid">
                <div className="student-detail-card">
                  <span>Progreso</span>

                  <strong>
                    {Number(
                      alumnoSeleccionado.progreso_porcentaje ||
                        0
                    )}
                    %
                  </strong>
                </div>

                <div className="student-detail-card">
                  <span>Lecciones</span>

                  <strong>
                    {Number(
                      alumnoSeleccionado.lecciones_completadas ||
                        0
                    )}
                    /
                    {Number(
                      alumnoSeleccionado.total_lecciones ||
                        0
                    )}
                  </strong>
                </div>

                <div className="student-detail-card">
                  <span>Tiempo acumulado</span>

                  <strong>
                    {formatearTiempo(
                      alumnoSeleccionado.tiempo_total_segundos
                    )}
                  </strong>
                </div>

                <div className="student-detail-card">
                  <span>Uso del bot</span>

                  <strong>
                    {Number(
                      alumnoSeleccionado.consultas_bot ||
                        0
                    )}{' '}
                    consultas
                  </strong>
                </div>
              </div>

              <section className="student-progress-section">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">
                    Avance del curso
                  </h5>

                  <span>
                    {Number(
                      alumnoSeleccionado.progreso_porcentaje ||
                        0
                    )}
                    %
                  </span>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(
                        100,
                        Number(
                          alumnoSeleccionado.progreso_porcentaje ||
                            0
                        )
                      )}%`
                    }}
                  />
                </div>
              </section>

              <section className="student-analysis-section">
                <h5>Análisis académico</h5>

                <div
                  className={`alert ${
                    alumnoSeleccionado.dificultad === 'alta'
                      ? 'alert-danger'
                      : alumnoSeleccionado.dificultad === 'media'
                        ? 'alert-warning'
                        : alumnoSeleccionado.dificultad === 'sin datos'
                          ? 'alert-secondary'
                          : 'alert-success'
                  }`}
                >
                  <strong>
                    Nivel de dificultad:{' '}
                    {alumnoSeleccionado.dificultad}
                  </strong>

                  <div className="mt-2">
                    Puntaje de riesgo:{' '}
                    {alumnoSeleccionado.puntaje_riesgo || 0}
                  </div>

                  {alumnoSeleccionado.razones_dificultad?.length > 0 && (
                    <ul className="mt-2 mb-0">
                      {alumnoSeleccionado.razones_dificultad.map(
                        (razon, index) => (
                          <li key={index}>
                            {razon}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            <div className="student-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionAlumnos;