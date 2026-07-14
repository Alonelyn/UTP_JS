const bcrypt  = require('bcrypt');
const Usuario = require('../models/usuario.model');
const Codigo  = require('../models/codigo.model');
const { enviarCorreoRecuperacion } = require('../services/mail.service');

const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ──────────────────────────────────────────────────────────────
   PASO 1 — El usuario pide restablecer su contraseña
   POST /auth/recuperar   { email }
────────────────────────────────────────────────────────────── */
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ mensaje: 'El correo es obligatorio' });
    }

    const usuario = await Usuario.buscarPorEmail(email);

    // Por seguridad siempre respondemos OK aunque el correo no exista
    // (evita enumerar usuarios registrados)
    if (!usuario) {
      return res.json({
        mensaje: 'Si el correo existe, recibirás un código de recuperación'
      });
    }

    const codigo      = generarCodigo();
    const codigo_hash = await bcrypt.hash(codigo, 10);
    const expira_en   = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await Codigo.crearCodigo({
      usuario_id: usuario.id,
      tipo:       'recuperar_password',
      codigo_hash,
      expira_en
    });

    await enviarCorreoRecuperacion(usuario.email, usuario.nombre, codigo);

    res.json({
      mensaje: 'Si el correo existe, recibirás un código de recuperación'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al procesar la solicitud',
      error:   error.message
    });
  }
};

/* ──────────────────────────────────────────────────────────────
   PASO 2 — El usuario ingresa el código y su nueva contraseña
   POST /auth/nueva-password   { email, codigo, nueva_password }
────────────────────────────────────────────────────────────── */
const restablecerPassword = async (req, res) => {
  try {
    const { email, codigo, nueva_password } = req.body;

    if (!email?.trim() || !codigo?.trim() || !nueva_password?.trim()) {
      return res.status(400).json({
        mensaje: 'Correo, código y nueva contraseña son obligatorios'
      });
    }

    if (nueva_password.length < 6) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const codigoActivo = await Codigo.buscarCodigoActivo({
      usuario_id: usuario.id,
      tipo:       'recuperar_password'
    });

    if (!codigoActivo) {
      return res.status(400).json({
        mensaje: 'El código es inválido o ya expiró. Solicita uno nuevo.'
      });
    }

    const coincide = await bcrypt.compare(codigo, codigoActivo.codigo_hash);

    if (!coincide) {
      return res.status(400).json({ mensaje: 'Código incorrecto' });
    }

    // Hashear la nueva contraseña y actualizar
    const nuevo_hash = await bcrypt.hash(nueva_password, 12);

    await Usuario.actualizarPassword(usuario.id, nuevo_hash);
    await Codigo.marcarUsado(codigoActivo.id);

    res.json({ mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al restablecer contraseña',
      error:   error.message
    });
  }
};

module.exports = { solicitarRecuperacion, restablecerPassword };
