const pool = require('../config/db');

const obtenerPorLeccion = async (leccionId) => {
  const result = await pool.query(
    `SELECT *
     FROM "Recurso_Externo_Cache"
     WHERE leccion_id = $1
     ORDER BY fecha_creacion DESC`,
    [leccionId]
  );

  return result.rows;
};

const guardarRecursos = async (leccionId, recursos) => {
  const guardados = [];

  for (const recurso of recursos) {
    const result = await pool.query(
      `INSERT INTO "Recurso_Externo_Cache"
       (leccion_id, tipo, titulo, descripcion, url, thumbnail, fuente, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        leccionId,
        recurso.tipo,
        recurso.titulo,
        recurso.descripcion || '',
        recurso.url,
        recurso.thumbnail || null,
        recurso.fuente,
        recurso.metadata || {}
      ]
    );

    guardados.push(result.rows[0]);
  }

  return guardados;
};

const eliminarPorLeccion = async (leccionId) => {
  await pool.query(
    `DELETE FROM "Recurso_Externo_Cache"
     WHERE leccion_id = $1`,
    [leccionId]
  );
};

module.exports = {
  obtenerPorLeccion,
  guardarRecursos,
  eliminarPorLeccion
};