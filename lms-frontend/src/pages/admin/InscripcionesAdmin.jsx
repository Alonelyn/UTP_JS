import { useEffect, useState } from 'react';
import api from '../../api/axios';

function InscripcionesAdmin() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [form, setForm] = useState({
    usuario_id: '',
    curso_id: ''
  });

  const cargarDatos = async () => {
    try {
      const usuariosRes = await api.get('/usuarios');
      const cursosRes = await api.get('/cursos');
      const inscripcionesRes = await api.get('/inscripciones');

      setUsuarios(usuariosRes.data);
      setCursos(cursosRes.data);
      setInscripciones(inscripcionesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!usuario || usuario.rol !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Acceso denegado. Solo administradores.
        </div>
      </div>
    );
  }

  const obtenerUsuario = (id) => usuarios.find((u) => u.id === id);
  const obtenerCurso = (id) => cursos.find((c) => c.id === id);

  const estudiantes = usuarios.filter((u) => u.rol === 'estudiante');

  const estudiantesFiltrados = estudiantes.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const inscripcionesFiltradas = inscripciones.filter((inscripcion) => {
    const estudiante = obtenerUsuario(inscripcion.usuario_id);
    const curso = obtenerCurso(inscripcion.curso_id);

    const texto = `
      ${estudiante?.nombre || ''}
      ${estudiante?.apellido || ''}
      ${estudiante?.email || ''}
      ${curso?.titulo || ''}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const otorgarAcceso = async (e) => {
    e.preventDefault();

    if (!form.usuario_id || !form.curso_id) {
      alert('Selecciona estudiante y curso');
      return;
    }

    const yaExiste = inscripciones.some(
      (i) => i.usuario_id === form.usuario_id && i.curso_id === form.curso_id
    );

    if (yaExiste) {
      alert('Este usuario ya tiene acceso a ese curso');
      return;
    }

    try {
      await api.post('/inscripciones', form);

      setForm({
        usuario_id: '',
        curso_id: ''
      });

      alert('Acceso otorgado correctamente');
      cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo otorgar el acceso');
    }
  };

  const revocarAcceso = async (id) => {
    const confirmar = confirm('¿Seguro que deseas revocar este acceso?');

    if (!confirmar) return;

    try {
      await api.delete(`/inscripciones/${id}`);

      alert('Acceso revocado correctamente');
      cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo revocar el acceso. Revisa si existe DELETE /api/inscripciones/:id en el backend.');
    }
  };

  return (
    <div className="container mt-4" data-ai-context="true">
      <h1>Gestión de Inscripciones</h1>
      <p>Administración de accesos de estudiantes a cursos.</p>

      <div className="card p-3 mb-4">
        <h4>Buscar alumnos o cursos</h4>

        <input
          className="form-control"
          placeholder="Buscar por nombre, apellido, correo o curso"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <p className="mt-2 mb-0">
          Alumnos encontrados: {estudiantesFiltrados.length} · Inscripciones encontradas: {inscripcionesFiltradas.length}
        </p>
      </div>

      <div className="card p-3 mb-4">
        <h4>Lista de alumnos</h4>

        {estudiantesFiltrados.length === 0 ? (
          <p>No hay alumnos que coincidan con la búsqueda.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Alumno</th>
                  <th>Email</th>
                  <th>Cursos inscritos</th>
                </tr>
              </thead>

              <tbody>
                {estudiantesFiltrados.map((estudiante) => {
                  const cantidad = inscripciones.filter(
                    (i) => i.usuario_id === estudiante.id
                  ).length;

                  return (
                    <tr key={estudiante.id}>
                      <td>{estudiante.nombre} {estudiante.apellido}</td>
                      <td>{estudiante.email}</td>
                      <td>{cantidad}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={otorgarAcceso} className="card p-3 mb-4">
        <h4>Otorgar acceso manual</h4>

        <select
          className="form-control mb-2"
          value={form.usuario_id}
          onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
        >
          <option value="">Selecciona estudiante</option>

          {estudiantesFiltrados.map((estudiante) => (
            <option key={estudiante.id} value={estudiante.id}>
              {estudiante.nombre} {estudiante.apellido} - {estudiante.email}
            </option>
          ))}
        </select>

        <select
          className="form-control mb-2"
          value={form.curso_id}
          onChange={(e) => setForm({ ...form, curso_id: e.target.value })}
        >
          <option value="">Selecciona curso</option>

          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.titulo} - S/ {curso.precio}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" type="submit">
          Otorgar acceso
        </button>
      </form>

      <h2>Inscripciones registradas</h2>

      {inscripcionesFiltradas.length === 0 ? (
        <p>No hay inscripciones registradas o no coinciden con la búsqueda.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                <th>Curso</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {inscripcionesFiltradas.map((inscripcion) => {
                const estudiante = obtenerUsuario(inscripcion.usuario_id);
                const curso = obtenerCurso(inscripcion.curso_id);

                return (
                  <tr key={inscripcion.id}>
                    <td>
                      {estudiante
                        ? `${estudiante.nombre} ${estudiante.apellido}`
                        : 'Usuario no encontrado'}
                    </td>

                    <td>{estudiante?.email || '-'}</td>

                    <td>{curso?.titulo || 'Curso no encontrado'}</td>

                    <td>
                      {inscripcion.fecha_inscripcion
                        ? new Date(inscripcion.fecha_inscripcion).toLocaleDateString()
                        : '-'}
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => revocarAcceso(inscripcion.id)}
                      >
                        Revocar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InscripcionesAdmin;