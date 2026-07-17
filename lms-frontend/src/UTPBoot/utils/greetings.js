export const obtenerSaludo = () => {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) {
    return {
      texto: 'Buenos días',
      icono: '☀️'
    };
  }

  if (hora >= 12 && hora < 19) {
    return {
      texto: 'Buenas tardes',
      icono: '🌇'
    };
  }

  return {
    texto: 'Buenas noches',
    icono: '🌙'
  };
};

export const obtenerNombreUsuario = (usuario) => {
  if (!usuario) return 'estudiante';

  return (
    usuario.nombre ||
    usuario.nombres ||
    usuario.username ||
    usuario.correo?.split('@')[0] ||
    'estudiante'
  );
};