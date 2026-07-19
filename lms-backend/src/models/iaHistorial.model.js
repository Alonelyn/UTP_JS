const pool = require('../config/db');

const guardarMensaje = async ({
  usuarioId,
  cursoId = null,
  leccionId = null,
  rol,
  mensaje
}) => {
  const query = `
    INSERT INTO ia_historial (
      usuario_id,
      curso_id,
      leccion_id,
      rol,
      mensaje
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const valores = [
    usuarioId,
    cursoId,
    leccionId,
    rol,
    mensaje
  ];

  const resultado = await pool.query(query, valores);

  return resultado.rows[0];
};

const obtenerHistorial = async ({
  usuarioId,
  cursoId = null,
  leccionId = null,
  limite = 50
}) => {
  const condiciones = ['usuario_id = $1'];
  const valores = [usuarioId];

  if (cursoId) {
    valores.push(cursoId);
    condiciones.push(`curso_id = $${valores.length}`);
  }

  if (leccionId) {
    valores.push(leccionId);
    condiciones.push(`leccion_id = $${valores.length}`);
  }

  valores.push(limite);

  const query = `
    SELECT
      id,
      usuario_id,
      curso_id,
      leccion_id,
      rol,
      mensaje,
      fecha_creacion
    FROM ia_historial
    WHERE ${condiciones.join(' AND ')}
    ORDER BY fecha_creacion DESC
    LIMIT $${valores.length}
  `;

  const resultado = await pool.query(query, valores);

  return resultado.rows.reverse();
};

const obtenerMemoriaReciente = async ({
  usuarioId,
  cursoId = null,
  leccionId = null,
  limite = 10
}) => {
  return obtenerHistorial({
    usuarioId,
    cursoId,
    leccionId,
    limite
  });
};

const eliminarHistorial = async ({
  usuarioId,
  cursoId = null,
  leccionId = null
}) => {
  const condiciones = ['usuario_id = $1'];
  const valores = [usuarioId];

  if (cursoId) {
    valores.push(cursoId);
    condiciones.push(`curso_id = $${valores.length}`);
  }

  if (leccionId) {
    valores.push(leccionId);
    condiciones.push(`leccion_id = $${valores.length}`);
  }

  const query = `
    DELETE FROM ia_historial
    WHERE ${condiciones.join(' AND ')}
    RETURNING id
  `;

  const resultado = await pool.query(query, valores);

  return resultado.rowCount;
};

module.exports = {
  guardarMensaje,
  obtenerHistorial,
  obtenerMemoriaReciente,
  eliminarHistorial
};