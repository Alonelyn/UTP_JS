const pool = require('../config/db');

const crearCodigo = async ({ usuario_id, tipo, codigo_hash, expira_en }) => {
  const result = await pool.query(
    `INSERT INTO "Codigo_Verificacion"
     (usuario_id, tipo, codigo_hash, expira_en)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [usuario_id, tipo, codigo_hash, expira_en]
  );

  return result.rows[0];
};

const buscarCodigoActivo = async ({ usuario_id, tipo }) => {
  const result = await pool.query(
    `SELECT *
     FROM "Codigo_Verificacion"
     WHERE usuario_id = $1
       AND tipo = $2
       AND usado = false
       AND expira_en > NOW()
     ORDER BY fecha_creacion DESC
     LIMIT 1`,
    [usuario_id, tipo]
  );

  return result.rows[0];
};

const marcarUsado = async (id) => {
  const result = await pool.query(
    `UPDATE "Codigo_Verificacion"
     SET usado = true
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  crearCodigo,
  buscarCodigoActivo,
  marcarUsado
};