require('dotenv').config();
const pool   = require('./src/config/db');
const bcrypt = require('bcrypt');

async function diagnostico() {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM "Usuario" ORDER BY id'
  );

  console.log('\n📋 Estado de contraseñas en la BD:\n');

  for (const u of rows) {
    const esBcrypt = u.password_hash?.startsWith('$2');
    console.log(`  ${u.email}`);
    console.log(`    Primeros 30 chars: ${u.password_hash?.slice(0, 30)}`);
    console.log(`    ¿Es bcrypt?: ${esBcrypt ? 'SI' : 'NO - texto plano'}`);
    console.log('');
  }

  await pool.end();
}

diagnostico().catch(console.error);
