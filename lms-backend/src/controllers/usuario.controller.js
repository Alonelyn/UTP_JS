const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');
const { enviarCodigo } = require('./verificacion.controller')

const correoValido =
  /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|utp\.edu\.pe)$/;

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar usuarios',
      error: error.message
    });
  }
};

const buscarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al buscar usuario',
      error: error.message
    });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password_hash, rol } = req.body;

    if (!nombre || !apellido || !email || !password_hash || !rol) {
      return res.status(400).json({
        mensaje: 'Faltan campos obligatorios'
      });
    }

    if (!correoValido.test(email)) {
      return res.status(400).json({
        mensaje:
          'Correo inválido. Solo se permiten gmail.com, hotmail.com, outlook.com y utp.edu.pe'
      });
    }

    const usuarioExistente = await Usuario.buscarPorEmail(email);

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    // Hashear la contraseña ANTES de guardar en la BD
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

    const usuario = await Usuario.crear({
      ...req.body,
      password_hash:    hashedPassword,
      email_verificado: false
    });

    await enviarCodigo(usuario);
    res.status(201).json({
      mensaje: 'Usuario creado. Se envió un código de verificación al correo',
      usuario
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al crear usuario',
      error: error.message
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (email && !correoValido.test(email)) {
      return res.status(400).json({
        mensaje: 'Correo inválido. Solo se permiten gmail.com, hotmail.com, outlook.com y utp.edu.pe'
      });
    }

    const datos = { ...req.body };

    // Si viene nueva contraseña, hashearla antes de guardar
    if (password_hash && password_hash.trim()) {
      datos.password_hash = await bcrypt.hash(password_hash, 12);
    } else {
      // Si no viene contraseña, eliminar el campo para no tocar el hash existente
      delete datos.password_hash;
    }

    const usuario = await Usuario.actualizar(req.params.id, datos);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Nunca devolver el hash al cliente
    const { password_hash: _, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.eliminar(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({
      mensaje: 'Usuario eliminado',
      usuario
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};