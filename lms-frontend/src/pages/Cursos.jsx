import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import '../styles/cursos.css';

function Cursos() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  const [cursoEditando, setCursoEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    precio: 0,
    nivel: 'principiante',
    estado: 'borrador'
  });

  const [pago, setPago] = useState({
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: ''
  });

  const cargarDatos = async () => {
    try {
      const cursosRes = await api.get('/cursos');
      setCursos(cursosRes.data);

      const insRes = await api.get('/inscripciones');
      setInscripciones(insRes.data);
    } catch (error) {
      console.error('Error al cargar cursos:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cursoComprado = (cursoId) => {
    return inscripciones.some(
      (i) => i.usuario_id === usuario?.id && i.curso_id === cursoId
    );
  };

  const abrirPago = (curso) => {
    if (usuario?.rol !== 'estudiante') return;
    setCursoSeleccionado(curso);
  };

  const cerrarPago = () => {
    setCursoSeleccionado(null);
    setPago({
      numero: '',
      titular: '',
      vencimiento: '',
      cvv: ''
    });
  };

  const cargarCursoParaEditar = (curso) => {
    setCursoEditando(curso);

    setFormEditar({
      titulo: curso.titulo || '',
      slug: curso.slug || '',
      descripcion: curso.descripcion || '',
      precio: Number(curso.precio) || 0,
      nivel: curso.nivel || 'principiante',
      estado: curso.estado || 'borrador'
    });
  };

  const cerrarEdicion = () => {
    setCursoEditando(null);

    setFormEditar({
      titulo: '',
      slug: '',
      descripcion: '',
      precio: 0,
      nivel: 'principiante',
      estado: 'borrador'
    });
  };

  const actualizarCurso = async (e) => {
    e.preventDefault();

    if (!formEditar.titulo.trim() || !formEditar.slug.trim()) {
      alert('Título y slug son obligatorios');
      return;
    }

    try {
      await api.put(`/cursos/${cursoEditando.id}`, formEditar);

      alert('Curso actualizado correctamente');

      cerrarEdicion();
      cargarDatos();

    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo actualizar el curso');
    }
  };

  const validarPago = () => {
    const numeroLimpio = pago.numero.replace(/\s/g, '');

    if (
      !pago.numero.trim() ||
      !pago.titular.trim() ||
      !pago.vencimiento.trim() ||
      !pago.cvv.trim()
    ) {
      alert('Completa todos los datos de pago');
      return false;
    }

    if (!/^\d{16}$/.test(numeroLimpio)) {
      alert('El número de tarjeta debe tener 16 dígitos');
      return false;
    }

    if (!/^\d{3}$/.test(pago.cvv)) {
      alert('El CVV debe tener 3 dígitos');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(pago.vencimiento)) {
      alert('La fecha de vencimiento debe tener formato MM/AA');
      return false;
    }

    return true;
  };

  const confirmarCompra = async (e) => {
    e.preventDefault();

    if (!usuario) {
      alert('Debes iniciar sesión para comprar un curso');
      return;
    }

    if (usuario.rol !== 'estudiante') {
      alert('Solo los estudiantes realizan compras de cursos');
      return;
    }

    if (!validarPago()) return;

    try {
      await api.post('/inscripciones', {
        usuario_id: usuario.id,
        curso_id: cursoSeleccionado.id
      });

      alert('Compra verificada. Curso habilitado.');
      cerrarPago();
      cargarDatos();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        'No se pudo registrar la compra'
      );
    }
  };

  const renderBotonCurso = (curso) => {
    const comprado = cursoComprado(curso.id);

    if (usuario?.rol === 'admin' || usuario?.rol === 'instructor') {
      return (
        <>
          <Link className="btn btn-dark w-100" to={`/cursos/${curso.id}`}>
            Ver curso
          </Link>

          <button
            className="btn btn-warning w-100 mt-2"
            onClick={() => cargarCursoParaEditar(curso)}
          >
            Editar curso
          </button>
        </>
      );
    }

    if (comprado) {
      return (
        <Link className="btn btn-success w-100" to={`/cursos/${curso.id}`}>
          Entrar al curso
        </Link>
      );
    }

    return (
      <button
        className="btn btn-primary w-100"
        onClick={() => abrirPago(curso)}
      >
        Comprar curso
      </button>
    );
  };

  return (
    <div className="page-shell" data-ai-context="true">
      <div className="cursos-head">
        <p className="eyebrow">Catálogo</p>
        <h1 className="page-title">Cursos disponibles</h1>
        <p className="page-sub">{cursos.length} curso(s) disponibles</p>
      </div>

      {cursos.length === 0 && (
        <p className="cursos-vacio">Todavía no hay cursos para mostrar.</p>
      )}

      <div className="cursos-grid">
        {cursos.map((curso) => (
          <div key={curso.id} className="curso-libro">
            <span className="curso-precio">S/ {curso.precio}</span>

            <h3>{curso.titulo}</h3>

            <p className="curso-desc">{curso.descripcion}</p>
            <p className="curso-slug">/{curso.slug}</p>

            <span className="sello sello-brass">{curso.nivel}</span>{' '}
            <span className="sello sello-emerald">{curso.estado}</span>

            <div className="mt-3">
              {renderBotonCurso(curso)}
            </div>
          </div>
        ))}
      </div>

      {cursoSeleccionado && usuario?.rol === 'estudiante' && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={confirmarCompra}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Confirmar compra
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={cerrarPago}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    Curso: <strong>{cursoSeleccionado.titulo}</strong>
                  </p>

                  <p>
                    Total: <strong>S/ {cursoSeleccionado.precio}</strong>
                  </p>

                  <input
                    className="form-control mb-2"
                    placeholder="Número de tarjeta"
                    maxLength="19"
                    value={pago.numero}
                    onChange={(e) =>
                      setPago({ ...pago, numero: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Nombre del titular"
                    value={pago.titular}
                    onChange={(e) =>
                      setPago({ ...pago, titular: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="MM/AA"
                    maxLength="5"
                    value={pago.vencimiento}
                    onChange={(e) =>
                      setPago({ ...pago, vencimiento: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="CVV"
                    maxLength="3"
                    type="password"
                    value={pago.cvv}
                    onChange={(e) =>
                      setPago({ ...pago, cvv: e.target.value })
                    }
                  />

                  <small className="text-muted">
                    Pago simulado. No se almacenan datos de tarjeta.
                  </small>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarPago}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-success">
                    Validar compra
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {cursoEditando && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={actualizarCurso}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Editar curso
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={cerrarEdicion}
                  ></button>
                </div>

                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Título"
                    value={formEditar.titulo}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, titulo: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Slug"
                    value={formEditar.slug}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, slug: e.target.value })
                    }
                  />

                  <textarea
                    className="form-control mb-2"
                    placeholder="Descripción"
                    rows="3"
                    value={formEditar.descripcion}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, descripcion: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Precio"
                    value={formEditar.precio}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, precio: Number(e.target.value) })
                    }
                  />

                  <select
                    className="form-control mb-2"
                    value={formEditar.nivel}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, nivel: e.target.value })
                    }
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>

                  <select
                    className="form-control mb-2"
                    value={formEditar.estado}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, estado: e.target.value })
                    }
                  >
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarEdicion}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-warning">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cursos;