import '../styles/course-roadmap.css';

function CourseRoadmap({ modulos = [], lecciones = [], leccionActual, progreso }) {
  const estaCompletada = (leccionId) => {
    return progreso?.lecciones?.some(
      (p) => p.leccion_id === leccionId && p.completado
    );
  };

  return (
    <section className="course-roadmap card p-4 mt-4">
      <div className="roadmap-head">
        <div>
          <p className="roadmap-eyebrow">Ruta del curso</p>
          <h3>Tu camino de aprendizaje</h3>
          <p className="text-muted">
            Visualiza dónde estás, qué completaste y qué viene después.
          </p>
        </div>

        {progreso && (
          <div className="roadmap-percent">
            {progreso.porcentaje}%
          </div>
        )}
      </div>

      <div className="roadmap-timeline">
        {modulos.map((modulo) => {
          const leccionesModulo = lecciones
            .filter((l) => l.modulo_id === modulo.id)
            .sort((a, b) => a.orden - b.orden);

          return (
            <div key={modulo.id} className="roadmap-module">
              <h4>
                Tema {modulo.orden}: {modulo.titulo}
              </h4>

              <div className="roadmap-lessons">
                {leccionesModulo.map((leccion) => {
                  const completada = estaCompletada(leccion.id);
                  const actual = leccionActual?.id === leccion.id;

                  return (
                    <div
                      key={leccion.id}
                      className={`roadmap-lesson ${
                        completada ? 'done' : ''
                      } ${actual ? 'current' : ''}`}
                    >
                      <span>
                        {completada ? '✓' : actual ? '▶' : '○'}
                      </span>

                      <div>
                        <strong>{leccion.titulo}</strong>
                        <small>
                          {leccion.tipo} · XP {leccion.xp_otorgada ?? leccion.puntos_otorgados ?? 10}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CourseRoadmap;