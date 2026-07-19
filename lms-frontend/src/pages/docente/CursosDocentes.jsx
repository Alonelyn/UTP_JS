import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/cursos-docente.css';

function CursosDocente() {
  const usuario  = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();

  const [cursos,   setCursos]   = useState([]);
  const [modulos,  setModulos]  = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    precio: 0,
    nivel: 'principiante',
    estado: 'borrador'
  });

  const [formEditar, setFormEditar] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    precio: 0,
    nivel: 'principiante',
    estado: 'borrador'
  });

  const actualizarCurso = async (e) => {
    e.preventDefault();

    if (!formEditar.titulo.trim() || !formEditar.slug.trim()) {
      alert('Título y slug son obligatorios');
      return;
    }

    try {
      await api.put(`/cursos/${cursoEditando.id}`, formEditar);

      alert('Curso actualizado correctamente');

      cerrarEdicion();
      cargarDatos();

    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo actualizar el curso');
    }
  };

  const listarDatos = async () => {
    setCargando(true);
    try {
      const [cursosRes, modulosRes, leccionesRes] = await Promise.all([
        api.get('/cursos/mis-cursos'),
        api.get('/modulos'),
        api.get('/lecciones')
      ]);

      setCursos(cursosRes.data);

      setCursos(misCursos);
      setModulos(modulosRes.data);
      setLecciones(leccionesRes.data);
    } finally {
      setCargando(false);
    }
  };

  const crearCurso = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.slug.trim()) {
      alert('Título y slug son obligatorios');
      return;
    }

    try {
      await api.post('/cursos', form);

      alert('Curso creado correctamente');

      setForm({
        titulo: '',
        slug: '',
        descripcion: '',
        precio: 0,
        nivel: 'principiante',
        estado: 'borrador'
      });

      await listarDatos();
    } catch (error) {
      console.error(
        'Error al crear curso:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.mensaje ||
        'No se pudo crear el curso'
      );
    }
  };

  useEffect(() => { listarDatos(); }, []);

  const modulosDeCurso  = (cursoId) => modulos.filter((m) => m.curso_id === cursoId);
  const leccionesDeCurso = (cursoId) => {
    const ids = modulosDeCurso(cursoId).map((m) => m.id);
    return lecciones.filter((l) => ids.includes(l.modulo_id));
  };

  const accentEstado = { publicado: 'emerald', borrador: 'brass', archivado: 'coral' };

  return (
    <div className="page-shell" data-ai-context="true">

      <div className="docente-head">
        <div>
          <p className="eyebrow" style={{ '--accent': 'var(--emerald)' }}>
            Panel docente
          </p>
          <h1 className="page-title">Gestión de mis cursos</h1>
          <p className="page-sub">
            {usuario.nombre} {usuario.apellido} — {cursos.length} curso(s) registrado(s)
          </p>
        </div>
        <Link to="/docente" className="btn btn-secondary">
          ← Volver al dashboard
        </Link>
      </div>

      <div className="docente-wrap">

        {/* ── Formulario para crear curso ─────────────────── */}
        <div className="docente-form">
          <div className="docente-form-head">+ Crear nuevo curso</div>
          <form onSubmit={crearCurso} className="docente-form-body">
            <input
              className="form-control mb-2"
              placeholder="Título del curso"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Slug (ej: javascript-basico)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <textarea
              className="form-control mb-2"
              placeholder="Descripción breve del curso"
              rows="3"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <input
              className="form-control mb-2"
              type="number"
              placeholder="Precio (S/)"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />

            <select
              className="form-control mb-2"
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>

            <select
              className="form-control mb-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>

            <button className="btn btn-success" type="submit">
              Crear curso
            </button>
          </form>
        </div>

        {/* ── Lista de cursos ─────────────────────────────── */}
        <h2 className="docente-lista-titulo">Mis cursos</h2>

        {cargando && <p className="docente-vacio">Cargando cursos…</p>}

        {!cargando && cursos.length === 0 && (
          <p className="docente-vacio">Todavía no has creado cursos.</p>
        )}

        <div className="docente-cursos-grid">
          {cursos.map((curso) => {
            const numModulos   = modulosDeCurso(curso.id).length;
            const numLecciones = leccionesDeCurso(curso.id).length;
            const acc = accentEstado[curso.estado] || 'brass';

            return (
              <div
                key={curso.id}
                className="ficha docente-curso-ficha"
                style={{ '--accent': `var(--${acc})` }}
              >
                <span className="ficha-tab">{curso.nivel}</span>

                <h4>{curso.titulo}</h4>
                <p className="docente-curso-desc">
                  {curso.descripcion || 'Sin descripción aún.'}
                </p>

                {/* Estadísticas del curso */}
                <div className="docente-curso-stats">
                  <span className="sello sello-azul">📘 {numModulos} tema(s)</span>
                  <span className="sello sello-emerald">📄 {numLecciones} lección(es)</span>
                  <span className={`sello sello-${acc}`}>{curso.estado}</span>
                  <span className="sello sello-brass">S/ {curso.precio}</span>
                </div>

                {/* Acciones */}
                <div className="docente-curso-actions">
                  <Link
                    className="btn btn-primary btn-sm"
                    to="/docente/editor-contenido"
                    state={{ cursoId: curso.id }}
                  >
                    ✏️ Editar contenido
                  </Link>
                  <Link
                    className="btn btn-secondary btn-sm"
                    to={`/cursos/${curso.slug}`}
                  >
                    👁 Vista alumno
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CursosDocente;
