const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const chatIA = async (req, res) => {
  try {
    const {
      mensaje,
      paginaActual,
      contextoLeccion
    } = req.body;

    if (!mensaje?.trim()) {
      return res.status(400).json({
        mensaje: 'El mensaje es obligatorio'
      });
    }

    let contextoSistema = '';

    switch (paginaActual) {
      case '/dashboard':
        contextoSistema = `
        El estudiante está en el Dashboard del LMS.
        Puedes orientarlo sobre el avance general, cursos disponibles y navegación del sistema.
        `;
        break;

      case '/cursos':
        contextoSistema = `
        El estudiante está en la sección de Cursos.
        Puedes ayudarlo a entender qué cursos revisar o cómo continuar su aprendizaje.
        `;
        break;

      case '/modulos':
        contextoSistema = `
        El estudiante está en la sección de Módulos.
        Puedes explicar la estructura del curso y cómo se organizan las lecciones.
        `;
        break;

      case '/lecciones':
        contextoSistema = `
        El estudiante está dentro de una lección.

        Contenido de la lección actual:
        ${contextoLeccion || 'No se envió contenido específico de la lección.'}
        `;
        break;

      case '/perfil':
        contextoSistema = `
        El estudiante está en su Perfil.
        Puedes orientarlo sobre sus datos, progreso y estado dentro del LMS.
        `;
        break;

      default:
        contextoSistema = `
        El estudiante está dentro del sistema LMS.
        Puedes ayudarlo con navegación general y orientación académica.
        `;
    }

    const prompt = `
      Eres UTP-Bot, un asistente académico avanzado dentro del LMS Academy.

      Tu objetivo no es solo responder dudas simples, sino orientar al estudiante como un tutor universitario técnico.

      Debes:
      - Explicar conceptos con claridad.
      - Recomendar rutas de aprendizaje.
      - Sugerir recursos concretos.
      - Proponer ejercicios prácticos.
      - Dar ejemplos de código cuando corresponda.
      - Relacionar la respuesta con el curso actual.
      - Responder con profundidad cuando la pregunta lo requiera.
      - No dar respuestas genéricas o superficiales.
      - Si el estudiante pregunta por recursos, entrega una lista organizada por nivel: básico, intermedio y avanzado.
      - Si el estudiante pregunta por tecnología, menciona herramientas reales y usos concretos.
      - Si el estudiante está en una lección, usa el contenido como contexto.
      - Si no hay contexto suficiente, responde igual con una guía académica útil.

      Reglas:
      - Sé claro, técnico y directo.
      - No resuelvas trabajos completos.
      - Da pistas, ejemplos y explicación paso a paso.
      - No digas que no puedes ayudar si la pregunta está relacionada con informática, programación, bases de datos, redes, IA o desarrollo de software.
      - Si la pregunta está fuera del área académica, redirige amablemente.

      Acciones disponibles:
      IR_DASHBOARD
      IR_CURSOS
      IR_LECCIONES
      IR_PERFIL
      NINGUNA

      Devuelve SIEMPRE un JSON válido:

      {
        "respuesta": "texto para el estudiante",
        "accion": "NINGUNA"
      }

      Página actual:
      ${paginaActual || 'No especificada'}

      Contenido disponible:
      ${contextoLeccion || 'No se envió contexto específico.'}

      Pregunta del estudiante:
      ${mensaje}
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });

    const texto = response.text;

    const limpio = texto
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const data = JSON.parse(limpio);

      return res.json({
        respuesta: data.respuesta || 'No pude generar una respuesta clara.',
        accion: data.accion || 'NINGUNA'
      });

    } catch (parseError) {
      console.log('Gemini devolvió texto no JSON:', texto);

      return res.json({
        respuesta: texto,
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

module.exports = {
  chatIA
};