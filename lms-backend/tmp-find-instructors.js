const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.query('SELECT id, nombre, apellido, email, rol, email_verificado FROM "Usuario" WHERE rol = $1 ORDER BY id ASC', ['instructor'])
  .then((res) => {
    console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
