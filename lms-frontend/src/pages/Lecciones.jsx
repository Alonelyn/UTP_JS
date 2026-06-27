import "../styles/lecciones.css";

function Lecciones() {
  const contexto = `
JavaScript es un lenguaje de programación utilizado para crear páginas web dinámicas.

function saludar(nombre) {
  return "Hola " + nombre;
}

console.log(saludar("Michael"));

El return sirve para devolver un valor desde una función.
`;

  return (
    <div className="lesson-page">
      <div className="lesson-full" data-ai-context="true">
        <div className="card lesson-card p-5">
          <span className="lesson-badge">Lección 1 · JavaScript</span>

          <h1>Introducción a JavaScript</h1>

          <p>
            JavaScript es un lenguaje de programación utilizado para crear
            páginas web dinámicas e interactivas.
          </p>

          <h4>Ejemplo práctico</h4>

          <pre className="lesson-code">
            {`function saludar(nombre) {
              return "Hola " + nombre;
            }

            console.log(saludar("Michael"));`}
          </pre>

          <p>
            Usa el asistente IA para resolver dudas, reforzar conceptos o pedir
            pistas sobre esta lección.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Lecciones;