const pool = require('../config/db');

const obtenerActivaPorUsuario = async (usuario_id) => {
  const result = await pool.query(
    `SELECT *
     FROM "Suscripcion"
     WHERE usuario_id = $1
       AND estado = 'activa'
       AND fecha_fin > NOW()
     ORDER BY fecha_inicio DESC
     LIMIT 1`,
    [usuario_id]
  );

  return result.rows[0];
};

const crearSuscripcion = async ({ usuario_id, plan, precio, creditos_ia }) => {
  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + 30);

  const result = await pool.query(
    `INSERT INTO "Suscripcion"
     (usuario_id, plan, precio, creditos_ia, creditos_restantes, fecha_fin)
     VALUES ($1, $2, $3, $4, $4, $5)
     RETURNING *`,
    [usuario_id, plan, precio, creditos_ia, fechaFin]
  );

  return result.rows[0];
};

const registrarPago = async ({ usuario_id, suscripcion_id, monto, concepto }) => {
  const result = await pool.query(
    `INSERT INTO "Pago"
     (usuario_id, suscripcion_id, monto, metodo, estado, concepto, referencia)
     VALUES ($1, $2, $3, 'simulado', 'aprobado', $4, $5)
     RETURNING *`,
    [
      usuario_id,
      suscripcion_id,
      monto,
      concepto,
      `SIM-${Date.now()}`
    ]
  );

  return result.rows[0];
};

module.exports = {
  obtenerActivaPorUsuario,
  crearSuscripcion,
  registrarPago
};