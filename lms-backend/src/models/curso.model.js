const pool = require('../config/db');

/**
 * Lista únicamente los cursos publicados.
 * Esta función será utilizada por el catálogo del estudiante.
 */
const listarPublicados = async () => {
  const result = await pool.query(
    `SELECT *
     FROM "Curso"
     WHERE estado = 'publicado'
     ORDER BY fecha_creacion DESC`
  );

  return result.rows;
};

/**
 * Lista todos los cursos.
 * Solo debe utilizarse para el administrador.
 */
const listarTodos = async () => {
  const result = await pool.query(
    `SELECT *
     FROM "Curso"
     ORDER BY fecha_creacion DESC`
  );

  return result.rows;
};

/**
 * Lista los cursos que pertenecen a un instructor.
 */
const listarPorInstructor = async (instructorId) => {
  const result = await pool.query(
    `SELECT *
     FROM "Curso"
     WHERE instructor_id::text = $1::text
     ORDER BY fecha_creacion DESC`,
    [String(instructorId)]
  );

  return result.rows;
};

/**
 * Busca un curso por su ID.
 */
const buscarPorId = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM "Curso"
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

/**
 * Busca un curso por su slug.
 */
const buscarPorSlug = async (slug) => {
  const result = await pool.query(
    `SELECT *
     FROM "Curso"
     WHERE slug = $1`,
    [slug]
  );

  return result.rows[0];
};

/**
 * Crea un curso y lo vincula con el instructor autenticado.
 */
const crear = async (curso) => {
  const {
    titulo,
    slug,
    descripcion,
    instructor_id,
    precio,
    nivel,
    estado
  } = curso;

  const result = await pool.query(
    `INSERT INTO "Curso"
    (
      titulo,
      slug,
      descripcion,
      instructor_id,
      precio,
      nivel,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      titulo,
      slug,
      descripcion,
      instructor_id,
      precio,
      nivel,
      estado
    ]
  );

  return result.rows[0];
};

/**
 * Actualiza los datos editables del curso.
 * No cambia el instructor propietario.
 */
const actualizar = async (id, curso) => {
  const {
    titulo,
    slug,
    descripcion,
    precio,
    nivel,
    estado
  } = curso;

  const result = await pool.query(
    `UPDATE "Curso"
     SET titulo = $1,
         slug = $2,
         descripcion = $3,
         precio = $4,
         nivel = $5,
         estado = $6
     WHERE id = $7
     RETURNING *`,
    [
      titulo,
      slug,
      descripcion,
      precio,
      nivel,
      estado,
      id
    ]
  );

  return result.rows[0];
};

/**
 * Elimina un curso por su ID.
 */
const eliminar = async (id) => {
  const result = await pool.query(
    `DELETE FROM "Curso"
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  listarPublicados,
  listarTodos,
  listarPorInstructor,
  buscarPorId,
  buscarPorSlug,
  crear,
  actualizar,
  eliminar
};