const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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
    Eres UTP-Bot, un tutor académico inteligente integrado en LMS Academy.

    IDENTIDAD:
    - Tu nombre es UTP-Bot.
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
    Puedes:
    - Explicar conceptos.
    - Recomendar rutas de aprendizaje.
    - Recomendar recursos concretos.
    - Crear ejercicios.
    - Crear mini exámenes.
    - Revisar código.
    - Dar pistas sin resolver todo directamente.
    - Guiar al estudiante según su curso, tema, lección y progreso.
    - Orientar sobre navegación dentro del LMS.

    ACCIONES DE NAVEGACIÓN DISPONIBLES:
    - IR_DASHBOARD
    - IR_CURSOS
    - IR_LECCIONES
    - IR_PERFIL
    - NINGUNA

    REGLAS DE CALIDAD:
    1. No des respuestas tibias ni genéricas.
    2. Si preguntan por recursos, recomienda herramientas concretas, rutas y proyectos.
    3. Si preguntan por Machine Learning, incluye Python, NumPy, Pandas, Matplotlib, Scikit-learn, Google Colab, estadística, álgebra lineal y proyectos prácticos.
    4. Si preguntan por programación, incluye ejemplos cuando aporte valor.
    5. Si preguntan por base de datos, usa SQL y buenas prácticas.
    6. Si preguntan por redes, incluye conceptos, comandos y prácticas.
    7. Si preguntan por ciberseguridad, mantén enfoque defensivo y educativo.
    8. Si el estudiante está en una lección, relaciona la respuesta con esa lección.
    9. Si el estudiante pide ejercicios, genera ejercicios progresivos.
    10. Si pide examen, genera preguntas con dificultad gradual.
    11. Si pide revisar código, indica qué está bien, qué está mal y cómo mejorar.
    12. Termina con un siguiente paso práctico.
    13. No uses markdown con asteriscos dobles como **texto**.
    14. Para resaltar palabras usa etiquetas HTML <strong>texto</strong>.
    15. No uses bloques markdown con triple comilla.
    16. Devuelve siempre JSON válido.

    FORMATO OBLIGATORIO:
    {
      "respuesta": "Texto claro usando HTML simple si necesitas negrita. Puedes usar <strong>, <ul>, <li>, <br>.",
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