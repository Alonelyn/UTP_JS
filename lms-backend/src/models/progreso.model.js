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
      l.slug,
      l.tipo,
      l.orden AS orden_leccion,
      l.modulo_id,
      m.titulo AS modulo_titulo,
      m.orden AS orden_modulo,
      COALESCE(p.completado, false) AS completado
    FROM "Leccion" l
    INNER JOIN "Modulo" m
      ON l.modulo_id = m.id
    LEFT JOIN "Progreso_Leccion" p
      ON p.leccion_id = l.id
      AND p.usuario_id = $1
    WHERE m.curso_id = $2
    ORDER BY
      m.orden ASC,
      l.orden ASC
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

const obtenerRutaCursoPorLeccion = async (leccion_id) => {
  const result = await pool.query(
    `
    SELECT
      l.id AS leccion_id,
      l.titulo,
      l.slug,
      l.orden AS orden_leccion,
      m.id AS modulo_id,
      m.titulo AS modulo_titulo,
      m.orden AS orden_modulo,
      m.curso_id
    FROM "Leccion" l
    INNER JOIN "Modulo" m
      ON m.id = l.modulo_id
    WHERE m.curso_id = (
      SELECT m2.curso_id
      FROM "Leccion" l2
      INNER JOIN "Modulo" m2
        ON m2.id = l2.modulo_id
      WHERE l2.id = $1
    )
    ORDER BY m.orden ASC, l.orden ASC
    `,
    [leccion_id]
  );

  return result.rows;
};

const verificarAccesoLeccion = async (usuario_id, leccion_id) => {
  const rutaCurso = await obtenerRutaCursoPorLeccion(leccion_id);

  if (rutaCurso.length === 0) {
    return {
      permitido: false,
      motivo: 'Lección no encontrada'
    };
  }

  const indiceActual = rutaCurso.findIndex(
    (leccion) => Number(leccion.leccion_id) === Number(leccion_id)
  );

  if (indiceActual === -1) {
    return {
      permitido: false,
      motivo: 'La lección no pertenece al curso'
    };
  }

  // La primera lección siempre se encuentra disponible.
  if (indiceActual === 0) {
    return {
      permitido: true,
      primeraLeccion: true
    };
  }

  const leccionAnterior = rutaCurso[indiceActual - 1];

  const progresoAnterior = await pool.query(
    `
    SELECT completado
    FROM "Progreso_Leccion"
    WHERE usuario_id = $1
      AND leccion_id = $2
      AND completado = true
    LIMIT 1
    `,
    [usuario_id, leccionAnterior.leccion_id]
  );

  if (progresoAnterior.rows.length === 0) {
    return {
      permitido: false,
      motivo: 'Debes completar la lección anterior',
      leccionAnterior
    };
  }

  return {
    permitido: true
  };
};

const obtenerRutaConBloqueos = async (usuario_id, curso_id) => {
  const result = await pool.query(
    `
    SELECT
      l.id AS leccion_id,
      l.titulo,
      l.slug,
      l.tipo,
      l.orden AS orden_leccion,
      l.xp_otorgada,
      l.puntos_otorgados,
      m.id AS modulo_id,
      m.titulo AS modulo_titulo,
      m.orden AS orden_modulo,
      COALESCE(p.completado, false) AS completado
    FROM "Leccion" l
    INNER JOIN "Modulo" m
      ON m.id = l.modulo_id
    LEFT JOIN "Progreso_Leccion" p
      ON p.leccion_id = l.id
      AND p.usuario_id = $1
    WHERE m.curso_id = $2
    ORDER BY m.orden ASC, l.orden ASC
    `,
    [usuario_id, curso_id]
  );

  return result.rows.map((leccion, indice, lecciones) => {
    const esPrimera = indice === 0;
    const anteriorCompletada =
      indice > 0 && lecciones[indice - 1].completado === true;

    return {
      ...leccion,
      bloqueada: !esPrimera && !anteriorCompletada
    };
  });
};

const registrarTiempoActividad = async ({
  usuario_id,
  leccion_id,
  segundos
}) => {
  const segundosValidos = Math.max(
    0,
    Math.min(Number(segundos || 0), 120)
  );

  if (segundosValidos === 0) {
    return null;
  }

  const result = await pool.query(
    `
    INSERT INTO "Progreso_Leccion"
    (
      usuario_id,
      leccion_id,
      completado,
      tiempo_activo
    )
    VALUES ($1, $2, false, $3)

    ON CONFLICT (usuario_id, leccion_id)
    DO UPDATE SET
      tiempo_activo =
        COALESCE("Progreso_Leccion".tiempo_activo, 0)
        + EXCLUDED.tiempo_activo

    RETURNING *
    `,
    [
      usuario_id,
      leccion_id,
      segundosValidos
    ]
  );

  return result.rows[0];
};

module.exports = {
  marcarCompletada,
  registrarTiempoActividad,
  obtenerProgresoCurso,
  obtenerDuracionMinima,
  obtenerRutaCursoPorLeccion,
  verificarAccesoLeccion,
  obtenerRutaConBloqueos
};