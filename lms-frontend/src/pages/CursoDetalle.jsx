import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

function CursoDetalle() {
  const { id } = useParams();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [progreso, setProgreso] = useState(null);

  const cargarDatos = async () => {
    try {
      const cursosRes = await api.get('/cursos');
      const cursoActual = cursosRes.data.find((c) => c.id === id);
      setCurso(cursoActual);

      const insRes = await api.get('/inscripciones');

      const acceso =
        usuario?.rol === 'admin' ||
        usuario?.rol === 'instructor' ||
        insRes.data.some(
          (i) => i.usuario_id === usuario?.id && i.curso_id === id
        );

      setTieneAcceso(acceso);

      if (usuario?.rol === 'estudiante') {
        const progresoRes = await api.get(`/progreso/${usuario.id}/${id}`);
        setProgreso(progresoRes.data);
      }

      const modulosRes = await api.get('/modulos');
      const modulosCurso = modulosRes.data
        .filter((m) => m.curso_id === id)
        .sort((a, b) => a.orden - b.orden);

      setModulos(modulosCurso);

      const leccionesRes = await api.get('/lecciones');
      setLecciones(leccionesRes.data);
    } catch (error) {
      console.error('Error al cargar detalle del curso:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (!curso) {
    return <div className="container mt-4">Cargando curso...</div>;
  }

  if (!tieneAcceso) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          No tienes acceso a este curso. Primero debes comprarlo.
        </div>

        <Link className="btn btn-primary" to="/cursos">
          Volver a cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" data-ai-context="true">
      <div className="card p-4 mb-4">
        <h1>{curso.titulo}</h1>
        <p>{curso.descripcion}</p>

        <p>
          <strong>Nivel:</strong> {curso.nivel} |{' '}
          <strong>Estado:</strong> {curso.estado} |{' '}
          <strong>Precio:</strong> S/ {curso.precio}
        </p>
      </div>

      {usuario?.rol === 'estudiante' && progreso && (
        <div className="card p-3 mb-4">
          <h4>Tu progreso</h4>

          <p>
            {progreso.completadas} de {progreso.total} lecciones completadas
          </p>

          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${progreso.porcentaje}%` }}
            >
              {progreso.porcentaje}%
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
        <p>Este curso todavía no tiene temas registrados.</p>
      )}

      <div className="accordion" id="accordionTemas">
        {modulos.map((modulo, moduloIndex) => {
          const leccionesDelModulo = lecciones
            .filter((leccion) => leccion.modulo_id === modulo.id)
            .sort((a, b) => a.orden - b.orden);

          const completadasModulo = leccionesDelModulo.filter((leccion) => {
            const leccionProgreso = progreso?.lecciones?.find(
              (p) => p.leccion_id === leccion.id
            );

            return leccionProgreso?.completado;
          }).length;

          return (
            <div key={modulo.id} className="accordion-item mb-3">
              <h2 className="accordion-header" id={`heading-${modulo.id}`}>
                <button
                  className={`accordion-button ${moduloIndex !== 0 ? 'collapsed' : ''}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${modulo.id}`}
                  aria-expanded={moduloIndex === 0 ? 'true' : 'false'}
                  aria-controls={`collapse-${modulo.id}`}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center pe-3">
                    <span>
                      Tema {modulo.orden}: {modulo.titulo}
                    </span>

                    <small className="text-muted">
                      {completadasModulo}/{leccionesDelModulo.length} lecciones
                    </small>
                  </div>
                </button>
              </h2>

              <div
                id={`collapse-${modulo.id}`}
                className={`accordion-collapse collapse ${moduloIndex === 0 ? 'show' : ''}`}
                aria-labelledby={`heading-${modulo.id}`}
                data-bs-parent="#accordionTemas"
              >
                <div className="accordion-body">
                  {modulo.descripcion && (
                    <p className="text-muted">{modulo.descripcion}</p>
                  )}

                  {leccionesDelModulo.length === 0 ? (
                    <p>No hay lecciones registradas en este tema.</p>
                  ) : (
                    leccionesDelModulo.map((leccion, index) => {
                      const leccionProgreso = progreso?.lecciones?.find(
                        (p) => p.leccion_id === leccion.id
                      );

                      return (
                        <div key={leccion.id} className="border rounded p-3 mb-2">
                          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <div>
                              <h5>
                                Lección {index + 1}: {leccion.titulo}{' '}
                                {leccionProgreso?.completado && (
                                  <span className="badge bg-success ms-2">
                                    Completada
                                  </span>
                                )}
                              </h5>

                              <p className="mb-1">
                                <strong>Tipo:</strong> {leccion.tipo} |{' '}
                                <strong>Puntos:</strong> {leccion.puntos_otorgados} |{' '}
                                <strong>XP:</strong> {leccion.xp_otorgada ?? leccion.puntos_otorgados ?? 10}
                              </p>

                              {leccion.video_url && (
                                <small className="text-muted">
                                  Recurso de video disponible
                                </small>
                              )}
                            </div>

                            <Link
                              className={`btn btn-sm ${
                                leccionProgreso?.completado
                                  ? 'btn-outline-success'
                                  : 'btn-success'
                              }`}
                              to={`/cursos/${curso.id}/lecciones/${leccion.id}`}
                            >
                              {leccionProgreso?.completado
                                ? 'Revisar lección'
                                : 'Abrir lección'}
                            </Link>
                          </div>
                        </div>
                      );
                    })
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