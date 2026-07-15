const pool = require('../config/db');

const marcarCompletada = async ({ usuario_id, leccion_id, tiempo_activo }) => {
  const existente = await pool.query(
    `SELECT * FROM "Progreso_Leccion"
     WHERE usuario_id = $1 AND leccion_id = $2`,
    [usuario_id, leccion_id]
  );

  if (existente.rows.length > 0) {
    const result = await pool.query(
      `UPDATE "Progreso_Leccion"
       SET completado = true, tiempo_activo = GREATEST(COALESCE(tiempo_activo, 0), $3)
       WHERE usuario_id = $1 AND leccion_id = $2
       RETURNING *`,
      [usuario_id, leccion_id, tiempo_activo || 0]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO "Progreso_Leccion"
     (usuario_id, leccion_id, completado, tiempo_activo)
     VALUES ($1, $2, true, $3)
     RETURNING *`,
    [usuario_id, leccion_id, tiempo_activo || 0]
  );

  return result.rows[0];
};

const obtenerProgresoCurso = async (usuario_id, curso_id) => {
  const result = await pool.query(
    `
    SELECT 
      l.id AS leccion_id,
      l.titulo,
      COALESCE(p.completado, false) AS completado
    FROM "Leccion" l
    INNER JOIN "Modulo" m ON l.modulo_id = m.id
    LEFT JOIN "Progreso_Leccion" p 
      ON p.leccion_id = l.id 
      AND p.usuario_id = $1
    WHERE m.curso_id = $2
    ORDER BY m.orden ASC, l.orden ASC
    `,
    [usuario_id, curso_id]
  );

  return result.rows;
};

const obtenerDuracionMinima = async (leccion_id) => {
  const result = await pool.query(
    `SELECT duracion_minima FROM "Leccion" WHERE id = $1`,
    [leccion_id]
  );
  return result.rows[0]?.duracion_minima ?? null;
};

module.exports = {
  marcarCompletada,
  obtenerProgresoCurso,
  obtenerDuracionMinima
};