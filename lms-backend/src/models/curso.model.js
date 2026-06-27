const pool = require('../config/db');

const listar = async () => {
  const result = await pool.query('SELECT * FROM "Curso" ORDER BY fecha_creacion DESC');
  return result.rows;
};

const buscarPorId = async (id) => {
  const result = await pool.query('SELECT * FROM "Curso" WHERE id = $1', [id]);
  return result.rows[0];
};

const crear = async (curso) => {
  const { titulo, slug, descripcion, id_usuario, precio, nivel, estado } = curso;

  const result = await pool.query(
    'INSERT INTO "Curso"(titulo, slug, descripcion, instructor_id, precio, nivel, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [titulo, slug, descripcion, id_usuario, precio, nivel, estado]
  );

  return result.rows[0];
};

const actualizar = async (id, curso) => {
  const { titulo, slug, descripcion, id_usuario, precio, nivel, estado } = curso;

  const result = await pool.query(
    'UPDATE "Curso" SET titulo=$1, slug=$2, descripcion=$3, instructor_id=$4, precio=$5, nivel=$6, estado=$7 WHERE id=$8 RETURNING *',
    [titulo, slug, descripcion, id_usuario, precio, nivel, estado, id]
  );

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query('DELETE FROM "Curso" WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};