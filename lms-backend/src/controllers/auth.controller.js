const Usuario = require('../models/usuario.model');

const login = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email?.trim() || !password_hash?.trim()) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = await Usuario.buscarPorEmailPassword(email, password_hash);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

module.exports = {
  login
};