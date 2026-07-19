import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/docente-dashboard.css';

function DocenteDashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [stats, setStats] = useState({
    totalCursos: 0,
    totalModulos: 0,
    totalLecciones: 0,
    cursosPublicados: 0,
    cursosBorrador: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [cursosRes, modulosRes, leccionesRes] = await Promise.all([
          api.get('/cursos/mis-cursos'),
          api.get('/modulos'),
          api.get('/lecciones')
        ]);

        const misCursos = cursosRes.data;

        const misCursosIds = misCursos.map(
          (curso) => String(curso.id)
        );

        const misModulos = modulosRes.data.filter(
          (modulo) =>
            misCursosIds.includes(String(modulo.curso_id))
        );

        const misModulosIds = misModulos.map(
          (modulo) => String(modulo.id)
        );

        const misLecciones = leccionesRes.data.filter(
          (leccion) =>
            misModulosIds.includes(String(leccion.modulo_id))
        );

        setStats({
          totalCursos:      misCursos.length,
          totalModulos:     misModulos.length,
          totalLecciones:   misLecciones.length,
          cursosPublicados: misCursos.filter((c) => c.estado === 'publicado').length,
          cursosBorrador:   misCursos.filter((c) => c.estado === 'borrador').length
        });
      } catch (err) {
        console.error('Error al cargar estadísticas del docente', err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  if (!usuario || (usuario.rol !== 'instructor' && usuario.rol !== 'admin')) {
    return (
      <div className="page-shell">
        <div className="alert alert-danger">
          Acceso restringido. Solo docentes.
        </div>
      </div>
    );
  }

  const acciones = [
    {
      titulo: 'Mis cursos',
      desc: 'Crear, editar, publicar y administrar los cursos que impartes.',
      to: '/docente/cursos',
      label: 'Gestionar cursos',
      icono: '📚',
      accent: 'emerald'
    },
    {
      titulo: 'Editor de contenido',
      desc: 'Administrar temas, lecciones, videos, prácticas y recursos.',
      to: '/docente/editor-contenido',
      label: 'Abrir editor',
      icono: '✏️',
      accent: 'azul'
    },
    {
      titulo: 'Gestión de alumnos',
      desc: 'Consultar estudiantes inscritos, progreso y última actividad.',
      to: '/docente/alumnos',
      label: 'Ver alumnos',
      icono: '👥',
      accent: 'brass'
    },
    {
      titulo: 'Gestión de notas',
      desc: 'Registrar y consultar calificaciones de los estudiantes.',
      to: '/docente/notas',
      label: 'Gestionar notas',
      icono: '📝',
      accent: 'coral'
    },
    {
      titulo: 'Analítica académica',
      desc: 'Detectar estudiantes con retrasos o dificultades de aprendizaje.',
      to: '/docente/analitica',
      label: 'Ver analítica',
      icono: '📊',
      accent: 'azul'
    },
    {
      titulo: 'Mi perfil',
      desc: 'Ver y actualizar tu información de cuenta.',
      to: '/perfil',
      label: 'Ver perfil',
      icono: '👤',
      accent: 'slate'
    }
  ];

  return (
    <div className="page-shell docente-shell" data-ai-context="true">
      {/* ── Encabezado ──────────────────────────────────────── */}
      <div className="docente-db-head">
        <div className="docente-db-welcome">
          <p className="eyebrow" style={{ '--accent': 'var(--emerald)' }}>
            Panel de instrucción
          </p>
          <h1 className="page-title">
            Bienvenido, {usuario.nombre} {usuario.apellido}
          </h1>
          <p className="page-sub">
            Gestiona tus cursos, lecciones y contenidos desde un solo lugar.
          </p>
        </div>
      </div>

      {/* ── Estadísticas rápidas ─────────────────────────────── */}
      <div className="docente-stats-row">
        <div className="docente-stat-card stat-emerald">
          <span className="stat-number">{cargando ? '…' : stats.totalCursos}</span>
          <span className="stat-label">Cursos totales</span>
        </div>
        <div className="docente-stat-card stat-azul">
          <span className="stat-number">{cargando ? '…' : stats.totalModulos}</span>
          <span className="stat-label">Temas creados</span>
        </div>
        <div className="docente-stat-card stat-brass">
          <span className="stat-number">{cargando ? '…' : stats.totalLecciones}</span>
          <span className="stat-label">Lecciones en total</span>
        </div>
        <div className="docente-stat-card stat-ok">
          <span className="stat-number">{cargando ? '…' : stats.cursosPublicados}</span>
          <span className="stat-label">Publicados</span>
        </div>
        <div className="docente-stat-card stat-slate">
          <span className="stat-number">{cargando ? '…' : stats.cursosBorrador}</span>
          <span className="stat-label">En borrador</span>
        </div>
      </div>

      {/* ── Acciones rápidas ─────────────────────────────────── */}
      <h2 className="docente-section-title">Acciones rápidas</h2>
      <div className="docente-actions-grid">
        {acciones.map((acc) => (
          <div
            key={acc.titulo}
            className="ficha docente-action-card"
            style={{ '--accent': `var(--${acc.accent})` }}
          >
            <span className="ficha-tab">{acc.titulo}</span>
            <div className="docente-action-icono">{acc.icono}</div>
            <h4>{acc.titulo}</h4>
            <p>{acc.desc}</p>
            <Link className="btn btn-primary" to={acc.to}>
              {acc.label}
            </Link>
          </div>
        ))}
      </div>

      {/* ── Consejo ──────────────────────────────────────────── */}
      <div className="docente-tip">
        <span className="docente-tip-icon">💡</span>
        <div>
          <strong>Consejo:</strong> El tiempo mínimo de cada lección se calcula automáticamente
          en base a la cantidad de contenido y tipo. Puedes sobreescribirlo desde el Editor Visual.
        </div>
      </div>
    </div>
  );
}

export default DocenteDashboard;
