import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/modulos.css';

function Lecciones() {
  const [lecciones, setLecciones] = useState([]);

  const listarLecciones = async () => {
    const response = await api.get('/lecciones');
    setLecciones(response.data);
  };

  useEffect(() => {
    listarLecciones();
  }, []);

  return (
    <div className="page-shell">
      <div className="modulos-head">
        <p className="eyebrow" style={{ '--accent': 'var(--azul)' }}>Bitácora</p>
        <h1 className="page-title">Gestión de lecciones</h1>
        <p className="page-sub">Ordenadas según su número de secuencia</p>
      </div>
      
      {lecciones.length === 0 && (
        <p className="modulos-vacio">Aún no hay lecciones registradas.</p>
      )}

      <div className="modulos-lista">
        {lecciones.map((leccion) => (
          <div key={leccion.id} className="modulo-fila">
            <div className="modulo-orden">{leccion.orden}</div>
            <div className="modulo-cuerpo">
              <h3>{leccion.titulo}</h3>
              <p className="modulo-meta">
                Tipo: {leccion.tipo} · Módulo ID: {leccion.modulo_id} · {leccion.puntos_otorgados} pts
              </p>
              <p className="modulo-texto">{leccion.contenido_texto}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lecciones;
