require('dotenv').config();

const express = require('express');
const cors = require('cors');

const recursosRoutes = require('./routes/recursos.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const cursoRoutes = require('./routes/curso.routes');
const moduloRoutes = require('./routes/modulo.routes');
const leccionRoutes = require('./routes/leccion.routes');
const inscripcionRoutes = require('./routes/inscripcion.routes');
const authRoutes = require('./routes/auth.routes');
const iaRoutes = require('./routes/ia.routes');
const progresoRoutes = require('./routes/progreso.routes');
const verificacionRoutes = require('./routes/verificacion.routes');
const suscripcionRoutes = require('./routes/suscripcion.routes');
const docenteRoutes = require('./routes/docente.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/lecciones', leccionRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/verificacion', verificacionRoutes);
app.use('/api/suscripciones', suscripcionRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/docente', docenteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

console.log(process.env.GEMINI_API_KEY);
console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS existe:', !!process.env.MAIL_PASS);
console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY);
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN);