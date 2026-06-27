import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AreaPractica from '../components/AreaPractica';
import api from '../api/axios';

function LeccionDetalle() {
  const { cursoId, leccionId } = useParams();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [curso, setCurso] = useState(null);
  const [leccion, setLeccion] = useState(null);

  const [completada, setCompletada] = useState(false);

  const [leccionesCurso, setLeccionesCurso] = useState([]);
  const [progreso, setProgreso] = useState(null);

  const indiceActual = leccionesCurso.findIndex((l) => l.id === leccionId);
  const siguienteLeccion = leccionesCurso[indiceActual + 1];
  const leccionAnterior = leccionesCurso[indiceActual - 1];

  const cargarDatos = async () => {
    const cursos = await api.get('/cursos');
    const lecciones = await api.get('/lecciones');
    const modulosRes = await api.get('/modulos');

    const modulosCurso = modulosRes.data
      .filter((m) => m.curso_id === cursoId)
      .sort((a, b) => a.orden - b.orden);

    const leccionesOrdenadas = modulosCurso.flatMap((modulo) =>
      lecciones.data
        .filter((l) => l.modulo_id === modulo.id)
        .sort((a, b) => a.orden - b.orden)
    );

    setLeccionesCurso(leccionesOrdenadas);

    const progresoRes = await api.get(`/progreso/${usuario.id}/${cursoId}`);

    setProgreso(progresoRes.data);

    const progresoLeccion = progresoRes.data.lecciones.find(
      (p) => p.leccion_id === leccionId
    );

    setCompletada(progresoLeccion?.completado || false);

    setCurso(cursos.data.find((c) => c.id === cursoId));
    setLeccion(lecciones.data.find((l) => l.id === leccionId));
  };

  const marcarCompletada = async () => {
    try {
      await api.post('/progreso', {
        usuario_id: usuario.id,
        leccion_id: leccion.id
      });

      setCompletada(true);
      
      const progresoRes = await api.get(`/progreso/${usuario.id}/${cursoId}`);
      setProgreso(progresoRes.data);
      alert('Lección marcada como completada');
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('No se pudo marcar la lección');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cursoId, leccionId]);

  if (!leccion) {
    return <div className="container mt-4">Cargando...</div>;
  }

  return (
    <div className="container mt-4" data-ai-context="true">
      <Link className="btn btn-outline-secondary mb-3" to={`/cursos/${cursoId}`}>
        ← Volver al curso
      </Link>

      <h1>{curso?.titulo}</h1>

      <hr />

      <h2>{leccion.titulo}</h2>

      <span className="badge bg-primary mb-3">
        {leccion.tipo}
      </span>

      <div className="card p-4 mb-4">
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {leccion.contenido_texto}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h4>Video de apoyo</h4>

        <div
          style={{
            background: '#0f172a',
            color: 'white',
            borderRadius: '16px',
            height: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <h2>▶</h2>
          <p>Video simulado de la lección</p>
          <small>{leccion.titulo}</small>
        </div>
      </div>

      <AreaPractica leccion={leccion} />

      {usuario?.rol === 'estudiante' && (
        <div className="mt-4 mb-5">
          {progreso && (
            <>
              <p>
                Progreso del curso: {progreso.completadas} de {progreso.total} lecciones
              </p>

              <div className="progress mb-3">
                <div
                  className="progress-bar"
                  style={{ width: `${progreso.porcentaje}%` }}
                >
                  {progreso.porcentaje}%
                </div>
              </div>
            </>
          )}

          {completada ? (
            <button className="btn btn-secondary me-2" disabled>
              Lección completada
            </button>
          ) : (
            <button
              className="btn btn-success me-2"
              onClick={marcarCompletada}
            >
              Marcar como completada
            </button>
          )}

          {leccionAnterior && (
            <Link
              className="btn btn-outline-primary me-2"
              to={`/cursos/${cursoId}/lecciones/${leccionAnterior.id}`}
            >
              ← Lección anterior
            </Link>
          )}

          {siguienteLeccion && (
            <Link
              className="btn btn-primary"
              to={`/cursos/${cursoId}/lecciones/${siguienteLeccion.id}`}
            >
              Continuar a la próxima lección
            </Link>
          )}

          {!siguienteLeccion && completada && (
            <Link className="btn btn-dark" to={`/cursos/${cursoId}`}>
              Finalizar curso
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default LeccionDetalle;