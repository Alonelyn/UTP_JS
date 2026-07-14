/**
 * Reset manual de contraseña para un usuario.
 * Uso: node src/scripts/reset_password.js admin@gmail.com NuevaContraseña123
 */
require('dotenv').config();
const pool   = require('../config/db');
const bcrypt = require('bcrypt');

const [,, email, nuevaPassword] = process.argv;

if (!email || !nuevaPassword) {
  console.error('Uso: node src/scripts/reset_password.js <email> <nueva_contraseña>');
  process.exit(1);
}

async function reset() {
  const { rows } = await pool.query(
    'SELECT id, email FROM "Usuario" WHERE email = $1',
    [email]
  );

  if (!rows[0]) {
    console.error(`❌ Usuario no encontrado: ${email}`);
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(nuevaPassword, 12);

  await pool.query(
    'UPDATE "Usuario" SET password_hash = $1 WHERE email = $2',
    [hash, email]
  );

  console.log(`✅ Contraseña actualizada para: ${email}`);
  console.log(`   Nueva contraseña: ${nuevaPassword}`);
  await pool.end();
}

reset().catch(console.error);
