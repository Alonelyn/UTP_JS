import { useState } from 'react';
import '../styles/onboarding-tour.css';

function OnboardingTour({ onClose }) {
  const [paso, setPaso] = useState(0);

  const pasos = [
    {
      titulo: 'Bienvenido a LMS Academy',
      texto: 'Esta plataforma te ayuda a aprender con cursos organizados, progreso académico y UTP-Bot como asistente inteligente.',
      icono: '🎓'
    },
    {
      titulo: 'Explora tus cursos',
      texto: 'Desde el catálogo puedes comprar cursos, ver tus cursos activos y continuar desde donde lo dejaste.',
      icono: '📚'
    },
    {
      titulo: 'Aprende por temas y lecciones',
      texto: 'Cada curso está dividido en temas desplegables con lecciones, videos, ejercicios y evaluaciones.',
      icono: '🧩'
    },
    {
      titulo: 'Practica dentro de la lección',
      texto: 'El área práctica te permite escribir código, ejecutarlo y revisar tu solución con ayuda de la IA.',
      icono: '💻'
    },
    {
      titulo: 'UTP-Bot te acompaña',
      texto: 'Puedes pedir explicaciones, ejercicios, recursos, resúmenes y evaluación personalizada según la lección actual.',
      icono: '🤖'
    },
    {
      titulo: 'Mide tu progreso',
      texto: 'El sistema registra lecciones completadas, XP, avance del curso y tu historial académico.',
      icono: '📈'
    }
  ];

  const cerrarTour = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    localStorage.setItem(`tourVisto_$(usuaio?.id)`, 'true');
    onClose();
  };

  const siguiente = () => {
    if (paso < pasos.length - 1) {
      setPaso(paso + 1);
    } else {
      cerrarTour();
    }
  };

  const anterior = () => {
    if (paso > 0) setPaso(paso - 1);
  };

  const actual = pasos[paso];

  return (
    <div className="tour-overlay">
      <div className="tour-card">
        <button className="tour-close" onClick={cerrarTour}>
          ×
        </button>

        <div className="tour-icon">{actual.icono}</div>

        <h2>{actual.titulo}</h2>
        <p>{actual.texto}</p>

        <div className="tour-progress">
          {pasos.map((_, index) => (
            <span
              key={index}
              className={index === paso ? 'active' : ''}
            />
          ))}
        </div>

        <div className="tour-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={anterior}
            disabled={paso === 0}
          >
            Anterior
          </button>

          <button className="btn btn-primary" onClick={siguiente}>
            {paso === pasos.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>

        <button className="tour-skip" onClick={cerrarTour}>
          No volver a mostrar
        </button>
      </div>
    </div>
  );
}

export default OnboardingTour;