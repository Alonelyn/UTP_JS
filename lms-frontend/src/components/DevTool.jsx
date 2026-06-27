import { useEffect, useState } from 'react';

function DevTool() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [abierto, setAbierto] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  const agregarLog = (tipo, mensaje, extra = '') => {
    setLogs((prev) => [
      {
        tipo,
        mensaje: String(mensaje),
        extra: extra ? String(extra) : '',
        hora: new Date().toLocaleTimeString()
      },
      ...prev
    ].slice(0, 80));
  };

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      agregarLog('log', args.join(' '));
      originalLog(...args);
    };

    console.warn = (...args) => {
      agregarLog('warn', args.join(' '));
      originalWarn(...args);
    };

    console.error = (...args) => {
      agregarLog('error', args.join(' '));
      originalError(...args);
    };

    const capturarError = (event) => {
      agregarLog('error', event.message, event.filename);
    };

    const capturarPromesa = (event) => {
      agregarLog('error', 'Promesa rechazada', event.reason);
    };

    window.addEventListener('error', capturarError);
    window.addEventListener('unhandledrejection', capturarPromesa);

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener('error', capturarError);
      window.removeEventListener('unhandledrejection', capturarPromesa);
    };
  }, []);

  const logsFiltrados =
    filtro === 'todos'
      ? logs
      : logs.filter((log) => log.tipo === filtro);

  if (!abierto) {
    return (
      <button className="devtool-btn" onClick={() => setAbierto(true)}>
        DEV
      </button>
    );
  }

  return (
    <div className="devtool-panel">
      <div className="devtool-header">
        <div>
          <strong>DevTool LMS</strong>
          <small>
            {usuario
              ? `${usuario.nombre} · ${usuario.rol}`
              : 'Sin sesión'}
          </small>
        </div>

        <button className="devtool-close" onClick={() => setAbierto(false)}>
          ↓
        </button>
      </div>

      <div className="devtool-stats">
        <div>
          <span>Logs</span>
          <strong>{logs.length}</strong>
        </div>

        <div>
          <span>Errores</span>
          <strong>{logs.filter((l) => l.tipo === 'error').length}</strong>
        </div>

        <div>
          <span>Ruta</span>
          <strong>{window.location.pathname}</strong>
        </div>
      </div>

      <div className="devtool-filters">
        {['todos', 'log', 'warn', 'error'].map((item) => (
          <button
            key={item}
            className={filtro === item ? 'active' : ''}
            onClick={() => setFiltro(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="devtool-user">
        <p><strong>Usuario:</strong> {usuario?.email || 'No autenticado'}</p>
        <p><strong>Rol:</strong> {usuario?.rol || '-'}</p>
        <p><strong>Tema:</strong> {document.documentElement.getAttribute('data-theme')}</p>
      </div>

      <div className="devtool-body">
        {logsFiltrados.length === 0 ? (
          <p className="devtool-empty">Sin registros.</p>
        ) : (
          logsFiltrados.map((log, index) => (
            <div key={index} className={`devtool-log ${log.tipo}`}>
              <div>
                <strong>[{log.hora}] {log.tipo.toUpperCase()}</strong>
              </div>

              <span>{log.mensaje}</span>

              {log.extra && (
                <small>{log.extra}</small>
              )}
            </div>
          ))
        )}
      </div>

      <div className="devtool-footer">
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => agregarLog('log', 'Prueba manual del DevTool')}
        >
          Test
        </button>

        <button
          className="btn btn-sm btn-danger"
          onClick={() => setLogs([])}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default DevTool;