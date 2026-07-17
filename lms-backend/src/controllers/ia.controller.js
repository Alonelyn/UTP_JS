const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const limpiarJsonGemini = (texto = '') => {
  return texto
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
};

const chatIA = async (req, res) => {
  try {
    const {
      mensaje,
      paginaActual,
      contextoPagina,
      contextoLeccion,
      usuario,
      cursoActual,
      moduloActual,
      leccionActual,
      progresoActual
    } = req.body;

    if (!mensaje?.trim()) {
      return res.status(400).json({
        mensaje: 'El mensaje es obligatorio'
      });
    }

    const contextoSistema = `
El usuario está en la página: ${paginaActual || 'No especificada'}.

Contexto visible de la página:
${contextoPagina || 'No se recibió contenido visible de la página.'}

Contenido de la lección:
${contextoLeccion || 'No se recibió contenido específico de la lección.'}
`;

    const prompt = `
Eres UTP-BOOT, un tutor académico inteligente integrado en LMS Academy.

IDENTIDAD:
- Tu nombre es UTP-BOOT.
- Eres un asistente académico especializado en programación, bases de datos, redes, IA, ciberseguridad y desarrollo de software.
- No eres un chatbot genérico.
- Tu función es acompañar al estudiante como tutor universitario técnico.
- Debes dar respuestas útiles, profundas, claras y aplicables.

CONTEXTO DEL USUARIO:
Nombre: ${usuario?.nombre || 'No especificado'}
Rol: ${usuario?.rol || 'No especificado'}
Página actual: ${paginaActual || 'No especificada'}

CONTEXTO ACADÉMICO:
Curso: ${cursoActual?.titulo || 'No especificado'}
Tema/Módulo: ${moduloActual?.titulo || 'No especificado'}
Lección: ${leccionActual?.titulo || 'No especificada'}

${contextoSistema}

PROGRESO:
${progresoActual ? JSON.stringify(progresoActual, null, 2) : 'Sin progreso disponible.'}

CAPACIDADES:
- Explicar conceptos.
- Recomendar rutas de aprendizaje.
- Recomendar recursos concretos.
- Crear ejercicios.
- Crear mini exámenes.
- Revisar código.
- Dar pistas sin resolver todo directamente.
- Guiar al estudiante según curso, módulo, lección y progreso.
- Orientar sobre navegación dentro del LMS.

ACCIONES DE NAVEGACIÓN DISPONIBLES:
- IR_DASHBOARD
- IR_CURSOS
- IR_LECCIONES
- IR_PERFIL
- NINGUNA

REGLAS:
1. No des respuestas genéricas.
2. Relaciona la respuesta con la lección actual.
3. Cuando sea útil, incluye ejemplos.
4. Termina con un siguiente paso práctico.
5. No uses markdown con asteriscos.
6. No uses bloques con triple comilla.
7. Devuelve exclusivamente JSON válido.

FORMATO OBLIGATORIO:
{
  "respuesta": "Texto claro para el estudiante",
  "accion": "NINGUNA"
}

Pregunta del estudiante:
${mensaje}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });

    const texto = response.text || '';
    const limpio = limpiarJsonGemini(texto);

    try {
      const data = JSON.parse(limpio);

      return res.json({
        respuesta:
          data.respuesta ||
          'No pude generar una respuesta clara.',
        accion: data.accion || 'NINGUNA'
      });
    } catch (parseError) {
      console.error('Respuesta no válida de Gemini:', texto);

      return res.json({
        respuesta: texto || 'No pude generar una respuesta.',
        accion: 'NINGUNA'
      });
    }
  } catch (error) {
    console.error('Error Gemini:', error);

    return res.status(500).json({
      mensaje: 'Error al consultar la IA',
      error: error.message
    });
  }
};

const analizarLeccion = async (req, res) => {
  try {
    const {
      usuario,
      curso,
      leccion,
      progreso
    } = req.body;

    if (!leccion?.titulo) {
      return res.status(400).json({
        mensaje: 'La información de la lección es obligatoria'
      });
    }

    const prompt = `
Eres UTP-BOOT, un agente académico inteligente integrado en LMS Academy.

Debes analizar una lección y devolver información útil para acompañar al estudiante.

ESTUDIANTE:
Nombre: ${usuario?.nombre || 'Estudiante'}
Rol: ${usuario?.rol || 'estudiante'}

CURSO:
Título: ${curso?.titulo || 'No especificado'}
Descripción: ${curso?.descripcion || 'No especificada'}

LECCIÓN:
Título: ${leccion?.titulo}
Descripción: ${leccion?.descripcion || 'No especificada'}

CONTENIDO:
${leccion?.contenido_texto || 'No se recibió contenido detallado'}

RETO ACTUAL:
${leccion?.reto_practico || 'No especificado'}

PROGRESO:
${progreso ? JSON.stringify(progreso, null, 2) : 'Sin progreso disponible'}

INSTRUCCIONES:
1. Genera un resumen claro de la lección.
2. Determina el nivel: Básico, Intermedio o Avanzado.
3. Estima una duración de estudio.
4. Genera entre 3 y 5 objetivos.
5. Da un consejo personalizado.
6. Indica el siguiente paso recomendado.
7. Propón una práctica relacionada.
8. No uses markdown.
9. No uses HTML.
10. Devuelve exclusivamente JSON válido.

FORMATO OBLIGATORIO:
{
  "resumen": "Resumen de la lección",
  "nivel": "Básico",
  "duracion": "15 minutos",
  "objetivos": [
    "Objetivo 1",
    "Objetivo 2",
    "Objetivo 3"
  ],
  "consejo": "Consejo personalizado",
  "siguientePaso": "Siguiente acción recomendada",
  "proyecto": {
    "titulo": "Título de la práctica",
    "descripcion": "Descripción clara del ejercicio",
    "dificultad": "Básico"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });

    const texto = response.text || '';
    const limpio = limpiarJsonGemini(texto);

    let resultado;

    try {
      resultado = JSON.parse(limpio);
    } catch (parseError) {
      console.error(
        'Gemini devolvió un análisis inválido:',
        texto
      );

      return res.status(502).json({
        mensaje: 'La IA devolvió un análisis con formato inválido'
      });
    }

    return res.json({
      resumen:
        resultado.resumen ||
        'No se pudo generar el resumen.',

      nivel:
        resultado.nivel ||
        'No determinado',

      duracion:
        resultado.duracion ||
        '15 minutos',

      objetivos:
        Array.isArray(resultado.objetivos)
          ? resultado.objetivos
          : [],

      consejo:
        resultado.consejo ||
        'Revisa el contenido antes de iniciar la práctica.',

      siguientePaso:
        resultado.siguientePaso ||
        'Realiza el reto práctico de la lección.',

      proyecto: {
        titulo:
          resultado.proyecto?.titulo ||
          'Práctica de la lección',

        descripcion:
          resultado.proyecto?.descripcion ||
          leccion?.reto_practico ||
          'Aplica los conceptos estudiados en un ejercicio práctico.',

        dificultad:
          resultado.proyecto?.dificultad ||
          resultado.nivel ||
          'Básico'
      }
    });
  } catch (error) {
    console.error('Error al analizar la lección:', error);

    return res.status(500).json({
      mensaje: 'No se pudo analizar la lección',
      error: error.message
    });
  }
};

module.exports = {
  chatIA,
  analizarLeccion
};