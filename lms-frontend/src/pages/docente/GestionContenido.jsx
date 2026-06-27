import { useEffect, useState } from 'react';
import api from '../../api/axios';
import '../../styles/gestion-contenido.css';

function GestionContenido() {
  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState('');

  const [formCurso, setFormCurso] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    precio: 0,
    nivel: 'principiante',
    estado: 'borrador'
  });

  const [formModulo, setFormModulo] = useState({
    titulo: '',
    orden: 1
  });

  const [formLeccion, setFormLeccion] = useState({
    modulo_id: '',
    titulo: '',
    tipo: 'texto',
    orden: 1,
    contenido_texto: '',
    puntos_otorgados: 10
  });

  const cargarDatos = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const cursosRes = await api.get('/cursos');
    setCursos(cursosRes.data);

    setCursos(misCursos);

    const modulosRes = await api.get('/modulos');
    setModulos(modulosRes.data);

    const leccionesRes = await api.get('/lecciones');
    setLecciones(leccionesRes.data);
  };

  const crearCurso = async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!formCurso.titulo.trim() || !formCurso.slug.trim()) {
      alert('Título y slug son obligatorios');
      return;
    }

    const response = await api.post('/cursos', {
      ...formCurso,
      instructor_id: usuario.id
    });

    setFormCurso({
      titulo: '',
      slug: '',
      descripcion: '',
      precio: 0,
      nivel: 'principiante',
      estado: 'borrador'
    });

    setCursoSeleccionado(response.data.id);
    cargarDatos();
  };

  const crearModulo = async (e) => {
    e.preventDefault();

    if (!cursoSeleccionado || !formModulo.titulo.trim()) {
      alert('Selecciona un curso y escribe el título del tema');
      return;
    }

    await api.post('/modulos', {
      curso_id: cursoSeleccionado,
      titulo: formModulo.titulo,
      orden: formModulo.orden
    });

    setFormModulo({
      titulo: '',
      orden: 1
    });

    cargarDatos();
  };

  const crearLeccion = async (e) => {
    e.preventDefault();

    if (!formLeccion.modulo_id || !formLeccion.titulo.trim()) {
      alert('Selecciona un tema y escribe el título de la lección');
      return;
    }

    await api.post('/lecciones', formLeccion);

    setFormLeccion({
      modulo_id: '',
      titulo: '',
      tipo: 'texto',
      orden: 1,
      contenido_texto: '',
      puntos_otorgados: 10
    });

    cargarDatos();
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const modulosDelCurso = modulos.filter(
    (modulo) => modulo.curso_id === cursoSeleccionado
  );

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="gestion-head">
        <p className="eyebrow" style={{ '--accent': 'var(--emerald)' }}>Banco de trabajo</p>
        <h1 className="page-title">Gestión de temas y lecciones</h1>
      </div>

      <div className="gestion-wrap">
        <div className="gestion-form curso mb-4">
          <div className="gestion-form-head">Crear curso</div>

          <form onSubmit={crearCurso} className="gestion-form-body">
            <input
              className="form-control mb-2"
              placeholder="Título del curso"
              value={formCurso.titulo}
              onChange={(e) =>
                setFormCurso({ ...formCurso, titulo: e.target.value })
              }
            />

            <input
              className="form-control mb-2"
              placeholder="Slug del curso"
              value={formCurso.slug}
              onChange={(e) =>
                setFormCurso({ ...formCurso, slug: e.target.value })
              }
            />

            <textarea
              className="form-control mb-2"
              placeholder="Descripción del curso"
              rows="3"
              value={formCurso.descripcion}
              onChange={(e) =>
                setFormCurso({ ...formCurso, descripcion: e.target.value })
              }
            />

            <input
              className="form-control mb-2"
              type="number"
              placeholder="Precio"
              value={formCurso.precio}
              onChange={(e) =>
                setFormCurso({ ...formCurso, precio: Number(e.target.value) })
              }
            />

            <select
              className="form-control mb-2"
              value={formCurso.nivel}
              onChange={(e) =>
                setFormCurso({ ...formCurso, nivel: e.target.value })
              }
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>

            <select
              className="form-control mb-2"
              value={formCurso.estado}
              onChange={(e) =>
                setFormCurso({ ...formCurso, estado: e.target.value })
              }
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>

            <button className="btn btn-dark" type="submit">
              Crear curso
            </button>
          </form>
        </div>

        <div className="gestion-selector">
          <h4>Seleccionar curso</h4>

          <select
            className="form-control"
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un curso</option>

            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="gestion-columnas">
          <div className="gestion-form tema">
            <div className="gestion-form-head">Crear tema / módulo</div>
            <form onSubmit={crearModulo} className="gestion-form-body">
              <input
                className="form-control mb-2"
                placeholder="Título del tema"
                value={formModulo.titulo}
                onChange={(e) =>
                  setFormModulo({ ...formModulo, titulo: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                type="number"
                placeholder="Orden"
                value={formModulo.orden}
                onChange={(e) =>
                  setFormModulo({ ...formModulo, orden: Number(e.target.value) })
                }
              />

              <button className="btn btn-primary" type="submit">
                Crear tema
              </button>
            </form>
          </div>

          <div className="gestion-form leccion">
            <div className="gestion-form-head">Crear lección</div>
            <form onSubmit={crearLeccion} className="gestion-form-body">
              <select
                className="form-control mb-2"
                value={formLeccion.modulo_id}
                onChange={(e) =>
                  setFormLeccion({
                    ...formLeccion,
                    modulo_id: e.target.value
                  })
                }
              >
                <option value="">Selecciona un tema</option>

                {modulosDelCurso.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                    {modulo.titulo}
                  </option>
                ))}
              </select>

              <input
                className="form-control mb-2"
                placeholder="Título de la lección"
                value={formLeccion.titulo}
                onChange={(e) =>
                  setFormLeccion({ ...formLeccion, titulo: e.target.value })
                }
              />

              <select
                className="form-control mb-2"
                value={formLeccion.tipo}
                onChange={(e) =>
                  setFormLeccion({ ...formLeccion, tipo: e.target.value })
                }
              >
                <option value="texto">Texto</option>
                <option value="video">Video</option>
                <option value="examen">Examen</option>
                <option value="interactivo">Interactivo</option>
              </select>

              <input
                className="form-control mb-2"
                type="number"
                placeholder="Orden"
                value={formLeccion.orden}
                onChange={(e) =>
                  setFormLeccion({
                    ...formLeccion,
                    orden: Number(e.target.value)
                  })
                }
              />

              <textarea
                className="form-control mb-2"
                placeholder="Contenido de la lección"
                rows="5"
                value={formLeccion.contenido_texto}
                onChange={(e) =>
                  setFormLeccion({
                    ...formLeccion,
                    contenido_texto: e.target.value
                  })
                }
              />

              <input
                className="form-control mb-2"
                type="number"
                placeholder="Puntos otorgados"
                value={formLeccion.puntos_otorgados}
                onChange={(e) =>
                  setFormLeccion({
                    ...formLeccion,
                    puntos_otorgados: Number(e.target.value)
                  })
                }
              />

              <button className="btn btn-success" type="submit">
                Crear lección
              </button>
            </form>
          </div>
        </div>

        <h2 className="gestion-indice-titulo">Contenido del curso</h2>

        {modulosDelCurso.map((modulo) => (
          <div
            key={modulo.id}
            className="ficha gestion-tema-ficha"
            style={{ '--accent': 'var(--azul)' }}
          >
            <h4>Tema {modulo.orden}: {modulo.titulo}</h4>

            {lecciones
              .filter((leccion) => leccion.modulo_id === modulo.id)
              .map((leccion) => (
                <div key={leccion.id} className="gestion-leccion-item">
                  <strong>{leccion.titulo}</strong>
                  <p>Tipo: {leccion.tipo} · Orden: {leccion.orden}</p>
                  <p>{leccion.contenido_texto}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GestionContenido;
