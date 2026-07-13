const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica el token JWT en el header Authorization.
 * Uso: router.post('/ruta', verificarToken, controlador)
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      mensaje: 'Acceso no autorizado — se requiere token de autenticación'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, email, rol, nombre, apellido }
    next();
  } catch (error) {
    return res.status(403).json({
      mensaje: 'Token inválido o expirado',
      error: error.message
    });
  }
};

/**
 * Middleware que verifica rol mínimo requerido.
 * Uso: soloAdmin = requiereRol('admin')
 *      soloInstructorOAdmin = requiereRol('instructor', 'admin')
 */
const requiereRol = (...roles) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({
      mensaje: `Acceso denegado — se requiere rol: ${roles.join(' o ')}`
    });
  }

  next();
};

module.exports = { verificarToken, requiereRol };
