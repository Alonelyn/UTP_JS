import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/admin-dashboard.css';

function AdminDashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [stats, setStats] = useState({
    usuarios: 0,
    cursos: 0,
    inscripciones: 0,
    lecciones: 0,
    publicados: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [cursosRes, usuariosRes, leccionesRes, inscripcionesRes] = await Promise.all([
          api.get('/cursos'),
          api.get('/usuarios'),
          api.get('/lecciones'),
          api.get('/inscripciones')
        ]);

        setStats({
          usuarios:      usuariosRes.data.length,
          cursos:        cursosRes.data.length,
          inscripciones: inscripcionesRes.data.length,
          lecciones:     leccionesRes.data.length,
          publicados:    cursosRes.data.filter((c) => c.estado === 'publicado').length
        });
      } catch {
        // Algunas rutas pueden requerir permisos adicionales; ignorar error silenciosamente
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (!usuario || usuario.rol !== 'admin') {
    return (
      <div className="page-shell">
        <div className="admin-denied ficha" style={{ '--accent': 'var(--coral)' }}>
          <span className="ficha-tab">Acceso restringido</span>
          <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
            Esta sección es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  const areas = [
    {
      titulo:  'Usuarios',
      desc:    'Gestionar estudiantes, docentes y administradores.',
      to:      '/usuarios',
      label:   'Gestionar usuarios',
      accent:  'azul',
      icono:   '👥'
    },
    {
      titulo:  'Progreso',
      desc:    'Visualizar avance académico de los estudiantes.',
      to:      '/progreso',
      label:   'Ver progreso',
      accent:  'azul',
      icono:   '📊'
    },
    {
      titulo:  'Cursos',
      desc:    'Crear, editar, publicar o archivar cursos.',
      to:      '/cursos',
      label:   'Gestionar cursos',
      accent:  'brass',
      icono:   '📚'
    },
    {
      titulo:  'Editor Visual',
      desc:    'Editar temas, lecciones, videos, imágenes y tiempo mínimo de todos los cursos.',
      to:      '/docente/editor-contenido',
      label:   'Abrir editor visual',
      accent:  'emerald',
      icono:   '✏️'
    },
    {
      titulo:  'Panel docente',
      desc:    'Ver el dashboard del instructor con estadísticas de contenido.',
      to:      '/docente',
      label:   'Ver panel docente',
      accent:  'emerald',
      icono:   '🧑‍🏫'
    },
    {
      titulo:  'Módulos',
      desc:    'Administrar módulos pertenecientes a los cursos.',
      to:      '/modulos',
      label:   'Gestionar módulos',
      accent:  'azul',
      icono:   '🗂️'
    },
    {
      titulo:  'Lecciones',
      desc:    'Gestionar contenidos, teoría, ejemplos y recursos de lecciones.',
      to:      '/lecciones',
      label:   'Gestionar lecciones',
      accent:  'emerald',
      icono:   '📄'
    },
    {
      titulo:  'Inscripciones',
      desc:    'Controlar alumnos inscritos en cursos.',
      to:      '/admin/inscripciones',
      label:   'Gestionar inscripciones',
      accent:  'coral',
      icono:   '📋'
    },
    {
      titulo:  'Gestión de contenido',
      desc:    'Crear nuevos temas y lecciones desde formularios directos.',
      to:      '/docente/contenido',
      label:   'Gestionar contenido',
      accent:  'brass',
      icono:   '🛠️'
    },
    {
      titulo:  'Perfil',
      desc:    'Ver información de la cuenta administradora.',
      to:      '/perfil',
      label:   'Ver perfil',
      accent:  'brass',
      icono:   '👤'
    }
  ];

  return (
    <div className="page-shell" data-ai-context="true">

      {/* ── Encabezado ──────────────────────────────────────── */}
      <div className="admin-head">
        <p className="eyebrow" style={{ '--accent': 'var(--azul)' }}>
          Administración general
        </p>
        <h1 className="page-title">Panel administrador</h1>
        <p className="page-sub">
          Bienvenido, {usuario.nombre} {usuario.apellido} — control total del sistema
        </p>
      </div>

      {/* ── Estadísticas globales ────────────────────────────── */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-number stat-azul-n">
            {cargando ? '…' : stats.usuarios}
          </span>
          <span className="admin-stat-label">Usuarios</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number stat-brass-n">
            {cargando ? '…' : stats.cursos}
          </span>
          <span className="admin-stat-label">Cursos</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number stat-emerald-n">
            {cargando ? '…' : stats.publicados}
          </span>
          <span className="admin-stat-label">Publicados</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number stat-azul-n">
            {cargando ? '…' : stats.lecciones}
          </span>
          <span className="admin-stat-label">Lecciones</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number stat-coral-n">
            {cargando ? '…' : stats.inscripciones}
          </span>
          <span className="admin-stat-label">Inscripciones</span>
        </div>
      </div>

      {/* ── Grid de áreas ────────────────────────────────────── */}
      <div className="admin-grid">
        {areas.map((area) => (
          <div
            key={area.titulo}
            className="ficha admin-ficha"
            style={{ '--accent': `var(--${area.accent})` }}
          >
            <span className="ficha-tab">{area.titulo}</span>
            <div className="admin-ficha-icono">{area.icono}</div>
            <h4>{area.titulo}</h4>
            <p>{area.desc}</p>
            <Link className="btn btn-primary" to={area.to}>
              {area.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
