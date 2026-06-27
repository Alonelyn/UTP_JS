const Suscripcion = require('../models/suscripcion.model');

const planes = {
  basico: {
    precio: 0,
    creditos_ia: 20
  },
  premium: {
    precio: 19.90,
    creditos_ia: 300
  },
  golden: {
    precio: 39.90,
    creditos_ia: 1000
  }
};

const obtenerMiSuscripcion = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const suscripcion = await Suscripcion.obtenerActivaPorUsuario(usuarioId);

    res.json({
      suscripcion: suscripcion || null
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener suscripción',
      error: error.message
    });
  }
};

const comprarSuscripcion = async (req, res) => {
  try {
    const { usuario_id, plan } = req.body;

    if (!usuario_id || !plan) {
      return res.status(400).json({
        mensaje: 'usuario_id y plan son obligatorios'
      });
    }

    if (!planes[plan]) {
      return res.status(400).json({
        mensaje: 'Plan inválido'
      });
    }

    const activa = await Suscripcion.obtenerActivaPorUsuario(usuario_id);

    if (activa) {
      return res.status(409).json({
        mensaje: 'Ya tienes una suscripción activa',
        suscripcion: activa
      });
    }

    const datosPlan = planes[plan];

    const suscripcion = await Suscripcion.crearSuscripcion({
      usuario_id,
      plan,
      precio: datosPlan.precio,
      creditos_ia: datosPlan.creditos_ia
    });

    const pago = await Suscripcion.registrarPago({
      usuario_id,
      suscripcion_id: suscripcion.id,
      monto: datosPlan.precio,
      concepto: `Suscripción ${plan}`
    });

    res.status(201).json({
      mensaje: 'Suscripción activada correctamente',
      suscripcion,
      pago
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al comprar suscripción',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMiSuscripcion,
  comprarSuscripcion
};