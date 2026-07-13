const jwt = require('jsonwebtoken');
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

    // Generar token JWT con datos del usuario (expira en 8 horas)
    const token = jwt.sign(
      {
        id:       usuario.id,
        email:    usuario.email,
        rol:      usuario.rol,
        nombre:   usuario.nombre,
        apellido: usuario.apellido
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

module.exports = { login };