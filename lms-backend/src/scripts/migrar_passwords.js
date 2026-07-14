/**
 * Script de migración: hashea contraseñas en texto plano con bcrypt.
 * Ejecutar UNA SOLA VEZ después de activar bcrypt en el proyecto.
 *
 * Uso:
 *   node src/scripts/migrar_passwords.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool   = require('../config/db');

const SALT_ROUNDS = 12;

const esBcrypt = (str) => typeof str === 'string' && str.startsWith('$2');

async function migrarPasswords() {
  console.log('🔐 Iniciando migración de contraseñas...\n');

  const { rows: usuarios } = await pool.query(
    'SELECT id, email, password_hash FROM "Usuario"'
  );

  console.log(`📋 Usuarios encontrados: ${usuarios.length}\n`);

  let migrados  = 0;
  let omitidos  = 0;
  let errores   = 0;

  for (const usuario of usuarios) {
    // Si ya tiene hash bcrypt, omitir
    if (esBcrypt(usuario.password_hash)) {
      console.log(`  ⏭  [OMITIDO]  ${usuario.email} — ya tiene hash bcrypt`);
      omitidos++;
      continue;
    }

    try {
      const nuevoHash = await bcrypt.hash(usuario.password_hash, SALT_ROUNDS);

      await pool.query(
        'UPDATE "Usuario" SET password_hash = $1 WHERE id = $2',
        [nuevoHash, usuario.id]
      );

      console.log(`  ✅ [MIGRADO]  ${usuario.email}`);
      migrados++;
    } catch (err) {
      console.error(`  ❌ [ERROR]    ${usuario.email} — ${err.message}`);
      errores++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Migrados:  ${migrados}`);
  console.log(`⏭  Omitidos:  ${omitidos} (ya tenían bcrypt)`);
  console.log(`❌ Errores:   ${errores}`);
  console.log('─────────────────────────────────────────\n');

  if (errores === 0) {
    console.log('🎉 Migración completada exitosamente.');
  } else {
    console.log('⚠️  Migración completada con algunos errores. Revisar arriba.');
  }

  await pool.end();
}

migrarPasswords().catch((err) => {
  console.error('Error fatal en migración:', err);
  process.exit(1);
});
