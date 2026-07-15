import { useState } from 'react';
import api from '../api/axios';
import '../styles/learning-assistant.css';

function LearningAssistant({ usuario, curso, leccion, progreso }) {
  const [analisis, setAnalisis] = useState(null);
  const [cargando, setCargando] = useState(false);

  const analizarLeccion = async () => {
    setCargando(true);

    try {
      const response = await api.post('/ia/analizar-leccion', {
        usuario,
        curso,
        leccion,
        progreso
      });

      setAnalisis(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo analizar la lección con UTP-BOOT');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="learning-assistant card p-4 mt-4">
      <div className="learning-head">
        <div>
          <p className="learning-eyebrow">UTP-BOOT Learning Assistant</p>
          <h3>Asistente inteligente de aprendizaje</h3>
          <p className="text-muted">
            Analiza esta lección y genera una guía personalizada para estudiar mejor.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={analizarLeccion}
          disabled={cargando}
        >
          {cargando ? 'Analizando...' : 'Analizar esta lección'}
        </button>
      </div>

      {!analisis && (
        <div className="learning-empty">
          <h4>🧠 Aún no hay análisis generado</h4>
          <p>
            Presiona el botón para que UTP-BOOT cree un resumen, objetivos,
            proyecto recomendado, mini examen y siguiente paso.
          </p>
        </div>
      )}

      {analisis && (
        <>
          <div className="learning-grid mt-4">
            <div className="learning-card wide">
              <span>📖 Resumen</span>
              <p>{analisis.resumen}</p>
            </div>

            <div className="learning-card">
              <span>🎯 Nivel</span>
              <h4>{analisis.nivel}</h4>
            </div>

            <div className="learning-card">
              <span>⏱ Duración</span>
              <h4>{analisis.duracion}</h4>
            </div>
          </div>

          <div className="learning-grid mt-3">
            <div className="learning-card">
              <span>✅ Objetivos</span>
              <ul>
                {analisis.objetivos?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="learning-card">
              <span>🧩 Prerrequisitos</span>
              <ul>
                {analisis.prerrequisitos?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {analisis.proyecto && (
            <div className="learning-project mt-3">
              <div>
                <span>💻 Proyecto recomendado</span>
                <h4>{analisis.proyecto.titulo}</h4>
                <p>{analisis.proyecto.descripcion}</p>
              </div>

              <strong>{analisis.proyecto.dificultad}</strong>
            </div>
          )}

          <div className="learning-grid mt-3">
            <div className="learning-card">
              <span>📝 Mini examen</span>
              <ol>
                {analisis.miniExamen?.map((pregunta, index) => (
                  <li key={index}>{pregunta}</li>
                ))}
              </ol>
            </div>

            <div className="learning-card">
              <span>💡 Consejo del tutor</span>
              <p>{analisis.consejo}</p>

              <hr />

              <span>🚀 Siguiente paso</span>
              <p>{analisis.siguientePaso}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default LearningAssistant;