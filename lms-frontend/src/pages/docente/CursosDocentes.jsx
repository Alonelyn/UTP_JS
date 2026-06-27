import { useEffect, useState } from 'react';
import api from '../../api/axios';
import '../../styles/cursos-docente.css';

function CursosDocente() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [cursos, setCursos] = useState([]);

  const [form, setForm] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    precio: 0,
    nivel: 'principiante',
    estado: 'borrador'
  });

  const listarCursos = async () => {
    const response = await api.get('/cursos');
    const misCursos = response.data.filter(
      (curso) => curso.instructor_id === usuario.id
    );

    setCursos(misCursos);
  };

  const crearCurso = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.slug.trim()) {
      alert('Título y slug son obligatorios');
      return;
    }

    await api.post('/cursos', {
      ...form,
      instructor_id: usuario.id
    });

    setForm({
      titulo: '',
      slug: '',
      descripcion: '',
      precio: 0,
      nivel: 'principiante',
      estado: 'borrador'
    });

    listarCursos();
  };

  useEffect(() => {
    listarCursos();
  }, []);

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="docente-head">
        <p className="eyebrow" style={{ '--accent': 'var(--emerald)' }}>Panel docente</p>
        <h1 className="page-title">Gestión de cursos del docente</h1>
        <p className="page-sub">Docente: {usuario.nombre} {usuario.apellido}</p>
      </div>

      <div className="docente-wrap">
        <div className="docente-form">
          <div className="docente-form-head">Crear curso</div>
          <form onSubmit={crearCurso} className="docente-form-body">
            <input
              className="form-control mb-2"
              placeholder="Título del curso"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Slug del curso"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <textarea
              className="form-control mb-2"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <input
              className="form-control mb-2"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />

            <select
              className="form-control mb-2"
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>

            <select
              className="form-control mb-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>

            <button className="btn btn-success" type="submit">
              Crear curso
            </button>
          </form>
        </div>

        <h2 className="docente-lista-titulo">Mis cursos</h2>

        {cursos.length === 0 && (
          <p className="docente-vacio">Todavía no has creado cursos.</p>
        )}

        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="ficha docente-curso-ficha"
            style={{ '--accent': 'var(--emerald)' }}
          >
            <h4>{curso.titulo}</h4>
            <p>{curso.descripcion}</p>
            <span className="sello sello-brass">{curso.nivel}</span>{' '}
            <span className="sello sello-emerald">{curso.estado}</span>{' '}
            <span className="sello sello-azul">S/ {curso.precio}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CursosDocente;
