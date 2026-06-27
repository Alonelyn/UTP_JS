import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/perfil.css';

function Perfil() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [avatar, setAvatar] = useState(usuario?.avatar_url || localStorage.getItem('avatarPerfil') || '');
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [progresos, setProgresos] = useState([]);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const cargarDatos = async () => {
    if (!usuario) return;

    const cursosRes = await api.get('/cursos');
    const insRes = await api.get('/inscripciones');

    const misInscripciones = insRes.data.filter(
      (i) => i.usuario_id === usuario.id
    );

    setCursos(cursosRes.data);
    setInscripciones(misInscripciones);

    const progresosRes = await Promise.all(
      misInscripciones.map((i) =>
        api.get(`/progreso/${usuario.id}/${i.curso_id}`)
      )
    );

    setProgresos(progresosRes.map((r) => r.data));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!usuario) {
    return (
      <div className="perfil-shell">
        <div className="perfil-sin-sesion">
          <div className="alert alert-warning">No hay usuario logueado.</div>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  const subirAvatar = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result);
      localStorage.setItem('avatarPerfil', reader.result);
    };

    reader.readAsDataURL(archivo);
  };

  const selloRol = {
    admin: 'sello-azul',
    instructor: 'sello-emerald',
    estudiante: 'sello-brass'
  }[usuario.rol] || 'sello-brass';

  const cursosComprados = inscripciones.length;
  const totalLecciones = progresos.reduce((acc, p) => acc + p.total, 0);
  const totalCompletadas = progresos.reduce((acc, p) => acc + p.completadas, 0);
  const progresoGeneral =
    totalLecciones === 0 ? 0 : Math.round((totalCompletadas / totalLecciones) * 100);

  const cursosInscritos = inscripciones.map((inscripcion) => {
    const curso = cursos.find((c) => c.id === inscripcion.curso_id);
    const progreso = progresos.find((p) =>
      p.lecciones?.some((l) => l.leccion_id)
    );

    return {
      ...inscripcion,
      curso,
      progreso
    };
  });

  return (
    <div className="perfil-shell" data-ai-context="true">
      <div className="perfil-grid">
        <div className="carnet perfil-card">
          <div className="carnet-avatar-wrap">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="carnet-avatar" />
            ) : (
              <div className="carnet-avatar carnet-avatar-placeholder">
                {usuario.nombre?.charAt(0)}
                {usuario.apellido?.charAt(0)}
              </div>
            )}
          </div>

          <div className="carnet-body">
            <h2 className="carnet-nombre">
              {usuario.nombre} {usuario.apellido}
            </h2>

            <span className={`sello ${selloRol} carnet-rol`}>
              {usuario.rol}
            </span>

            <label className="btn btn-outline-primary mt-3">
              Subir foto
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={subirAvatar}
              />
            </label>

            <div className="carnet-datos">
              <div className="carnet-fila">
                <span className="etiqueta">Email</span>
                <span className="valor">{usuario.email}</span>
              </div>

              <div className="carnet-fila">
                <span className="etiqueta">Correo verificado</span>
                <span className="valor">
                  {usuario.email_verificado ? 'Sí' : 'Pendiente'}
                </span>
              </div>

              <div className="carnet-fila">
                <span className="etiqueta">Fecha de registro</span>
                <span className="valor">
                  {usuario.fecha_registro
                    ? new Date(usuario.fecha_registro).toLocaleDateString()
                    : '-'}
                </span>
              </div>
            </div>

            <button className="btn btn-danger carnet-cerrar" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="perfil-panel">
          <h1>Mi perfil académico</h1>

          <div className="perfil-stats">
            <div className="perfil-stat">
              <span>XP</span>
              <strong>{usuario.puntos_xp ?? 0}</strong>
            </div>

            <div className="perfil-stat">
              <span>Cursos</span>
              <strong>{cursosComprados}</strong>
            </div>

            <div className="perfil-stat">
              <span>Lecciones</span>
              <strong>{totalCompletadas}/{totalLecciones}</strong>
            </div>

            <div className="perfil-stat">
              <span>Avance</span>
              <strong>{progresoGeneral}%</strong>
            </div>
          </div>

          <div className="perfil-card mt-4">
            <h3>Progreso general</h3>

            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${progresoGeneral}%` }}
              >
                {progresoGeneral}%
              </div>
            </div>
          </div>

          <div className="perfil-card mt-4">
            <h3>Historial de cursos</h3>

            {inscripciones.length === 0 ? (
              <p>No tienes cursos inscritos todavía.</p>
            ) : (
              inscripciones.map((inscripcion) => {
                const curso = cursos.find((c) => c.id === inscripcion.curso_id);
                const progresoCurso = progresos.find((p) =>
                  p.lecciones?.some((l) =>
                    curso ? true : false
                  )
                );

                return (
                  <div key={inscripcion.id} className="perfil-curso-item">
                    <div>
                      <strong>{curso?.titulo || 'Curso no encontrado'}</strong>
                      <p>
                        Fecha de compra:{' '}
                        {inscripcion.fecha_inscripcion
                          ? new Date(inscripcion.fecha_inscripcion).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>

                    <Link className="btn btn-sm btn-primary" to={`/cursos/${inscripcion.curso_id}`}>
                      Ver curso
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;