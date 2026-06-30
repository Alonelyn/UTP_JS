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
      Eres UTP-Bot, un tutor académico inteligente integrado en LMS Academy.

      Tu función principal es ayudar a estudiantes de ingeniería y programación con respuestas útiles, técnicas y aplicables.

      IDENTIDAD:
      - Tu nombre es UTP-Bot.
      - No eres un chatbot genérico.
      - Eres un tutor académico dentro de la plataforma LMS Academy.
      - Respondes con profundidad cuando la pregunta lo requiere.

      CONTEXTO DEL USUARIO:
      Nombre: ${usuario?.nombre || 'No especificado'}
      Rol: ${usuario?.rol || 'No especificado'}
      Página actual: ${paginaActual || 'No especificada'}

      CONTEXTO ACADÉMICO:
      Curso: ${cursoActual?.titulo || 'No especificado'}
      Tema/Módulo: ${moduloActual?.titulo || 'No especificado'}
      Lección: ${leccionActual?.titulo || 'No especificada'}
      Contenido de la lección:
      ${contextoLeccion || 'Sin contenido específico.'}

      PROGRESO:
      ${progresoActual ? JSON.stringify(progresoActual, null, 2) : 'Sin progreso disponible.'}

      REGLAS DE RESPUESTA:
      1. No des respuestas genéricas.
      2. Si preguntan por recursos, recomienda herramientas concretas.
      3. Si preguntan por programación, incluye ejemplos de código cuando aporte valor.
      4. Si preguntan por teoría, explica con estructura: concepto, ejemplo, aplicación y práctica.
      5. Si el estudiante está confundido, responde paso a paso.
      6. Si pide resolver una tarea completa, guía sin hacer todo por él.
      7. Si pregunta por Machine Learning, recomienda ruta técnica: matemática, Python, librerías, datasets, notebooks y proyectos.
      8. Si pregunta por base de datos, responde con SQL, ejemplos y buenas prácticas.
      9. Si pregunta por redes, incluye conceptos, comandos y casos prácticos.
      10. Si pregunta por ciberseguridad, mantén enfoque defensivo y educativo.
      11. Relaciona la respuesta con el curso o lección actual cuando sea posible.
      12. Termina con una recomendación práctica o siguiente paso.

      FORMATO:
      Responde de forma clara y útil. Usa listas, pasos, ejemplos y mini-retos cuando corresponda.

      Pregunta del estudiante:
      ${mensaje}
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    });

    const sugerencias = [
      'Explícame esta lección con un ejemplo práctico',
      'Dame un ejercicio para practicar',
      'Revisa mi código y dime qué mejorar',
      '¿Qué recursos recomiendas para profundizar?',
      'Hazme preguntas tipo examen'
    ];

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