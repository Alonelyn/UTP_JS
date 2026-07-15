import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg lms-navbar">
      <Link className="lms-brand" to="/dashboard">
        LMS
      </Link>

      {usuario?.rol === 'admin' && (
        <Link className="lms-admin-tag" to="/admin">
          Admin
        </Link>
      )}

      {usuario?.rol === 'instructor' && (
        <Link className="lms-admin-tag" to="/docente" style={{ background: 'var(--emerald)' }}>
          Docente
        </Link>
      )}

      <button className='btn btn-sm btn-outline-light ms-3' onClick={alternarTema}>
        {tema === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
      </button>

      <div className="lms-links">
        <Link className="lms-link" to="/dashboard">Dashboard</Link>
        <Link className="lms-link" to="/cursos">Cursos</Link>
        <Link className="lms-link" to="/perfil">Perfil</Link>
        <button className="lms-link lms-logout" onClick={cerrarSesion}>
          Salir
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
