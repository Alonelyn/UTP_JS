import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/editor-visual.css';

/* ─── Helpers ────────────────────────────────────────────────── */

/**
 * Calcula la duración mínima automática (en segundos) a partir
 * del contenido de la lección. El instructor puede sobrescribirla.
 */
function calcularDuracionAuto(formLeccion) {
  const contenido = formLeccion.contenido_texto || '';
  const palabras  = contenido.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const tiempoLectura = Math.ceil((palabras / 180) * 60);
  const bonusVideo    = formLeccion.video_url  ? 180 : 0;
  const bonusTipo     =
    formLeccion.tipo === 'interactivo' ? 300
    : formLeccion.tipo === 'examen'   ? 600
    : formLeccion.tipo === 'video'    ? 240
    : 90;

  return Math.max(60, Math.min(3600, tiempoLectura + bonusVideo + bonusTipo));
}

const FORM_LECCION_VACIO = {
  modulo_id:        '',
  titulo:           '',
  tipo:             'texto',
  orden:            1,
  contenido_texto:  '',
  puntos_otorgados: 10,
  video_url:        '',
  xp_otorgada:      10,
  duracion_minima:  '',
  reto_practico:    '',
  dificultad:       'básico',
  imagen_url:       ''
};

/* ─── Componente ─────────────────────────────────────────────── */

function EditorContenido() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario?.rol === 'admin';

  const [cursos,   setCursos]   = useState([]);
  const [modulos,  setModulos]  = useState([]);
  const [lecciones, setLecciones] = useState([]);

  const [cursoId,         setCursoId]         = useState('');
  const [moduloEditando,  setModuloEditando]  = useState(null);
  const [leccionEditando, setLeccionEditando] = useState(null);

  const [formModulo, setFormModulo] = useState({ titulo: '', orden: 1 });
  const [formLeccion, setFormLeccion] = useState(FORM_LECCION_VACIO);
  const [guardado, setGuardado] = useState(false);

  const cargarDatos = async () => {
    const cursosRes   = await api.get('/cursos');
    const modulosRes  = await api.get('/modulos');
    const leccionesRes = await api.get('/lecciones');

    // Instructor solo ve sus cursos; admin ve todos
    const listaCursos = esAdmin
      ? cursosRes.data
      : cursosRes.data.filter((c) => c.instructor_id === usuario?.id);

    setCursos(listaCursos);
    setModulos(modulosRes.data);
    setLecciones(leccionesRes.data);
  };

  useEffect(() => { cargarDatos(); }, []);

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

  /* ── Módulo ──────────────────────────────────────────────── */

  const cargarModulo = (modulo) => {
    setModuloEditando(modulo.id);
    setLeccionEditando(null);
    setFormModulo({ titulo: modulo.titulo, orden: modulo.orden });
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

  /* ── Lección ─────────────────────────────────────────────── */

  const cargarLeccion = (leccion) => {
    setLeccionEditando(leccion.id);
    setModuloEditando(null);
    setGuardado(false);
    setFormLeccion({
      modulo_id:        leccion.modulo_id         || '',
      titulo:           leccion.titulo             || '',
      tipo:             leccion.tipo               || 'texto',
      orden:            leccion.orden              || 1,
      contenido_texto:  leccion.contenido_texto    || '',
      puntos_otorgados: leccion.puntos_otorgados   || 10,
      video_url:        leccion.video_url          || '',
      xp_otorgada:      leccion.xp_otorgada        || leccion.puntos_otorgados || 10,
      duracion_minima:  leccion.duracion_minima    || '',
      reto_practico:    leccion.reto_practico      || '',
      dificultad:       leccion.dificultad         || 'básico',
      imagen_url:       leccion.imagen_url         || ''
    });
  };

  const actualizarLeccion = async (e) => {
    e.preventDefault();

    // Si no se especificó duración mínima manualmente, calcularla automáticamente
    const durMin = formLeccion.duracion_minima
      ? parseInt(formLeccion.duracion_minima)
      : calcularDuracionAuto(formLeccion);

    await api.put(`/lecciones/${leccionEditando}`, {
      ...formLeccion,
      duracion_minima: durMin
    });

    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
    cargarDatos();
  };

  const eliminarLeccion = async (id) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    await api.delete(`/lecciones/${id}`);
    setLeccionEditando(null);
    setFormLeccion(FORM_LECCION_VACIO);
    cargarDatos();
  };

  const duracionPreview = formLeccion.duracion_minima
    ? parseInt(formLeccion.duracion_minima)
    : calcularDuracionAuto(formLeccion);

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="gestion-head">
        <div className="editor-head-row">
          <div>
            <p className="eyebrow" style={{ '--accent': esAdmin ? 'var(--azul)' : 'var(--emerald)' }}>
              {esAdmin ? 'Administrador' : 'Editor docente'}
            </p>
            <h1 className="page-title">Constructor visual de contenido</h1>
            <p className="page-sub">
              {esAdmin
                ? 'Vista completa — todos los cursos disponibles.'
                : 'Organiza tus cursos, temas, lecciones, videos y recompensas.'}
            </p>
          </div>
          <Link to={esAdmin ? '/admin' : '/docente'} className="btn btn-secondary">
            ← Volver al panel
          </Link>
        </div>
      </div>

      <div className="editor-course-select">
        <h4>Seleccionar curso {esAdmin && <span className="sello sello-azul ms-2">Vista admin</span>}</h4>

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
              {curso.titulo} {esAdmin ? `— ID: ${curso.id}` : ''}
            </option>
          ))}
        </select>
      </div>

      {!cursoId ? (
        <div className="editor-empty editor-panel">
          <h3>Selecciona un curso para comenzar</h3>
          <p>Aquí podrás editar visualmente sus temas, lecciones, recursos y experiencia del estudiante.</p>
        </div>
      ) : (
        <div className="editor-layout">
          {/* ── Árbol del curso ─────────────────────────────── */}
          <aside className="editor-panel">
            <h3>Estructura del curso</h3>
            <p className="text-muted">Selecciona un tema o lección para editar.</p>

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
                        className={`editor-lesson-item ${leccionEditando === leccion.id ? 'active' : ''}`}
                        onClick={() => cargarLeccion(leccion)}
                      >
                        <strong>Lección {leccion.orden}: {leccion.titulo}</strong>
                        <div>
                          <small>
                            {leccion.tipo} · {leccion.puntos_otorgados} pts · XP {leccion.xp_otorgada || leccion.puntos_otorgados}
                          </small>
                          {leccion.duracion_minima && (
                            <small className="editor-lesson-time">
                              ⏱ {Math.ceil(leccion.duracion_minima / 60)} min
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── Panel de edición ─────────────────────────────── */}
          <main className="editor-panel">
            {/* Editar módulo */}
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
                        onChange={(e) => setFormModulo({ ...formModulo, titulo: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label">Orden</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formModulo.orden}
                        onChange={(e) => setFormModulo({ ...formModulo, orden: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <small className="text-muted d-block mt-2">
                    El orden define la posición del tema dentro del curso.
                  </small>

                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success" type="submit">Guardar tema</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setModuloEditando(null)}>
                      Cancelar
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => eliminarModulo(moduloEditando)}>
                      Eliminar tema
                    </button>
                  </div>
                </form>
                <hr />
              </>
            )}

            {/* Editar lección */}
            {leccionEditando ? (
              <>
                <div className="editor-leccion-head">
                  <h3>Editar lección</h3>
                  {guardado && (
                    <span className="editor-saved-badge">✓ Guardado</span>
                  )}
                </div>

                <form onSubmit={actualizarLeccion}>
                  <div className="editor-form-grid">
                    {/* Módulo */}
                    <div className="editor-full">
                      <label className="form-label">Tema / módulo</label>
                      <select
                        className="form-control"
                        value={formLeccion.modulo_id}
                        onChange={(e) => setFormLeccion({ ...formLeccion, modulo_id: e.target.value })}
                      >
                        <option value="">Selecciona tema/módulo</option>
                        {modulosCurso.map((modulo) => (
                          <option key={modulo.id} value={modulo.id}>
                            Tema {modulo.orden}: {modulo.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Título */}
                    <div className="editor-full">
                      <label className="form-label">Título de la lección</label>
                      <input
                        className="form-control"
                        value={formLeccion.titulo}
                        onChange={(e) => setFormLeccion({ ...formLeccion, titulo: e.target.value })}
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-control"
                        value={formLeccion.tipo}
                        onChange={(e) => setFormLeccion({ ...formLeccion, tipo: e.target.value })}
                      >
                        <option value="texto">Texto</option>
                        <option value="video">Video</option>
                        <option value="examen">Examen</option>
                        <option value="interactivo">Interactivo</option>
                      </select>
                    </div>

                    {/* Dificultad */}
                    <div>
                      <label className="form-label">Dificultad</label>
                      <select
                        className="form-control"
                        value={formLeccion.dificultad}
                        onChange={(e) => setFormLeccion({ ...formLeccion, dificultad: e.target.value })}
                      >
                        <option value="básico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>

                    {/* Orden */}
                    <div>
                      <label className="form-label">Orden</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.orden}
                        onChange={(e) => setFormLeccion({ ...formLeccion, orden: Number(e.target.value) })}
                      />
                    </div>

                    {/* Puntos */}
                    <div>
                      <label className="form-label">Puntos</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.puntos_otorgados}
                        onChange={(e) => setFormLeccion({ ...formLeccion, puntos_otorgados: Number(e.target.value) })}
                      />
                    </div>

                    {/* XP */}
                    <div>
                      <label className="form-label">XP otorgada</label>
                      <input
                        className="form-control"
                        type="number"
                        value={formLeccion.xp_otorgada}
                        onChange={(e) => setFormLeccion({ ...formLeccion, xp_otorgada: Number(e.target.value) })}
                      />
                    </div>

                    {/* Duración mínima */}
                    <div className="editor-full">
                      <label className="form-label">
                        Tiempo mínimo requerido (segundos)
                        <span className="editor-field-hint">
                          — auto-calculado: {duracionPreview}s ({Math.ceil(duracionPreview / 60)} min). Déjalo en blanco para usar el valor automático.
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder={`Auto: ${duracionPreview} segundos`}
                        value={formLeccion.duracion_minima}
                        onChange={(e) => setFormLeccion({ ...formLeccion, duracion_minima: e.target.value })}
                      />
                    </div>

                    {/* URL de video */}
                    <div className="editor-full">
                      <label className="form-label">URL de video o recurso</label>
                      <input
                        className="form-control"
                        placeholder="https://youtube.com/watch?v=..."
                        value={formLeccion.video_url}
                        onChange={(e) => setFormLeccion({ ...formLeccion, video_url: e.target.value })}
                      />
                    </div>

                    {/* URL de imagen de portada */}
                    <div className="editor-full">
                      <label className="form-label">URL de imagen de portada</label>
                      <input
                        className="form-control"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={formLeccion.imagen_url}
                        onChange={(e) => setFormLeccion({ ...formLeccion, imagen_url: e.target.value })}
                      />
                      {formLeccion.imagen_url && (
                        <div className="editor-img-preview">
                          <img src={formLeccion.imagen_url} alt="Vista previa de portada" />
                        </div>
                      )}
                    </div>

                    {/* Reto práctico */}
                    <div className="editor-full">
                      <label className="form-label">Reto / ejercicio práctico</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Describe el reto que el alumno debe realizar..."
                        value={formLeccion.reto_practico}
                        onChange={(e) => setFormLeccion({ ...formLeccion, reto_practico: e.target.value })}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="editor-full">
                      <label className="form-label">
                        Contenido de la lección
                        <span className="editor-field-hint">
                          — {(formLeccion.contenido_texto || '').trim().split(/\s+/).filter(Boolean).length} palabras
                        </span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="14"
                        value={formLeccion.contenido_texto}
                        onChange={(e) => setFormLeccion({ ...formLeccion, contenido_texto: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <button className="btn btn-success" type="submit">
                      💾 Guardar lección
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
                <p>Desde aquí podrás editar contenido, tipo, puntos, XP, video, imagen, duración y más.</p>
              </div>
            ) : null}
          </main>

          {/* ── Vista previa ─────────────────────────────────── */}
          <aside className="editor-panel editor-preview">
            <h3>Vista previa</h3>
            <p className="text-muted">Así se verá la lección para el estudiante.</p>

            {leccionEditando ? (
              <div className="preview-card">
                {formLeccion.imagen_url && (
                  <div className="preview-cover">
                    <img src={formLeccion.imagen_url} alt="Portada" />
                  </div>
                )}

                <span className="badge bg-primary mb-2">{formLeccion.tipo}</span>
                <span className="badge bg-secondary mb-2 ms-1">{formLeccion.dificultad}</span>

                <h4>{formLeccion.titulo || 'Título de la lección'}</h4>

                <p>
                  <strong>Puntos:</strong> {formLeccion.puntos_otorgados} ·{' '}
                  <strong>XP:</strong> {formLeccion.xp_otorgada}
                </p>

                <div className="preview-timer-info">
                  ⏱ Tiempo mínimo: <strong>{Math.ceil(duracionPreview / 60)} min</strong>
                  {!formLeccion.duracion_minima && (
                    <span className="preview-auto-tag">auto</span>
                  )}
                </div>

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

                {formLeccion.reto_practico && (
                  <div className="preview-reto">
                    <strong>Reto:</strong> {formLeccion.reto_practico}
                  </div>
                )}

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