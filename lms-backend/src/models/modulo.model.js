const pool = require('../config/db');

const listar = async () => {
  const result = await pool.query('SELECT * FROM "Modulo" ORDER BY orden ASC');
  return result.rows;
};

const buscarPorId = async (id) => {
  const result = await pool.query(
    `SELECT * FROM "Modulo" 
    WHERE id = $1`,
     [id]);
  return result.rows[0];
};

const crear = async (modulo) => {
  const { id_curso, titulo, orden } = modulo;

  const result = await pool.query(
    'INSERT INTO "Modulo" (curso_id, titulo, orden) VALUES ($1, $2, $3) RETURNING *',
    [id_curso, titulo, orden]
  );

  return result.rows[0];
};

const actualizar = async (id, modulo) => {
  const { id_curso, titulo, orden } = modulo;

  const result = await pool.query(
    'UPDATE "Modulo" SET curso_id = $1, titulo = $2, orden = $3 WHERE id = $4 RETURNING *',
    [id_curso, titulo, orden, id]
  );

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query('DELETE FROM "Modulo" WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};