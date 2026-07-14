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

const actualizar = async (id, datos) => {
  const campos  = [];
  const valores = [];
  let   idx     = 1;

  if (datos.nombre    !== undefined) { campos.push(`nombre = $${idx++}`);    valores.push(datos.nombre); }
  if (datos.apellido  !== undefined) { campos.push(`apellido = $${idx++}`);  valores.push(datos.apellido); }
  if (datos.email     !== undefined) { campos.push(`email = $${idx++}`);     valores.push(datos.email); }
  if (datos.rol       !== undefined) { campos.push(`rol = $${idx++}`);       valores.push(datos.rol); }
  // password_hash solo se actualiza si viene explícitamente en el payload
  if (datos.password_hash !== undefined && datos.password_hash !== '') {
    campos.push(`password_hash = $${idx++}`);
    valores.push(datos.password_hash);
  }

  if (campos.length === 0) return null;

  valores.push(id); // último parámetro = WHERE id

  const result = await pool.query(
    `UPDATE "Usuario" SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
    valores
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

const actualizarPassword = async (id, nuevo_hash) => {
  const result = await pool.query(
    `UPDATE "Usuario"
     SET password_hash = $1
     WHERE id = $2
     RETURNING id, email`,
    [nuevo_hash, id]
  );

  return result.rows[0];
};

module.exports = {
  obtenerUsuarios,
  buscarPorId,
  buscarPorEmailPassword,
  buscarPorEmail,
  crear,
  actualizar,
  actualizarPassword,
  eliminar,
  verificarEmail
};