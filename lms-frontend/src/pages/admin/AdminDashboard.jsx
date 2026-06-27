import { Link } from 'react-router-dom';
import '../../styles/admin-dashboard.css';

function AdminDashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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
    { titulo: 'Usuarios', desc: 'Gestionar estudiantes, docentes y administradores.', to: '/usuarios', label: 'Gestionar usuarios', accent: 'azul' },
    { titulo: 'Progreso', dec: 'Visualizar avance académico de estudiantes.', to: '/progreso', label: 'Ver progreso', accent: 'azul'},
    { titulo: 'Cursos', desc: 'Crear, editar, publicar o archivar cursos.', to: '/cursos', label: 'Gestionar cursos', accent: 'brass' },
    { titulo: 'Gestionar cursos', desc: 'Crear, editar y administrar cursos asignados.', to: '/docente/contenido', label: 'Gestionar temas y lecciones', accent: 'emerald' },
    { titulo: 'Módulos', desc: 'Administrar módulos pertenecientes a cursos.', to: '/modulos', label: 'Gestionar módulos', accent: 'azul' },
    { titulo: 'Lecciones', desc: 'Gestionar contenidos, teoría, ejemplos y recursos.', to: '/lecciones', label: 'Gestionar lecciones', accent: 'emerald' },
    { titulo: 'Inscripciones', desc: 'Controlar alumnos inscritos en cursos.', to: '/admin/inscripciones', label: 'Gestionar inscripciones', accent: 'coral' },
    { titulo: 'Perfil', desc: 'Ver información de la cuenta administradora.', to: '/perfil', label: 'Ver perfil', accent: 'brass' },
  ];

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="admin-head">
        <p className="eyebrow" style={{ '--accent': 'var(--azul)' }}>Administración general</p>
        <h1 className="page-title">Panel administrador</h1>
        <p className="page-sub">Bienvenido, {usuario.nombre} {usuario.apellido}</p>
      </div>

      <div className="admin-grid">
        {areas.map((area) => (
          <div
            key={area.titulo}
            className="ficha admin-ficha"
            style={{ '--accent': `var(--${area.accent})` }}
          >
            <span className="ficha-tab">{area.titulo}</span>
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
