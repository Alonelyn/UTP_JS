import { useEffect, useState } from 'react';
import api from '../../api/axios';
import '../../styles/editor-visual.css';

function EditorContenido() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);

  const [cursoId, setCursoId] = useState('');
  const [moduloEditando, setModuloEditando] = useState(null);
  const [leccionEditando, setLeccionEditando] = useState(null);

  const [formModulo, setFormModulo] = useState({
    titulo: '',
    orden: 1
  });

  const [formLeccion, setFormLeccion] = useState({
    modulo_id: '',
    titulo: '',
    tipo: 'texto',
    orden: 1,
    contenido_texto: '',
    puntos_otorgados: 10,
    video_url: '',
    xp_otorgada: 10
  });

  const cargarDatos = async () => {
    const cursosRes = await api.get('/cursos');
    const modulosRes = await api.get('/modulos');
    const leccionesRes = await api.get('/lecciones');

    setCursos(cursosRes.data);
    setModulos(modulosRes.data);
    setLecciones(leccionesRes.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!usuario || (usuario.rol !== 'instructor' && usuario.rol !== 'admin')) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Acceso restringido. Solo docentes o administradores.
        </div>
      </div>
    );
  }

  const modulosCurso = modulos
    .filter((m) => m.curso_id === cursoId)
    .sort((a, b) => a.orden - b.orden);

  const cargarModulo = (modulo) => {
    setModuloEditando(modulo.id);
    setFormModulo({
      titulo: modulo.titulo,
      orden: modulo.orden
    });
  };

  const actualizarModulo = async (e) => {
    e.preventDefault();

    await api.put(`/modulos/${moduloEditando}`, formModulo);

    setModuloEditando(null);
    setFormModulo({ titulo: '', orden: 1 });
    cargarDatos();
  };

  const eliminarModulo = async (id) => {
    if (!confirm('¿Eliminar este tema/módulo? También podría afectar sus lecciones.')) return;

    await api.delete(`/modulos/${id}`);
    cargarDatos();
  };

  const cargarLeccion = (leccion) => {
    setLeccionEditando(leccion.id);
    setFormLeccion({
      modulo_id: leccion.modulo_id || '',
      titulo: leccion.titulo || '',
      tipo: leccion.tipo || 'texto',
      orden: leccion.orden || 1,
      contenido_texto: leccion.contenido_texto || '',
      puntos_otorgados: leccion.puntos_otorgados || 10,
      video_url: leccion.video_url || '',
      xp_otorgada: leccion.xp_otorgada || leccion.puntos_otorgados || 10
    });
  };

  const actualizarLeccion = async (e) => {
    e.preventDefault();

    await api.put(`/lecciones/${leccionEditando}`, formLeccion);

    setLeccionEditando(null);
    setFormLeccion({
      titulo: '',
      tipo: 'texto',
      orden: 1,
      contenido_texto: '',
      puntos_otorgados: 10,
      video_url: '',
      xp_otorgada: 10
    });

    cargarDatos();
  };

  const eliminarLeccion = async (id) => {
    if (!confirm('¿Eliminar esta lección?')) return;

    await api.delete(`/lecciones/${id}`);
    cargarDatos();
  };

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="gestion-head">
        <p className="eyebrow">Editor docente</p>
        <h1 className="page-title">Constructor visual de contenido</h1>
        <p className="page-sub">
          Organiza cursos, temas, lecciones, videos, puntos y XP desde una vista completa.
        </p>
      </div>

      <div className="editor-course-select">
        <h4>Seleccionar curso</h4>

        <select
          className="form-control"
          value={cursoId}
          onChange={(e) => {
            setCursoId(e.target.value);
            setModuloEditando(null);
            setLeccionEditando(null);
          }}
        >
          <option value="">Selecciona un curso</option>

          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.titulo}
            </option>
          ))}
        </select>
      </div>

      {!cursoId ? (
        <div className="editor-empty editor-panel">
          <h3>Selecciona un curso para comenzar</h3>
          <p>
            Aquí podrás editar visualmente sus temas, lecciones, recursos y experiencia del estudiante.
          </p>
        </div>
      ) : (
        <div className="editor-layout">
          <aside className="editor-panel">
            <h3>Estructura del curso</h3>
            <p className="text-muted">
              Selecciona un tema o lección para editar.
            </p>

            <div className="editor-tree">
              {modulosCurso.length === 0 && (
                <p>No hay temas registrados en este curso.</p>
              )}

              {modulosCurso.map((modulo) => {
                const leccionesModulo = lecciones
                  .filter((l) => l.modulo_id === modulo.id)
                  .sort((a, b) => a.orden - b.orden);

                return (
                  <div key={modulo.id} className="editor-module">
                    <div className="editor-module-head">
                      <div>
                        <div className="editor-module-title">
                          Tema {modulo.orden}: {modulo.titulo}
                        </div>
                        <small>{leccionesModulo.length} lección(es)</small>
                      </div>

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => cargarModulo(modulo)}
                      >
                        Editar
                      </button>
                    </div>

                    {leccionesModulo.map((leccion) => (
                      <div
                        key={leccion.id}
                        className={`editor-lesson-item ${
                          leccionEditando === leccion.id ? 'active' : ''
                        }`}
                        onClick={() => cargarLeccion(leccion)}
                      >
                        <strong>
                          Lección {leccion.orden}: {leccion.titulo}
                        </strong>

                        <div>
                          <small>
                            {leccion.tipo} · {leccion.puntos_otorgados} pts · XP {leccion.xp_otorgada || leccion.puntos_otorgados}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="editor-panel">
            {moduloEditando && (
              <>
                <h3>Editar tema / módulo</h3>

                <form onSubmit={actualizarModulo}>
                  <div className="editor-form-grid">
                    <div className="editor-full">
                      <label className="form-label">Título del tema</label>
                      <input
                        className="form-control"
                        value={formModulo.titulo}
                        onChange={(e) =>
                          setFormModulo({ ...formModulo, titulo: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="form-label">Orden</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formModulo.orden}
                        onChange={(e) =>
                          setFormModulo({
                            ...formModulo,
                            orden: Number(e.target.value)
                          })
                        }
                      />
                    </div>
                  </div>

                  <small className="text-muted d-block mt-2">
                    El orden define la posición del tema dentro del curso.
                  </small>

                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success" type="submit">
                      Guardar tema
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setModuloEditando(null)}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => eliminarModulo(moduloEditando)}
                    >
                      Eliminar tema
                    </button>
                  </div>
                </form>

                <hr />
              </>
            )}

            {leccionEditando ? (
              <>
                <h3>Editar lección</h3>

                <form onSubmit={actualizarLeccion}>
                  <div className="editor-form-grid">
                    <div className="editor-full">
                      <label className="form-label">Tema / módulo</label>
                      <select
                        className="form-control"
                        value={formLeccion.modulo_id}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            modulo_id: e.target.value
                          })
                        }
                      >
                        <option value="">Selecciona tema/módulo</option>

                        {modulosCurso.map((modulo) => (
                          <option key={modulo.id} value={modulo.id}>
                            Tema {modulo.orden}: {modulo.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="editor-full">
                      <label className="form-label">Título de la lección</label>
                      <input
                        className="form-control"
                        value={formLeccion.titulo}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            titulo: e.target.value
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-control"
                        value={formLeccion.tipo}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            tipo: e.target.value
                          })
                        }
                      >
                        <option value="texto">Texto</option>
                        <option value="video">Video</option>
                        <option value="examen">Examen</option>
                        <option value="interactivo">Interactivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Orden</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.orden}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            orden: Number(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="form-label">Puntos</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.puntos_otorgados}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            puntos_otorgados: Number(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="form-label">XP otorgada</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.xp_otorgada}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            xp_otorgada: Number(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div className="editor-full">
                      <label className="form-label">URL de video o recurso</label>
                      <input
                        className="form-control"
                        placeholder="https://..."
                        value={formLeccion.video_url}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            video_url: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="editor-full">
                      <label className="form-label">Contenido de la lección</label>
                      <textarea
                        className="form-control"
                        rows="12"
                        value={formLeccion.contenido_texto}
                        onChange={(e) =>
                          setFormLeccion({
                            ...formLeccion,
                            contenido_texto: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <button className="btn btn-success" type="submit">
                      Guardar lección
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setLeccionEditando(null)}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => eliminarLeccion(leccionEditando)}
                    >
                      Eliminar lección
                    </button>
                  </div>
                </form>
              </>
            ) : !moduloEditando ? (
              <div className="editor-empty">
                <h3>Selecciona una lección</h3>
                <p>
                  Desde aquí podrás editar contenido, tipo, puntos, XP, video y módulo relacionado.
                </p>
              </div>
            ) : null}
          </main>

          <aside className="editor-panel editor-preview">
            <h3>Vista previa</h3>
            <p className="text-muted">
              Así se verá la lección para el estudiante.
            </p>

            {leccionEditando ? (
              <div className="preview-card">
                <span className="badge bg-primary mb-2">
                  {formLeccion.tipo}
                </span>

                <h4>{formLeccion.titulo || 'Título de la lección'}</h4>

                <p>
                  <strong>Puntos:</strong> {formLeccion.puntos_otorgados} ·{' '}
                  <strong>XP:</strong> {formLeccion.xp_otorgada}
                </p>

                <div className="preview-video">
                  {formLeccion.video_url ? (
                    <div>
                      <strong>Video / recurso agregado</strong>
                      <br />
                      <small>{formLeccion.video_url}</small>
                    </div>
                  ) : (
                    <div>
                      <h2>▶</h2>
                      <p>Video simulado</p>
                    </div>
                  )}
                </div>

                <div className="preview-content">
                  {formLeccion.contenido_texto || 'Contenido de la lección...'}
                </div>
              </div>
            ) : (
              <div className="preview-card">
                <p>Selecciona una lección para ver su vista previa.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default EditorContenido;