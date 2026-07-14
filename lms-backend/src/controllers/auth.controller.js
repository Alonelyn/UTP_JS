const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');

const login = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email?.trim() || !password_hash?.trim()) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    // Comparar contraseña con el hash almacenado
    const passwordValida = await bcrypt.compare(password_hash, usuario.password_hash);

    if (!passwordValida) {
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

    // Nunca exponer el hash al cliente
    const { password_hash: _, ...usuarioSeguro } = usuario;

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuarioSeguro
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

module.exports = { login };