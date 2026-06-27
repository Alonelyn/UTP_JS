import { useEffect, useState } from 'react';
import api from '../api/axios';

function Progreso() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [progreso, setProgreso] = useState(null);

  const cargarDatos = async () => {
    const usuariosRes = await api.get('/usuarios');
    const cursosRes = await api.get('/cursos');

    setUsuarios(usuariosRes.data.filter((u) => u.rol === 'estudiante'));
    setCursos(cursosRes.data);

    if (usuario?.rol === 'estudiante') {
      setUsuarioSeleccionado(usuario.id);
    }
  };

  const consultarProgreso = async () => {
    if (!usuarioSeleccionado || !cursoSeleccionado) {
      alert('Selecciona estudiante y curso');
      return;
    }

    const response = await api.get(
      `/progreso/${usuarioSeleccionado}/${cursoSeleccionado}`
    );

    setProgreso(response.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="container mt-4" data-ai-context="true">
      <h1>Progreso académico</h1>

      {usuario?.rol !== 'estudiante' && (
        <select
          className="form-control mb-2"
          value={usuarioSeleccionado}
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
        >
          <option value="">Selecciona estudiante</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} {u.apellido} - {u.email}
            </option>
          ))}
        </select>
      )}

      <select
        className="form-control mb-2"
        value={cursoSeleccionado}
        onChange={(e) => setCursoSeleccionado(e.target.value)}
      >
        <option value="">Selecciona curso</option>
        {cursos.map((curso) => (
          <option key={curso.id} value={curso.id}>
            {curso.titulo}
          </option>
        ))}
      </select>

      <button className="btn btn-primary mb-4" onClick={consultarProgreso}>
        Consultar progreso
      </button>

      {progreso && (
        <div className="card p-4">
          <h3>Avance del curso</h3>

          <p>
            {progreso.completadas} de {progreso.total} lecciones completadas
          </p>

          <div className="progress mb-3">
            <div
              className="progress-bar"
              style={{ width: `${progreso.porcentaje}%` }}
            >
              {progreso.porcentaje}%
            </div>
          </div>

          {progreso.lecciones.map((leccion) => (
            <div key={leccion.leccion_id} className="border rounded p-2 mb-2">
              <strong>{leccion.titulo}</strong>
              <span className={`badge ms-2 ${leccion.completado ? 'bg-success' : 'bg-secondary'}`}>
                {leccion.completado ? 'Completada' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Progreso;