const pool = require('../config/db');

const obtenerUsuarios = async () => {
  const result = await pool.query('SELECT * FROM "Usuario" ORDER BY fecha_registro DESC');
  return result.rows;
};

const buscarPorId = async (id) => {
  const result = await pool.query('SELECT * FROM "Usuario" WHERE id = $1', [id]);
  return result.rows[0];
};

const buscarPorEmailPassword = async (email, password_hash) => {
  const result = await pool.query(
    `SELECT 
      id,
      nombre,
      apellido,
      email,
      rol,
      puntos_xp,
      avatar_url,
      fecha_registro,
      email_verificado
    FROM "Usuario"
    WHERE email = $1 AND password_hash = $2`,
    [email, password_hash]
  );

  return result.rows[0];
};

const buscarPorEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM "Usuario" WHERE email = $1`,
    [email]
  );

  return result.rows[0];
}

const crear = async (usuario) => {
  const { nombre, apellido, email, password_hash, rol } = usuario;

  const result = await pool.query(
    `INSERT INTO "Usuario"
    (nombre, apellido, email, password_hash, rol)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [nombre, apellido, email, password_hash, rol]
  );

  return result.rows[0];
};

const actualizar = async (id, usuario) => {
  const { nombre, apellido, email, password_hash, rol } = usuario;

  const result = await pool.query(
    `UPDATE "Usuario"
    SET nombre = $1,
        apellido = $2,
        email = $3,
        password_hash = $4,
        rol = $5
    WHERE id = $6
    RETURNING *`,
    [nombre, apellido, email, password_hash, rol, id]
  );

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    'DELETE FROM "Usuario" WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0];
};

const verificarEmail = async (usuario_id) => {
  const result = await pool.query(
    `UPDATE "Usuario"
     SET email_verificado = true
     WHERE id = $1
     RETURNING id, nombre, apellido, email, rol, email_verificado`,
    [usuario_id]
  );

  return result.rows[0];
}

module.exports = {
  obtenerUsuarios,
  buscarPorId,
  buscarPorEmailPassword,
  buscarPorEmail,
  crear,
  actualizar,
  eliminar,
  verificarEmail
};