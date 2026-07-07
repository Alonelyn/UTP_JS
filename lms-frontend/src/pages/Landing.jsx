import { Link } from 'react-router-dom';
import '../styles/landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">LMS Academy · Plataforma inteligente</span>

          <h1>Aprende programación con rutas guiadas e IA académica.</h1>

          <p>
            Cursos universitarios organizados por niveles, lecciones prácticas,
            progreso medible y UTP-Bot como tutor dentro de cada clase.
          </p>

          <div className="landing-actions">
            <Link className="btn btn-primary btn-lg" to="/registro">
              Comenzar ahora
            </Link>

            <Link className="btn btn-outline-light btn-lg" to="/login">
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className="landing-preview">
          <div className="preview-card main">
            <span>Ruta recomendada</span>
            <h3>Programación desde cero</h3>
            <p>Java → POO → Base de Datos → Web → Proyecto Final</p>
          </div>

          <div className="preview-card">
            <strong>UTP-Bot</strong>
            <p>“Te recomiendo practicar arreglos antes de pasar a POO.”</p>
          </div>

          <div className="preview-card">
            <strong>Progreso</strong>
            <div className="fake-progress">
              <span style={{ width: '95%' }}></span>
            </div>
            <small>95% completado</small>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <span>Rutas académicas</span>
          <h2>Aprende según tu nivel</h2>
        </div>

        <div className="landing-grid three">
          <div className="landing-card">
            <h3>Ruta Esencial</h3>
            <p>Java, JavaScript, Python, Base de Datos, Web y Redes para empezar desde cero.</p>
          </div>

          <div className="landing-card featured">
            <h3>Ruta Intermedia</h3>
            <p>POO, Java Avanzado, JavaScript Avanzado, Lenguajes de Programación y proyectos.</p>
          </div>

          <div className="landing-card">
            <h3>Ruta Avanzada</h3>
            <p>Diseño de Patrones, Ciberseguridad, Machine Learning y arquitectura de software.</p>
          </div>
        </div>
      </section>

      <section className="landing-section dark">
        <div className="landing-section-head">
          <span>Diferencial</span>
          <h2>No solo miras clases. Practicas y recibes feedback.</h2>
        </div>

        <div className="landing-grid three">
          <div className="landing-card dark-card">
            <h3>IA contextual</h3>
            <p>UTP-Bot entiende la lección actual y responde con orientación técnica, recursos y ejemplos.</p>
          </div>

          <div className="landing-card dark-card">
            <h3>Área práctica</h3>
            <p>El estudiante escribe código, lo ejecuta y recibe correcciones dentro de la misma lección.</p>
          </div>

          <div className="landing-card dark-card">
            <h3>Progreso real</h3>
            <p>El sistema mide lecciones completadas, XP, avance del curso y continuidad del aprendizaje.</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <span>Catálogo inicial</span>
          <h2>Cursos pensados para estudiantes universitarios</h2>
        </div>

        <div className="landing-courses">
          {[
            'Java desde cero hasta POO',
            'Programación Orientada a Objetos',
            'Base de Datos con MySQL',
            'Taller de Programación Web',
            'Diseño de Patrones',
            'Machine Learning Fundamentos'
          ].map((curso) => (
            <div className="landing-course" key={curso}>
              <span>Curso</span>
              <h4>{curso}</h4>
              <p>Temas, lecciones, ejercicios, exámenes y apoyo con IA.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <span>Planes</span>
          <h2>Tutor UTP-BOOT 🤖</h2>
        </div>

        <div className="landing-grid three">
          <div className="landing-plan">
            <span>Básico</span>
            <h3>S/ 0</h3>
            <p>Acceso inicial y créditos limitados de IA.</p>
          </div>

          <div className="landing-plan premium">
            <span>Premium</span>
            <h3>S/ 19.90</h3>
            <p>Más créditos IA, rutas guiadas y acceso anticipado.</p>
          </div>

          <div className="landing-plan">
            <span>Golden</span>
            <h3>S/ 39.90</h3>
            <p>Máximos beneficios, créditos extra y soporte avanzado.</p>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <h2>Una plataforma hecha para aprender como en la universidad, pero con acompañamiento inteligente.</h2>
        <p>
          LMS Academy centraliza cursos, práctica, progreso, IA, suscripciones y administración académica.
        </p>

        <Link className="btn btn-primary btn-lg" to="/registro">
          Crear cuenta gratuita
        </Link>
      </section>
    </div>
  );
}

export default Landing;