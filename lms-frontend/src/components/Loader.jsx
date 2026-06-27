import '../styles/loader.css';

function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="loader-spinner"></div>
        <h4>LMS Academy</h4>
        <p>{texto}</p>
      </div>
    </div>
  );
}

export default Loader;