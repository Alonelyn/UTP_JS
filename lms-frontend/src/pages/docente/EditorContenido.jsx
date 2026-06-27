import { useEffect, useState } from 'react';
import api from '../../api/axios';

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
        <h1 className="page-title">Editor visual de contenido</h1>
        <p className="page-sub">
          Edita temas, lecciones, puntos, XP y recursos de apoyo.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <h4>Seleccionar curso</h4>

        <select
          className="form-control"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
        >
          <option value="">Selecciona un curso</option>

          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.titulo}
            </option>
          ))}
        </select>
      </div>

      {cursoId && (
        <div className="row">
          <div className="col-md-5">
            <div className="card p-4 mb-4">
              <h4>{moduloEditando ? 'Editar tema/módulo' : 'Selecciona un tema'}</h4>

              {moduloEditando ? (
                <form onSubmit={actualizarModulo}>
                  <input
                    className="form-control mb-2"
                    placeholder="Título del tema"
                    value={formModulo.titulo}
                    onChange={(e) =>
                      setFormModulo({ ...formModulo, titulo: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Orden"
                    value={formModulo.orden}
                    onChange={(e) =>
                      setFormModulo({ ...formModulo, orden: Number(e.target.value) })
                    }
                  />
                  <small className="text-muted d-block mb-2">
                    El orden define la posición del tema dentro del curso. Ejemplo: 1, 2, 3...
                  </small>

                  <button className="btn btn-success me-2" type="submit">
                    Guardar tema
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModuloEditando(null)}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <p className="text-muted">
                  Elige un tema de la lista inferior para editarlo.
                </p>
              )}
            </div>

            {modulosCurso.map((modulo) => (
              <div key={modulo.id} className="card p-3 mb-3">
                <h5>
                  Tema {modulo.orden}: {modulo.titulo}
                </h5>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => cargarModulo(modulo)}
                  >
                    Editar tema
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminarModulo(modulo.id)}
                  >
                    Eliminar tema
                  </button>
                </div>

                <hr />

                {lecciones
                  .filter((l) => l.modulo_id === modulo.id)
                  .sort((a, b) => a.orden - b.orden)
                  .map((leccion) => (
                    <div key={leccion.id} className="border rounded p-2 mb-2">
                      <strong>
                        Lección {leccion.orden}: {leccion.titulo}
                      </strong>

                      <p className="mb-1">
                        Tipo: {leccion.tipo} · Puntos: {leccion.puntos_otorgados}
                      </p>

                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => cargarLeccion(leccion)}
                      >
                        Editar lección
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarLeccion(leccion.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="col-md-7">
            <div className="card p-4">
              <h4>
                {leccionEditando
                  ? 'Editar lección'
                  : 'Selecciona una lección para editar'}
              </h4>

              {leccionEditando ? (
                <form onSubmit={actualizarLeccion}>
                    <label className="form-label">Tema / módulo de la lección</label>
                    <select
                        className="form-control mb-2"
                        value={formLeccion.modulo_id}
                        onChange={(e) =>
                        setFormLeccion({ ...formLeccion, modulo_id: e.target.value })
                        }
                    >
                        <option value="">Selecciona tema/módulo</option>

                        {modulosCurso.map((modulo) => (
                        <option key={modulo.id} value={modulo.id}>
                            Tema {modulo.orden}: {modulo.titulo}
                        </option>
                        ))}
                    </select>

                    <small className="text-muted d-block mb-3">
                        Este campo evita que la lección se salga del curso al editarla.
                    </small>

                    <input
                        className="form-control mb-2"
                        placeholder="Título de la lección"
                        value={formLeccion.titulo}
                        onChange={(e) =>
                        setFormLeccion({ ...formLeccion, titulo: e.target.value })
                        }
                    />

                    <select
                        className="form-control mb-2"
                        value={formLeccion.tipo}
                        onChange={(e) =>
                        setFormLeccion({ ...formLeccion, tipo: e.target.value })
                        }
                    >
                        <option value="texto">Texto</option>
                        <option value="video">Video</option>
                        <option value="examen">Examen</option>
                        <option value="interactivo">Interactivo</option>
                    </select>

                    <input
                        className="form-control mb-2"
                        type="number"
                        placeholder="Orden de la lección"
                        value={formLeccion.orden}
                        onChange={(e) =>
                        setFormLeccion({ ...formLeccion, orden: Number(e.target.value) })
                        }
                    />

                    <input
                        className="form-control mb-2"
                        type="number"
                        placeholder="Puntos de la lección"
                        value={formLeccion.puntos_otorgados}
                        onChange={(e) =>
                        setFormLeccion({
                            ...formLeccion,
                            puntos_otorgados: Number(e.target.value)
                        })
                        }
                    />

                    <input
                        className="form-control mb-2"
                        type="number"
                        placeholder="XP otorgada"
                        value={formLeccion.xp_otorgada}
                        onChange={(e) =>
                        setFormLeccion({
                            ...formLeccion,
                            xp_otorgada: Number(e.target.value)
                        })
                        }
                    />

                    <input
                        className="form-control mb-2"
                        placeholder="URL de video simulado o recurso"
                        value={formLeccion.video_url}
                        onChange={(e) =>
                        setFormLeccion({ ...formLeccion, video_url: e.target.value })
                        }
                    />

                    <textarea
                        className="form-control mb-3"
                        rows="10"
                        placeholder="Contenido completo de la lección"
                        value={formLeccion.contenido_texto}
                        onChange={(e) =>
                        setFormLeccion({
                            ...formLeccion,
                            contenido_texto: e.target.value
                        })
                        }
                    />

                    <div className="d-flex gap-2">
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
                    </div>
                    </form>
              ) : (
                <p className="text-muted">
                  Desde aquí podrás modificar el contenido, puntos, XP y video de cada lección.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorContenido;