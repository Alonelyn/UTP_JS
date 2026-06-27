const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');
const Codigo = require('../models/codigo.model');
const { enviarCodigoVerificacion } = require('../services/mail.service');

const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const enviarCodigo = async (usuario) => {
  const codigo = generarCodigo();
  const codigo_hash = await bcrypt.hash(codigo, 10);

  const expira_en = new Date(Date.now() + 15 * 60 * 1000);

  await Codigo.crearCodigo({
    usuario_id: usuario.id,
    tipo: 'verificar_email',
    codigo_hash,
    expira_en
  });

  await enviarCodigoVerificacion(
    usuario.email,
    usuario.nombre,
    codigo
  );
};

const reenviarCodigoVerificacion = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    if (usuario.email_verificado) {
      return res.status(400).json({
        mensaje: 'Este correo ya está verificado'
      });
    }

    await enviarCodigo(usuario);

    res.json({
      mensaje: 'Código enviado al correo'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al enviar código',
      error: error.message
    });
  }
};

const verificarCorreo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const codigoActivo = await Codigo.buscarCodigoActivo({
      usuario_id: usuario.id,
      tipo: 'verificar_email'
    });

    if (!codigoActivo) {
      return res.status(400).json({
        mensaje: 'Código inválido o expirado'
      });
    }

    const coincide = await bcrypt.compare(
      codigo,
      codigoActivo.codigo_hash
    );

    if (!coincide) {
      return res.status(400).json({
        mensaje: 'Código incorrecto'
      });
    }

    await Codigo.marcarUsado(codigoActivo.id);

    const usuarioVerificado = await Usuario.verificarEmail(usuario.id);

    res.json({
      mensaje: 'Correo verificado correctamente',
      usuario: usuarioVerificado
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al verificar correo',
      error: error.message
    });
  }
};

module.exports = {
  reenviarCodigoVerificacion,
  verificarCorreo,
  enviarCodigo
};