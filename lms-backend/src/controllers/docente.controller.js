const Docente = require('../models/docente.model');

const clasificarDificultad = (alumno) => {
  const progreso = Number(
    alumno.progreso_porcentaje || 0
  );

  const totalLecciones = Number(
    alumno.total_lecciones || 0
  );

  const completadas = Number(
    alumno.lecciones_completadas || 0
  );

  const tiempo = Number(
    alumno.tiempo_total_segundos || 0
  );

  const consultas = Number(
    alumno.consultas_bot || 0
  );

  let riesgo = 0;
  const razones = [];

  if (totalLecciones === 0) {
    return {
      nivel: 'sin datos',
      riesgo: 0,
      razones: [
        'El curso todavía no tiene lecciones suficientes para realizar un análisis.'
      ]
    };
  }

  if (progreso < 10) {
    riesgo += 3;
    razones.push(
      'El progreso del alumno es inferior al 10%.'
    );
  } else if (progreso < 25) {
    riesgo += 2;
    razones.push(
      'El progreso del alumno es inferior al 25%.'
    );
  }

  if (
    tiempo >= 7200 &&
    completadas <= 2
  ) {
    riesgo += 2;
    razones.push(
      'Ha invertido bastante tiempo y ha completado pocas lecciones.'
    );
  }

  if (
    consultas >= 15 &&
    progreso < 30
  ) {
    riesgo += 3;
    razones.push(
      'Utiliza frecuentemente el bot, pero mantiene un progreso bajo.'
    );
  } else if (consultas >= 8) {
    riesgo += 1;
    razones.push(
      'Presenta un uso frecuente del asistente académico.'
    );
  }

  if (
    consultas === 0 &&
    progreso < 10
  ) {
    razones.push(
      'Mantiene un progreso bajo y todavía no ha solicitado apoyo al bot.'
    );
  }

  let nivel = 'baja';

  if (riesgo >= 6) {
    nivel = 'alta';
  } else if (riesgo >= 3) {
    nivel = 'media';
  }

  if (razones.length === 0) {
    razones.push(
      'El alumno mantiene un avance estable en el curso.'
    );
  }

  return {
    nivel,
    riesgo,
    razones
  };
};

const listarAlumnos = async (req, res) => {
  try {
    const instructorId = String(req.usuario.id);

    const alumnos =
      await Docente.listarAlumnosDelDocente(
        instructorId
      );

    const alumnosProcesados = alumnos.map(
      (alumno) => {
        const totalLecciones = Number(
          alumno.total_lecciones || 0
        );

        const leccionesCompletadas = Number(
          alumno.lecciones_completadas || 0
        );

        const progresoPorcentaje = Number(
          alumno.progreso_porcentaje || 0
        );

        const tiempoTotalSegundos = Number(
          alumno.tiempo_total_segundos || 0
        );

        const consultasBot = Number(
          alumno.consultas_bot || 0
        );

        const leccionesConsultadasBot = Number(
          alumno.lecciones_consultadas_bot || 0
        );

        const analisis =
          clasificarDificultad({
            ...alumno,
            total_lecciones: totalLecciones,
            lecciones_completadas:
              leccionesCompletadas,
            progreso_porcentaje:
              progresoPorcentaje,
            tiempo_total_segundos:
              tiempoTotalSegundos,
            consultas_bot: consultasBot
          });

        return {
          ...alumno,

          total_lecciones:
            totalLecciones,

          lecciones_completadas:
            leccionesCompletadas,

          progreso_porcentaje:
            progresoPorcentaje,

          tiempo_total_segundos:
            tiempoTotalSegundos,

          consultas_bot:
            consultasBot,

          lecciones_consultadas_bot:
            leccionesConsultadasBot,

          dificultad:
            analisis.nivel,

          puntaje_riesgo:
            analisis.riesgo,

          razones_dificultad:
            analisis.razones
        };
      }
    );

    return res.json({
      alumnos: alumnosProcesados,
      total: alumnosProcesados.length
    });
  } catch (error) {
    console.error(
      'Error al listar alumnos del docente:',
      error
    );

    return res.status(500).json({
      mensaje:
        'No se pudieron obtener los alumnos',
      error:
        error.message,
      detalle:
        error.detail || null
    });
  }
};

module.exports = {
  listarAlumnos
};