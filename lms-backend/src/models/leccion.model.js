const pool = require('../config/db');

const listar = async () => {
  const result = await pool.query('SELECT * FROM "Leccion" ORDER BY orden ASC');
  return result.rows;
};

const buscarPorId = async (id) => {
  const result = await pool.query('SELECT * FROM "Leccion" WHERE id = $1', [id]);
  return result.rows[0];
};

const crear = async (leccion) => {
  const { modulo_id, titulo, tipo, orden, contenido_texto, puntos_otorgados } = leccion;

  const result = await pool.query(
    'INSERT INTO "Leccion" (modulo_id, titulo, tipo, orden, contenido_texto, puntos_otorgados) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [modulo_id, titulo, tipo, orden, contenido_texto, puntos_otorgados]
  );

  return result.rows[0];
};

const actualizar = async (id, leccion) => {
  const {
    modulo_id,
    titulo,
    tipo,
    orden,
    contenido_texto,
    puntos_otorgados,
    video_url,
    xp_otorgada
  } = leccion;

  const result = await pool.query(
    `UPDATE "Leccion"
     SET
        modulo_id = $1,
        titulo = $2,
        tipo = $3,
        orden = $4,
        contenido_texto = $5,
        puntos_otorgados = $6,
        video_url = $7,
        xp_otorgada = $8
     WHERE id = $9
     RETURNING *`,
    [
      modulo_id,
      titulo,
      tipo,
      orden,
      contenido_texto,
      puntos_otorgados,
      video_url,
      xp_otorgada,
      id
    ]
  );

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query('DELETE FROM "Leccion" WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};