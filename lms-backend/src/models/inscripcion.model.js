const pool = require('../config/db');

const listar = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM "Inscripcion"
    ORDER BY fecha_inscripcion DESC
    `
  );

  return result.rows;
};

const buscarPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM "Inscripcion"
    WHERE id_inscripcion = $1
    `,
    [id]
  );

  return result.rows[0];
};

const crear = async (inscripcion) => {
  const { usuario_id, curso_id } = inscripcion;

  const result = await pool.query(
    `
    INSERT INTO "Inscripcion"
    (
      usuario_id,
      curso_id,
      fecha_inscripcion
    )
    VALUES ($1, $2, NOW())
    RETURNING *
    `,
    [usuario_id, curso_id]
  );

  return result.rows[0];
};

const actualizar = async (id, inscripcion) => {
  const {
    usuario_id,
    curso_id,
    estado,
    progreso_porcentaje
  } = inscripcion;

  const result = await pool.query(
    `
    UPDATE "Inscripcion"
    SET
      usuario_id = $1,
      curso_id = $2,
      estado = $3,
      progreso_porcentaje = $4
    WHERE id_inscripcion = $5
    RETURNING *
    `,
    [
      usuario_id,
      curso_id,
      estado,
      progreso_porcentaje,
      id
    ]
  );

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM "Inscripcion"
    WHERE id_inscripcion = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

const buscarPorUsuarioYCurso = async (
  usuarioId,
  cursoId
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM "Inscripcion"
    WHERE usuario_id = $1
      AND curso_id = $2
    LIMIT 1
    `,
    [usuarioId, cursoId]
  );

  return result.rows[0];
};

const listarPorUsuario = async (usuarioId) => {
  const result = await pool.query(
    `
    SELECT
      i.*,
      c.titulo,
      c.slug,
      c.descripcion,
      c.precio,
      c.nivel,
      c.estado,
      c.instructor_id
    FROM "Inscripcion" i
    INNER JOIN "Curso" c
      ON c.id = i.curso_id
    WHERE i.usuario_id = $1
    ORDER BY i.fecha_inscripcion DESC
    `,
    [usuarioId]
  );

  return result.rows;
};

module.exports = {
  listar,
  buscarPorId,
  buscarPorUsuarioYCurso,
  listarPorUsuario,
  crear,
  actualizar,
  eliminar
};