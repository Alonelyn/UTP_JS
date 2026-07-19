import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/dashboard.css';
import OnboardingTour from '../components/OnboardingTour';

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [mostrarTour, setMostrarTour] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [suscripcion, setSuscripcion] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

  const [pagoPlan, setPagoPlan] = useState({
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: ''
  });

  const planes = [
    {
      id: 'basico',
      nombre: 'Básico',
      precio: 'S/ 0',
      descripcion: 'Acceso inicial con créditos limitados.',
      creditos: 20
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: 'S/ 19.90',
      descripcion: 'Más créditos de IA y acceso anticipado.',
      creditos: 300
    },
    {
      id: 'golden',
      nombre: 'Golden',
      precio: 'S/ 39.90',
      descripcion: 'Máximo acceso, créditos extra y beneficios exclusivos.',
      creditos: 1000
    }
  ];

  const cargarDatos = async () => {
    if (!usuario) return;

    try {
      const cursosRes = await api.get('/cursos');
      setCursos(cursosRes.data);

      if (usuario.rol === 'estudiante') {
        const insRes = await api.get('/inscripciones');
        setInscripciones(
          insRes.data.filter((i) => i.usuario_id === usuario.id)
        );

        const susRes = await api.get(`/suscripciones/${usuario.id}`);
        setSuscripcion(susRes.data.suscripcion);
      }
    } catch (error) {
      console.error('Error dashboard:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    cargarDatos();

    if (usuario && usuario.rol === 'estudiate') {
      const tourVisto = localStorage.getItem(`tourVisto_${usuario.id}`);

      if (!tourVisto) {
        setMostrarTour(true);
      }
    }

  }, []);

  const abrirPagoPlan = (plan) => {
    if (suscripcion) return;
    setPlanSeleccionado(plan);
  };

  const cerrarPagoPlan = () => {
    setPlanSeleccionado(null);
    setPagoPlan({
      numero: '',
      titular: '',
      vencimiento: '',
      cvv: ''
    });
  };

  const validarPagoPlan = () => {
    const numeroLimpio = pagoPlan.numero.replace(/\s/g, '');

    if (
      !pagoPlan.numero.trim() ||
      !pagoPlan.titular.trim() ||
      !pagoPlan.vencimiento.trim() ||
      !pagoPlan.cvv.trim()
    ) {
      alert('Completa todos los datos de pago');
      return false;
    }

    if (!/^\d{16}$/.test(numeroLimpio)) {
      alert('El número de tarjeta debe tener 16 dígitos');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(pagoPlan.vencimiento)) {
      alert('La fecha debe tener formato MM/AA');
      return false;
    }

    if (!/^\d{3}$/.test(pagoPlan.cvv)) {
      alert('El CVV debe tener 3 dígitos');
      return false;
    }

    return true;
  };

  const confirmarCompraPlan = async (e) => {
    e.preventDefault();

    if (!validarPagoPlan()) return;

    try {
      const response = await api.post('/suscripciones', {
        usuario_id: usuario.id,
        plan: planSeleccionado.id
      });

      setSuscripcion(response.data.suscripcion);
      cerrarPagoPlan();

      alert('Plan activado correctamente');
    } catch (error) {
      alert(error.response?.data?.mensaje || 'No se pudo activar el plan');
    }
  };

  if (!usuario) {
    return (
      <div className="page-shell">
        <div className="dash-empty">
          <h2>No hay sesión activa</h2>
          <Link className="btn btn-primary mt-2" to="/login">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  if (usuario.rol === 'admin') {
    return (
      <div className="page-shell" data-ai-context="true">
        <div className="dash-hero admin">
          <div>
            <p className="eyebrow">Administración general</p>
            <h1>Bienvenido, {usuario.nombre}</h1>
            <p>Gestiona usuarios, cursos, inscripciones y contenido académico desde un solo lugar.</p>

            <Link className="btn btn-dark" to="/admin">
              Ir al Panel Administrador
            </Link>
          </div>
        </div>

        <div className="dash-stats">
          <div><span>Cursos</span><strong>{cursos.length}</strong></div>
          <div><span>Usuarios</span><strong>Gestión total</strong></div>
          <div><span>Inscripciones</span><strong>Control activo</strong></div>
          <div><span>IA</span><strong>UTP-Bot integrado</strong></div>
        </div>
      </div>
    );
  }

  if (usuario.rol === 'instructor') {
    return (
      <div className="page-shell" data-ai-context="true">
        <div className="dash-hero instructor">
          <div>
            <p className="eyebrow">Panel docente</p>
            <h1>Hola, docente {usuario.nombre}</h1>
            <p>Crea cursos, organiza módulos, diseña lecciones y acompaña el aprendizaje de tus estudiantes.</p>

            <Link className="btn btn-primary" to="/docente/contenido">
              Gestionar contenido
            </Link>
          </div>
        </div>

        <section className="dash-section">
          <h2>Herramientas docentes</h2>

          <div className="dash-grid">
            <div className="dash-tile">
              <h4>Crear contenido</h4>
              <p>Cursos, módulos y lecciones.</p>
              <Link className="btn btn-primary" to="/docente/contenido">
                Crear
              </Link>
            </div>

            <div className="dash-tile">
              <h4>Editar contenido</h4>
              <p>Actualizar temas y lecciones existentes.</p>
              <Link className="btn btn-warning" to="/docente/editor-contenido">
                Editar
              </Link>
            </div>

            <div className="dash-tile">
              <h4>Progreso</h4>
              <p>Revisar avance de estudiantes.</p>
              <Link className="btn btn-secondary" to="/progreso">
                Ver progreso
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const cursosCompradosIds = inscripciones.map((i) => i.curso_id);
  const cursosComprados = cursos.filter((c) => cursosCompradosIds.includes(c.id));
  const cursosDisponibles = cursos.filter((c) => !cursosCompradosIds.includes(c.id));

  return (
    <div className="page-shell dashboard-netflix" data-ai-context="true">
      <div className="dash-hero student">
        <div className="dash-hero-content">
          <p className="eyebrow">LMS Academy</p>
          <h1>Hola, {usuario.nombre}. Tu aula está lista.</h1>
          <p>
            Aprende con cursos guiados, práctica interactiva, progreso medible y UTP-Bot,
            tu asistente académica integrada.
          </p>

          <div className="dash-actions">
            <Link className="btn btn-primary" to="/cursos">
              Explorar cursos
            </Link>

            <Link className="btn btn-outline-light" to="/progreso">
              Ver mi progreso
            </Link>

            <button
              className="btn btn-outline-light"
              type="button"
              onClick={() => setMostrarTour(true)}
            >
              Ver tour guiado
            </button>
          </div>
        </div>
      </div>

      <div className="dash-stats">
        <div>
          <span>Cursos inscritos</span>
          <strong>{cursosComprados.length}</strong>
        </div>

        <div>
          <span>XP acumulado</span>
          <strong>{usuario.puntos_xp ?? 0}</strong>
        </div>

        <div>
          <span>Correo</span>
          <strong>{usuario.email_verificado ? 'Verificado' : 'Pendiente'}</strong>
        </div>

        <div>
          <span>Plan</span>
          <strong>{suscripcion ? suscripcion.plan.toUpperCase() : 'Sin plan'}</strong>
        </div>
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2>Continúa aprendiendo</h2>
          <Link to="/cursos">Ver todo</Link>
        </div>

        <div className="dash-row">
          {cursosComprados.length === 0 ? (
            <div className="dash-empty-card">
              <h4>Aún no tienes cursos comprados</h4>
              <p>Explora el catálogo y empieza tu primera ruta de aprendizaje.</p>
              <Link className="btn btn-primary" to="/cursos">
                Comprar curso
              </Link>
            </div>
          ) : (
            cursosComprados.map((curso) => (
              <div key={curso.id} className="dash-course-card owned">
                <span>En progreso</span>
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
                <Link className="btn btn-success" to={`/cursos/${curso.slug}`}>
                  Continuar
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2>Tendencias para ti</h2>
          <span>Cursos publicados</span>
        </div>

        <div className="dash-row">
          {cursosDisponibles.slice(0, 6).map((curso) => (
            <div key={curso.id} className="dash-course-card">
              <span>S/ {curso.precio}</span>
              <h3>{curso.titulo}</h3>
              <p>{curso.descripcion}</p>
              <small>{curso.nivel} · {curso.estado}</small>
              <br />
              <Link className="btn btn-primary mt-3" to="/cursos">
                Ver curso
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="dash-section">
        <h2>¿Por qué LMS Academy?</h2>

        <div className="dash-grid">
          <div className="dash-tile premium">
            <h4>UTP-Bot IA</h4>
            <p>Asistencia dentro de cada lección, revisión de código y guía académica contextual.</p>
          </div>

          <div className="dash-tile premium">
            <h4>Laboratorio práctico</h4>
            <p>Ejecuta código, prueba ejercicios y recibe retroalimentación sin salir de la lección.</p>
          </div>

          <div className="dash-tile premium">
            <h4>Progreso medible</h4>
            <p>Visualiza avance, lecciones completadas y rutas de aprendizaje activas.</p>
          </div>
        </div>
      </section>

      <section className="dash-section">
        <h2>Planes para estudiantes</h2>

        {suscripcion && (
          <div className="dash-plan-active mb-3">
            <strong>Plan activo:</strong> {suscripcion.plan.toUpperCase()} ·{' '}
            <span>
              Vence el {new Date(suscripcion.fecha_fin).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="dash-plans">
          {planes.map((plan) => {
            const activo = suscripcion?.plan === plan.id;
            const bloqueado = Boolean(suscripcion);

            return (
              <div
                key={plan.id}
                className={`dash-plan ${plan.id === 'golden' ? 'golden' : ''} ${
                  activo ? 'activo' : ''
                }`}
              >
                <span>{plan.nombre}</span>
                <h3>{plan.precio}</h3>
                <p>{plan.descripcion}</p>
                <p><strong>{plan.creditos}</strong> créditos IA</p>

                <button
                  className={`btn w-100 ${activo ? 'btn-success' : 'btn-primary'}`}
                  disabled={bloqueado}
                  onClick={() => abrirPagoPlan(plan)}
                >
                  {activo
                    ? 'Plan activo'
                    : bloqueado
                      ? 'Ya tienes un plan activo'
                      : 'Suscribirme'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {planSeleccionado && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={confirmarCompraPlan}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Activar plan {planSeleccionado.nombre}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={cerrarPagoPlan}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    Total: <strong>{planSeleccionado.precio}</strong>
                  </p>

                  <input
                    className="form-control mb-2"
                    placeholder="Número de tarjeta"
                    maxLength="19"
                    value={pagoPlan.numero}
                    onChange={(e) =>
                      setPagoPlan({ ...pagoPlan, numero: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Nombre del titular"
                    value={pagoPlan.titular}
                    onChange={(e) =>
                      setPagoPlan({ ...pagoPlan, titular: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="MM/AA"
                    maxLength="5"
                    value={pagoPlan.vencimiento}
                    onChange={(e) =>
                      setPagoPlan({ ...pagoPlan, vencimiento: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="CVV"
                    maxLength="3"
                    type="password"
                    value={pagoPlan.cvv}
                    onChange={(e) =>
                      setPagoPlan({ ...pagoPlan, cvv: e.target.value })
                    }
                  />

                  <small className="text-muted">
                    Pago simulado. No se almacenan datos de tarjeta.
                  </small>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarPagoPlan}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-success">
                    Confirmar pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {mostrarTour && (
        <OnboardingTour onClose={() => setMostrarTour(false)} />
      )}
    </div>
  );
}

export default Dashboard;