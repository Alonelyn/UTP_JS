const pool = require('../config/db');

const listarAlumnosDelDocente = async (
  instructorId
) => {
  const result = await pool.query(
    `
    WITH lecciones_curso AS (
      SELECT
        m.curso_id,
        COUNT(l.id) AS total_lecciones
      FROM "Modulo" m
      LEFT JOIN "Leccion" l
        ON l.modulo_id = m.id
      GROUP BY m.curso_id
    ),

    progreso_alumno AS (
      SELECT
        pl.usuario_id,
        m.curso_id,

        COUNT(
          CASE
            WHEN pl.completado = true
            THEN 1
          END
        ) AS lecciones_completadas,

        COALESCE(
          SUM(pl.tiempo_activo),
          0
        ) AS tiempo_total_segundos

      FROM "Progreso_Leccion" pl

      INNER JOIN "Leccion" l
        ON l.id = pl.leccion_id

      INNER JOIN "Modulo" m
        ON m.id = l.modulo_id

      GROUP BY
        pl.usuario_id,
        m.curso_id
    ),

    uso_ia AS (
      SELECT
        usuario_id::text AS usuario_id,
        curso_id::text AS curso_id,

        COUNT(*) FILTER (
          WHERE rol = 'user'
        ) AS consultas_bot,

        COUNT(
          DISTINCT leccion_id
        ) FILTER (
          WHERE rol = 'user'
        ) AS lecciones_consultadas_bot,

        MAX(fecha_creacion) FILTER (
          WHERE rol = 'user'
        ) AS ultima_consulta_bot

      FROM ia_historial

      GROUP BY
        usuario_id,
        curso_id
    )

    SELECT
      u.id AS usuario_id,
      u.nombre,
      u.apellido,
      u.email,

      c.id AS curso_id,
      c.titulo AS curso_titulo,

      i.fecha_inscripcion,

      COALESCE(
        lc.total_lecciones,
        0
      ) AS total_lecciones,

      COALESCE(
        pa.lecciones_completadas,
        0
      ) AS lecciones_completadas,

      CASE
        WHEN COALESCE(
          lc.total_lecciones,
          0
        ) = 0
        THEN 0

        ELSE ROUND(
          (
            COALESCE(
              pa.lecciones_completadas,
              0
            )::numeric
            /
            lc.total_lecciones::numeric
          ) * 100
        )
      END AS progreso_porcentaje,

      COALESCE(
        pa.tiempo_total_segundos,
        0
      ) AS tiempo_total_segundos,

      COALESCE(
        ui.consultas_bot,
        0
      ) AS consultas_bot,

      COALESCE(
        ui.lecciones_consultadas_bot,
        0
      ) AS lecciones_consultadas_bot,

      ui.ultima_consulta_bot

    FROM "Inscripcion" i

    INNER JOIN "Usuario" u
      ON u.id = i.usuario_id

    INNER JOIN "Curso" c
      ON c.id = i.curso_id

    LEFT JOIN lecciones_curso lc
      ON lc.curso_id = c.id

    LEFT JOIN progreso_alumno pa
      ON pa.usuario_id = u.id
      AND pa.curso_id = c.id

    LEFT JOIN uso_ia ui
      ON ui.usuario_id = u.id::text
      AND ui.curso_id = c.id::text

    WHERE c.instructor_id::text = $1::text

    ORDER BY
      c.titulo ASC,
      u.apellido ASC,
      u.nombre ASC
    `,
    [instructorId]
  );

  return result.rows;
};

module.exports = {
  listarAlumnosDelDocente
};