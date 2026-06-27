import { useEffect, useState } from 'react';
import api from '../api/axios';

function AreaPractica({ leccion }) {
  const obtenerCodigoInicial = () => {
    const titulo = leccion?.titulo?.toLowerCase() || '';
    const contenido = leccion?.contenido_texto?.toLowerCase() || '';

    if (
      titulo.includes('machine learning') ||
      contenido.includes('machine learning') ||
      contenido.includes('modelo')
    ) {
      return `const datos = [2, 4, 6, 8, 10];

const promedio = datos.reduce((acumulado, valor) => acumulado + valor, 0) / datos.length;

console.log("Promedio del conjunto de datos:", promedio);`;
    }

    if (
      titulo.includes('aprendizaje automático') ||
      contenido.includes('supervisado') ||
      contenido.includes('no supervisado')
    ) {
      return `const tipoAprendizaje = "supervisado";

if (tipoAprendizaje === "supervisado") {
  console.log("El modelo aprende usando datos con respuestas conocidas.");
} else {
  console.log("El modelo busca patrones sin respuestas previas.");
}`;
    }

    if (
      titulo.includes('entrenamiento') ||
      contenido.includes('entrenar')
    ) {
      return `const epocas = 5;
let precision = 50;

for (let i = 1; i <= epocas; i++) {
  precision += 8;
  console.log("Época", i, "- precisión:", precision + "%");
}`;
    }

    if (
      titulo.includes('evaluación') ||
      contenido.includes('precisión') ||
      contenido.includes('exactitud')
    ) {
      return `const prediccionesCorrectas = 8;
const totalPredicciones = 10;

const exactitud = (prediccionesCorrectas / totalPredicciones) * 100;

console.log("Exactitud del modelo:", exactitud + "%");`;
    }

    if (
      titulo.includes('node') ||
      contenido.includes('node.js')
    ) {
      return `console.log("Servidor Node.js iniciado correctamente");

const puerto = 3000;

console.log("Escuchando en el puerto:", puerto);`;
    }

    if (
      titulo.includes('módulos') ||
      titulo.includes('modulos') ||
      contenido.includes('module.exports') ||
      contenido.includes('require')
    ) {
      return `function sumar(a, b) {
  return a + b;
}

console.log("Resultado:", sumar(10, 5));`;
    }

    if (
      titulo.includes('express') ||
      contenido.includes('express')
    ) {
      return `const ruta = "/api/usuarios";
const metodo = "GET";

console.log("Ruta creada:", metodo, ruta);`;
    }

    if (
      titulo.includes('rutas') ||
      titulo.includes('controladores') ||
      contenido.includes('controlador')
    ) {
      return `function listarUsuarios() {
  return ["Michael", "Ana", "Carlos"];
}

console.log("Usuarios registrados:", listarUsuarios());`;
    }

    if (
      titulo.includes('return') ||
      contenido.includes('return')
    ) {
      return `function calcularDoble(numero) {
  return numero * 2;
}

console.log(calcularDoble(5));`;
    }

    return `console.log("Practica lo aprendido en esta lección");`;
  };

  const obtenerReto = () => {
    const titulo = leccion?.titulo?.toLowerCase() || '';
    const contenido = leccion?.contenido_texto?.toLowerCase() || '';

    if (
      titulo.includes('machine learning') ||
      contenido.includes('machine learning')
    ) {
      return 'Calcula el promedio de un conjunto de datos y muestra el resultado en consola.';
    }

    if (
      titulo.includes('aprendizaje automático') ||
      contenido.includes('supervisado') ||
      contenido.includes('no supervisado')
    ) {
      return 'Crea una condición que diferencie entre aprendizaje supervisado y no supervisado.';
    }

    if (
      titulo.includes('entrenamiento') ||
      contenido.includes('entrenar')
    ) {
      return 'Simula varias épocas de entrenamiento y muestra cómo mejora la precisión.';
    }

    if (
      titulo.includes('evaluación') ||
      contenido.includes('exactitud')
    ) {
      return 'Calcula la exactitud de un modelo usando predicciones correctas y total de predicciones.';
    }

    if (
      titulo.includes('node') ||
      contenido.includes('node.js')
    ) {
      return 'Simula el inicio de una aplicación Node.js mostrando mensajes en consola.';
    }

    if (
      titulo.includes('módulos') ||
      titulo.includes('modulos')
    ) {
      return 'Crea una función reutilizable y muestra cómo podrías usarla como módulo.';
    }

    if (
      titulo.includes('express') ||
      contenido.includes('express')
    ) {
      return 'Simula la creación de una ruta básica para una API REST.';
    }

    if (
      titulo.includes('rutas') ||
      titulo.includes('controladores')
    ) {
      return 'Crea una función controladora simple que devuelva una lista de datos.';
    }

    if (
      titulo.includes('return') ||
      contenido.includes('return')
    ) {
      return 'Crea una función que reciba un valor, procese el dato y devuelva un resultado usando return.';
    }

    return 'Realiza un pequeño ejercicio práctico relacionado con esta lección.';
  };

  const [codigo, setCodigo] = useState('');
  const [salida, setSalida] = useState('');
  const [feedback, setFeedback] = useState('');
  const [revisando, setRevisando] = useState(false);

  useEffect(() => {
    setCodigo(obtenerCodigoInicial());
    setSalida('');
    setFeedback('');
  }, [leccion?.id]);

  const ejecutarCodigo = () => {
    const logs = [];

    const consoleSimulado = {
      log: (...args) => logs.push(args.join(' '))
    };

    try {
      const funcion = new Function('console', codigo);
      funcion(consoleSimulado);

      setSalida(logs.join('\n') || 'El código se ejecutó sin salida.');
    } catch (error) {
      setSalida(`Error: ${error.message}`);
    }
  };

  const revisarConIA = async () => {
    setRevisando(true);

    try {
      const response = await api.post('/ia/chat', {
        mensaje: `
Revisa este desarrollo práctico del estudiante.

Lección:
${leccion?.titulo}

Reto:
${obtenerReto()}

Código del estudiante:
${codigo}

Salida obtenida:
${salida || 'El estudiante todavía no ejecutó el código.'}

Indica:
1. Qué está bien.
2. Qué está mal.
3. Qué puede mejorar.
4. Una pista útil sin resolver todo directamente.
        `,
        paginaActual: '/lecciones',
        contextoLeccion: leccion?.contenido_texto || ''
      });

      setFeedback(response.data.respuesta);
    } catch (error) {
      setFeedback('No se pudo consultar a UTP-BOOT en este momento.');
    } finally {
      setRevisando(false);
    }
  };

  return (
    <div className="card p-4 mt-4">
      <h3>Área de práctica</h3>

      <p className="text-muted">
        Practica directamente lo aprendido en esta lección.
      </p>

      <div className="alert alert-primary">
        <strong>Reto práctico:</strong> {obtenerReto()}
      </div>

      <textarea
        className="form-control mb-3"
        rows="10"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        style={{ fontFamily: 'Consolas, monospace' }}
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button className="btn btn-dark" onClick={ejecutarCodigo}>
          Ejecutar código
        </button>

        <button
          className="btn btn-primary"
          onClick={revisarConIA}
          disabled={revisando}
        >
          {revisando ? 'UTP-BOOT revisando...' : 'Revisar con UTP-BOOT'}
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setCodigo(obtenerCodigoInicial());
            setSalida('');
            setFeedback('');
          }}
        >
          Reiniciar práctica
        </button>
      </div>

      <div className="border rounded p-3 mb-3">
        <h5>Salida</h5>
        <pre>{salida || 'Aquí aparecerá el resultado del código.'}</pre>
      </div>

      {feedback && (
        <div className="alert alert-info">
          <strong>Feedback de UTP-BOOT:</strong>

          <div style={{ whiteSpace: 'pre-wrap' }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default AreaPractica;